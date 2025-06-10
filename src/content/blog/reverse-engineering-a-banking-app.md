---
title: Creating a custom UPI VPA by bypassing advanced anti-reversing techniques in a banking app
tags: [android, frida, "reverse engineering"]
pubDate: "Apr 27 2025"
image: /icici.png
description: A deep dive into the process of generating custom UPI VPAs within a mobile banking app by bypassing security protections. Explore techniques for overcoming anti-reversing and Anti-Frida measures, including native library analysis.
author: Navaneeth
isDraft: false
---

**Discussion links:** [r/Magisk](https://www.reddit.com/r/Magisk/comments/1ku2rre/article_creating_custom_upi_vpa_by_bypassing/) | [r/netsec](https://www.reddit.com/r/netsec/comments/1ku2sst/creating_custom_upi_vpa_by_bypassing_protecttai/)

## Takeaway

- Get a custom UPI VPA / UPI ID like `anything@bankxyz`.
- Learn how to bypass and reverse engineer advanced anti reversing techniques.
- Learn how to bypass Anti-Frida measures.
- Learn how to reverse engineering Android native libraries.

My goal in starting this project was to create custom payment IDs where it would otherwise not have been possible. Advantages of having a short UPI ID include ease of remembering, an inside joke for friend groups and simpler to communicate. So what is a UPI ID?

## UPI

Unified Payments Interface is an Indian instant payment system as well as **protocol** developed by the National Payments Corporation of India (NPCI). Everyone in India use UPI for day to day payments, nobody uses cards for payments.

UPI allows every bank (ICICI, Federal Bank) and third-party apps (GPay, PhonePe) to interact with each other.

So what is UPI ID? It is an alias for your bank account. In the case of HDFC bank app, we can have one UPI ID link to another bank for example: HDFC UPI ID for Federal Bank. A person can have several UPI IDs, for example one UPI ID for each app.

## Initial analysis

Now that I know we have the ability to choose the UPI IDs, I thought we can intercept the request and change the UPI ID to our desired one. With this I started analyzing the APK. First thing I always do is open JADX-GUI and look at the AndroidManifest.xml and MainActivity. To get the APK I used adb pull.

![AndroidManifest - Finding main activity](../../images/reverse-engineering-icici.png)

The MainActivity extends `CordovaActivity` which means it's a React Native app, another way to find out if it's a React Native app is to check for the presence of `index.android.bundle`.

![Cordova](../../images/reverse-engineering-icici-cordova.png)

## Attempting to locate Anti-Frida detection 

After understanding what type of APK I will be dealing with, I started dynamic analysis with Frida so that I can easily verify if I am looking at the correct class from JADX. First thing I noticed after launching the app with Frida is the Frida connection closes immediately.

![Process terminated Frida](../../images/reverse-engineering-icici-proc-term.png)

So this indicates Anti-Frida techniques. To trace which part of the code the Anti-Frida code is located I started hooking interesting functions which is called early. I used `Thread.sleep(10)` to check if the connection closes after 5 seconds that means the Anti-Frida code was already called before the hook. I also used `frida-trace -j 'CLASS!FUNCTION'` to check if a function is being called in the first place.

After doing this for sometime I found that after `System.loadLibrary` is called the connection immediately closes. So this means a native library is doing the Anti-Frida stuff. Also I would always encounter a crash after hooking `System.loadLibrary` because of [this](https://github.com/rovo89/XposedBridge/issues/87):

> This is one of the methods that you shouldn't hook. Have a look at the implementation: [https://android.googlesource.com/platform/libcore/+/android-6.0.1_r16/luni/src/main/java/java/lang/System.java#1072](https://android.googlesource.com/platform/libcore/+/android-6.0.1_r16/luni/src/main/java/java/lang/System.java#1072)
> 
> It uses the class loader of the caller, which is usually the app, but would be Xposed as soon as you hook it. Please hook Runtime.loadLibrary() instead.

![Load Library](../../images/reverse-engineering-icici-load-library.png)

Now while I was running this in an Android 11 emulator I was not able to get the base address of the loaded module via `Process.findModuleByName` (which I was using to check whether the library was loaded fully so I can hook it's functions) but the library was loaded in memory with no module name. I suspect it's because of ARM translation going on and it was doing some sort of manual mapping. The APK only had arm64-v8a native libraries and no x86_64 library which was my emulator's architecture.

So going forward I did all my testing in my real Android device with MagiskHide turned off otherwise you cannot do early-instrumentation with `frida -U -f <launch-app>`.

In my real device I was able to hook `System.loadLibrary` and get the base address of the module right after it's been loaded. Example code:

```js
Java.perform(function() {
    const System = Java.use('java.lang.System');
    const Runtime = Java.use('java.lang.Runtime');
    const SystemLoad_2 = System.loadLibrary.overload('java.lang.String');
    const VMStack = Java.use('dalvik.system.VMStack');

    SystemLoad_2.implementation = function(library) {
        send("Loading dynamic library => " + library);
        try {
            const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), library);
            if(library === 'libprotecttor-native-lib') {
				// hook native lib functions
            }
            return loaded;
        } catch(ex) {
            console.log(ex);
        }
    };
});
```


Now that we have the ability to hook functions right after the native library is loaded. We can start reverse engineering the native library.

## Protector Company

The library responsible for closing the Frida connection is `libprotecttor-native-lib.so`, so what is this native library? It is a RunTime Application Self-Protection solution developed by ~~[Censored](https://google.com)~~.

Other native libraries important in XYZ bank app:

| Name                            | Description                        | Hash                                                             |
| ------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| libprotecttor-native-lib.so     | Main module                        | 124d6b42808c022d675c8eb5e928f2c810e5f5fe73b92fb019c4097f66cdc87d |
| libapp-protecttor-native-lib.so | Rest of libprotectt, not important | 5ecdc71188e9fa6bc47fa23cd83bcbce95c2805fcc7754b25a275aa291893709 |
| libnative-lib.so                | Gets API URL, not important        | 84445f13e7a1e39ba70f7ac3faaf5ac75354f0743a81f91b4bb586608c44a487 |

## Extracting native libraries

To reverse engineer the native library I first have to get the .so files. First I checked the unzipped apk and didn't find any lib folder. After lots of research I found out about split apks and extractNativeLibs.

`android:extractNativeLibs="false"` means the main APK won't store any libraries but will instead store native libraries in architecture specific APKs to save download bandwidth.

![Extract Native Libs False](../../images/reverse-engineering-icici-extract-native-false.png)
*AndroidManifest.xml*

How to get split APK?

```bash
$ adb shell pm path com.csam.xyzbank.bank.imobile
package:/data/app/~~UOYiAXaSPBW0Ae8atXOrqg==/com.csam.xyzbank.bank.imobile-SYp1oonK6muaef0keHyLGw==/base.apk
package:/data/app/~~UOYiAXaSPBW0Ae8atXOrqg==/com.csam.xyzbank.bank.imobile-SYp1oonK6muaef0keHyLGw==/split_config.arm64_v8a.apk <-- EXTRACT THIS
package:/data/app/~~UOYiAXaSPBW0Ae8atXOrqg==/com.csam.xyzbank.bank.imobile-SYp1oonK6muaef0keHyLGw==/split_config.xxhdpi.apk
```

Now we can just adb pull and the unzipped directory should have the libraries uncompressed.

![Split APK Directory](../../images/reverse-engineering-icici-split-apk-dir.png)

## Reverse engineering Android native libraries

After loading `libprotecttor-native-lib.so` binary in IDA, (which I knew from my loadLibrary hook) I jumped into the entry point and found a thread being created with a startRoutine. It always verifies the checksum of the native library.

![Native entry point](../../images/reverse-engineering-icici-native-entry-point.png)

The startRoutine finally calls the `F1` function which is just an infinite loop that calls two functions if the app is being used. If not it sleeps using the function `nanosleep` and checks again.

![Main Thread](../../images/reverse-engineering-icici-mainThread.png)

### Function 1 reversed

With the help of ChatGPT I was able to find out what this function does pretty fast. This function checks all thread names of the process via `/proc/self/task/%s/status` if it matches any of these:

- gmain
- gum-js-loop

If it does it calls it's exitClause which in turn calls `exit(1)` and does other things which is not very important.

It also checks if `strstr` or `opendir` has been hooked by comparing bytes with `libc.so` on disk.

```c
__int64 mwMainThread()
{
  ...omitted for brevity
  v73 = *(_QWORD *)(_ReadStatusReg(ARM64_SYSREG(3, 3, 13, 0, 2)) + 40);
  v0 = rotMinus2("/rtqe/ugnh/vcum==");
  dirPtr = opendir(v0);
  if ( !dirPtr )
  {
    if ( check_open()
      || (v50 = rotMinus2("qrgpfkt=="), checkForFunctionHook(v50)) // opendir
      || (v51 = rotMinus2("uvtuvt=="), success = checkForFunctionHook(v51), (success & 1) != 0) ) // strstr
    {
      __android_log_print(4, "AppProtectt", "G-M..1.1");
      v53 = "et";
exitClause:
      callScanCore(v53);
      parse_maps_and_change_permissions();
      exit(1);
    }
    goto LABEL_80;
  }
  v2 = dirPtr;
  v3 = readdir(dirPtr);
  if ( v3 )
  {
    v54 = 0;
    while ( 1 )
    {
	  ...omitted
      procSelfTaskStatusFmtStr = rotMinus2("/rtqe/ugnh/vcum/%u/uvcvwu=="); // /proc/self/task/%s/status
      formatStr((__int64)taskSelfFmtBuf, 256LL, 256LL, procSelfTaskStatusFmtStr, v4);
      v13 = linux_eabi_syscall(__NR_openat, -100, (const char *)taskSelfFmtBuf, 0x80000);
      if ( v13 )
      {
        v14 = buffer;
		...omitted
        gumJsLoop = rotMinus2("iwo-lu-nqqr=="); // gum-js-loop
        gmain = rotMinus2("iockp==");           // gmain
        v21 = gumJsLoop + 1;
        if ( !*gumJsLoop )
          goto gumExitClause;
gumExitClause:
          FK[0] = "GA";
          __android_log_print(4, "AppProtectt", "G-M..1");
          v53 = "gum";
          goto exitClause;
        }
		...
        close(v13);
      }
	...
    if ( info1[0] == "not found" )
      info1[0] = "LEO";
  }
  return success;
}
```

### Function 2 reversed

This function is kinda of similar to the above function but checks if any file descriptor links to linjector. This is not important to Anti-Frida.

```cpp
__int64 sub_599EC()
{
  ...omitted for brevity
  v52 = *(_QWORD *)(_ReadStatusReg(ARM64_SYSREG(3, 3, 13, 0, 2)) + 40);
  v0 = rotMinus2("/rtqe/ugnh/hf=="); // /proc/self/fd
  v1 = opendir(v0);
  v2 = v1;
  if ( !v1 )
  {
    if ( check_open()
      || (v27 = rotMinus2("qrgpfkt=="), checkForFunctionHook(v27)) // opendir
      || (v28 = rotMinus2("uvtuvt=="), checkForFunctionHook(v28)) ) // strstr
    {
      __android_log_print(4, "AppProtectt", "L-J..1.1");
      v30 = "et";
exitClause:
      callScanCore(v30);
      parse_maps_and_change_permissions();
      exit(1);
    }
    goto successClause;
  }
  v3 = readdir(v1);
  if ( v3 )
  {
    v4 = v3;
    v5 = 0;
    while ( 1 )
    {
	  ...
      *(_OWORD *)file = 0u;
      v36 = 0u;
      v6 = rotMinus2("/rtqe/ugnh/hf/%u=="); // /proc/self/fd/%s
      formatStr((__int64)file, 256LL, 256LL, v6, v4->d_name);
      lstat(file, (struct stat *)v31);
      if ( (v32 & 0xF000) == 40960 )
      {
        v7 = linux_eabi_syscall(__NR_readlinkat, -100, file, (char *)v51, 0x100u);
        linjector = rotMinus2("nkplgevqt=="); // linjector
        if ( (v5 & 1) == 0 )
        {
          pid = getpid();
          formatStr((__int64)&buf, 32LL, 32LL, "%s%s%s%d%s", "pr", "oc", "/", pid, "/fd");
...
exitClauseParent:
          FK[0] = "LFA";
          __android_log_print(4, "AppProtectt", "L-J..1");
          v30 = "lin";
          goto exitClause;
        }
      v4 = readdir(v2);
...
successClause:
    if ( globalStatus == "not found" )
      globalStatus = "LEO";
  }
  return closedir(v2);
}
```

## Bypassing native library checks

When checking my phone, I was being detected because Frida creates a gmain thread. There are many ways to bypass this but I just hooked these two functions.

The way I did that is by hooking  `pthread_create` and after registering the startRoutine hook, I hook the two functions. I just add an offset from the base address because this is a temporary project. After the library is loaded I unhook `pthread_create`.

```js
    let threadHook = null;
    const pthread_create_ptr = Module.findExportByName(null, "pthread_create");
    console.log("[+] Found pthread_create at: " + pthread_create_ptr);
    System.loadLibrary.implementation = function(library) {
        if (library == "protectt-native-lib") {
            threadHook = Interceptor.attach(pthread_create_ptr, {
                onEnter: function(args) {
                    this.threadPtr = args[0];
                    this.startRoutine = args[2];
                    this.routineArg = args[3];

                    // Hooking first startRoutine after libprotectt is loaded is enough
                    if (!hooked) {
                        const startRoutineHook = Interceptor.replace(this.startRoutine, new NativeCallback(() => {
                            console.log("[+] Thread function started");

                            var targetModule = Process.findModuleByName("libprotectt-native-lib.so");
                            if (targetModule) {
                                const baseAddr = targetModule.base;

                                Interceptor.replace(baseAddr.add(0x59E24), new NativeCallback(() => {
                                    console.log("[+] mainThread Hook");
                                }, 'void', []));

                                Interceptor.replace(baseAddr.add(0x599EC), new NativeCallback(() => {
                                    console.log("[+] mainThread2 Hook");
                                }, 'void', []));
                            }
                        }, 'void', ['pointer']));

                        hooked = true;
                        threadHook.detach();
                    }
                },
            });
        }

        Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), library);
        const classLoader = VMStack.getCallingClassLoader();

        if (library == "protectt-native-lib" && threadHook) {
            threadHook.detach();
            threadHook = null;
        }
    };
```

## Bypassing root detection

With this I was able to bypass the Anti-Frida detection but now I was getting root detected. 

![Root Detection](../../images/reverse-engineering-icici-root-detection.png)

So I tried searching for the string "Your Device is rooted. For security reasons..." in the APK but no results were found. I searched in `/data/data` and `/data/user` still no results.

With no luck I tried searching for "Close App" again no luck. I tried with case insensitive and partial strings like "Your Device" etc... Still no luck.

I decided to change my approach and search for Android APIs that exit the app, [Stackoverflow](https://stackoverflow.com/questions/17719634/how-to-exit-an-android-app-programmatically) has a good list.


- finishAffinity
- finishAndRemoveTask
- getActivity().finish();
- System.exit(0)

I tried searching for these with JADX code search and found a few interesting functions. It's likely only the main one's are relevant. And we focus our search inside the ai package.

![System.exit functions](../../images/reverse-engineering-icici-system-exit.png)

After seeing a few of these functions there is a common function `companion.d()`. It's called by everything that closes the apps. So instead of hooking all the above functions, we can just hook one and get the stacktrace.

![Common code](../../images/reverse-engineering-icici-common.png)

I hook this so I can see what exactly is calling it up the stack. So I can hook the parent function and bypass the root detection. This was by far the hardest part because there is at least 25 functions that need to be traced up the stack using Frida + JADX. I found several ways to bypass ~~Censored~~ but I will be showing part of the process as the actual process is TOO long and I am not able to retrace what I did lol.

```js
let a = Java.use("protecttor.app.security.main.g$a");
a["d"].implementation = function () {
	console.log(`a.d is called`);
	let result = this["d"]();
	console.log(`a.d result=${result}`);
	console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()))
	return result;
};
```

Once we click "Close App" the last stack trace should give us the correct function. 

```bash
a.d is called
a.d result=[object Object]
java.lang.Exception
        at protecttor.app.security.main.g$a.d(Native Method)
        at protecttor.app.security.main.scan.ScanAlerts.x(Unknown Source:49)
        at protecttor.app.security.main.scan.ScanAlerts.V(Unknown Source:11)
        at protecttor.app.security.main.scan.ScanAlerts.d0(Unknown Source:3)
        at protecttor.app.security.main.scan.ScanAlerts.f(Unknown Source:0)
        at protecttor.app.security.main.scan.t.onClick(Unknown Source:4)
        at android.view.View.performClick(View.java:8028)
        at android.view.View.performClickInternal(View.java:8005)
        at android.view.View.-$$Nest$mperformClickInternal(Unknown Source:0)
        at android.view.View$PerformClick.run(View.java:31233)
        at android.os.Handler.handleCallback(Handler.java:959)
        at android.os.Handler.dispatchMessage(Handler.java:100)
        at android.os.Looper.loopOnce(Looper.java:258)
        at android.os.Looper.loop(Looper.java:356)
        at android.app.ActivityThread.main(ActivityThread.java:8837)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:598)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:896)
```

![](../../images/reverse-engineering-icici-t-click.png)

```
ScanAlerts.U is called: btnBlock=androidx.appcompat.widget.AppCompatButton{6e89fa8 VFED..C.. ......I. 0,0-0,0 #7f0a03a7 app:id/btn_sdk_btn_block}, mBuilder=android.app.AlertDialog@5a
15ac1, btnIgnore=androidx.appcompat.widget.AppCompatButton{1a0a266 VFED..C.. ......I. 0,0-0,0 #7f0a03a8 app:id/btn_sdk_btn_ignore}, response=Java.Field{                              
        holder: protecttor.app.security.shouldnotobfuscated.dto.i@3c469a7,                
        fieldType: 2,                                                                                                                                                                 
        fieldReturnType: Ljava/lang/String;,                                                                                                                                          
        value: Your Device is rooted. For security reasons we have stopped the Mobile Banking Services on rooted devices.,                                                            
}, checkBoxForceAccept=androidx.appcompat.widget.AppCompatCheckBox{fc0e54 GFED..C.. ......I. 0,0-0,0 #7f0a0885 app:id/force_accept}                                                   
[+] Spoofing adb_enabled to 0 (OFF)                                                                                                                                                   
java.lang.Exception                                                                                                                                                                   
        at protecttor.app.security.main.scan.ScanAlerts.U(Native Method)                                                                                                             
        at protecttor.app.security.main.scan.ScanAlerts.C(Unknown Source:1084)                                                                                                       
        at protecttor.app.security.main.scan.ScanAlerts.a0(Unknown Source:289)                                                                                                       
        at protecttor.app.security.main.g.C1(Unknown Source:10)                                                                                                                      
        at protecttor.app.security.main.g.o(Unknown Source:0)                                                                                                                        
        at protecttor.app.security.main.c.run(Unknown Source:2)
        at android.os.Handler.handleCallback(Handler.java:959
```

![](../../images/reverse-engineering-icici-b1.png)

Keep repeating this process and trying things, you should trace it to a call in `IMOBILE` or `IMobileApplication`. I will now move onto the findings.

![](../../images/reverse-engineering-icici-b1-parent.png)

### IMOBILE.onCreate

`com.csam.xyzbank.bank.imobile.IMOBILE.onCreate` calls `getLoggingStatus`. This function has nothing to do with logging but does security checks, ~~Censored~~ is known to misdirect reverse researchers using fake naming, calling the actual function in an error exception, using decoy functions, among other techniques.

![](../../images/reverse-engineering-icici-oncreate.png)

`getLoggingStatus` is a native function, we have to check all native libraries for this JNI function.

![](../../images/reverse-engineering-icici-get-logging-status.png)

The function was located in `libnative-lib.so`, IDA shows it calls the function `com.csam.xyzbank.bank.imobile.IMOBILE.logStatus()`.

![](../../images/reverse-engineering-icici-native-logging.png)

Here we finally see `logStatus` calls `log` and in turn calls some security checks.

![](../../images/reverse-engineering-icici-dsgf.png)

### IMOBILE.onResume

We just need to hook `wVar.m(this, this);` and `protecttor.app.security.common.helper.h0.f1361a.z(this, this)`.

![](../../images/reverse-engineering-icici-onresume-checks.png)

### Root bypass script

These are all the security checks called from the MainActivity, we want to block everything from the root so it doesn't run in the background or start some `Timer`. Finally putting all the bypasses together we get:

```js
// Native library calls from IMOBILE.onCreate
let IMOBILE = Java.use("com.csam.xyzbank.bank.imobile.IMOBILE");
IMOBILE["logStatus"].implementation = function () {
	console.log(`IMOBILE.logStatus is called`);
};

// ActivityLifecycleCallbacks
let LoggerController = Java.use("protecttor.app.security.main.LoggerController");
LoggerController["i"].implementation = function (context, activity) {
	console.log(`LoggerController.i is called: context=${context}, activity=${activity}`);
};

// IMOBILE.onResume Check1
let h0 = Java.use("protecttor.app.security.common.helper.h0");
h0["z"].implementation = function (context, activity) {
console.log(`h0.z is called: context=${context}, activity=${activity}`);
};

// IMOBILE.onResume Check2
let w = Java.use("protecttor.app.security.common.helper.w");
w["m"].implementation = function (context, activity) {
	console.log(`w.m is called: context=${context}, activity=${activity}`);
};
```

## Finally getting a custom VPA

After launching my script with [https://codeshare.frida.re/@akabe1/frida-multiple-unpinning/](https://codeshare.frida.re/@akabe1/frida-multiple-unpinning/) I was able to view the HTTPS traffic. But unfortunately it was encrypted so we can't just modify the request.

![](../../images/reverse-engineering-icici-zap.png)

Lets search for the string "encResponse" so we can print the strings as it's being encrypted and decrypted. There were only 2 relevant results and one function is a wrapper for the below function so lets hook it. This condition calls `w0` if the JSON has `encResponse`.

![](../../images/reverse-engineering-icici-dsf.png)

w0 calls `com.Discover.Security.a` etc. These are the functions we want to hook. We need to hook all the functions in these classes because which function is chosen is random.

![](../../images/reverse-engineering-icici-truirt.png)

This above screenshot is only for decryption, so the code I used to hook all encryption and decryption functions is:

```js
let a = Java.use("com.Discover.Security.a");
a["a"].implementation = function (textToDecrypt) {
	let result = this["a"](textToDecrypt);
	console.log(`a.a result=${result}`);
	return result;
};
a["b"].implementation = function (textToEncrypt) {
	console.log(`a.b is called: textToEncrypt=${textToEncrypt}`);
	let result = this["b"](textToEncrypt);
	console.log(`a.b result=${result}`);
	return result;
};

let b = Java.use("com.Discover.Security.b");
b["a"].implementation = function (key, encryptedValue) {
	let result = this["a"](key, encryptedValue);
	console.log("Response", JSON.stringify(JSON.parse(result), null, 4));
	return result;
};
b["b"].implementation = function (key, value) {
	console.log(`com.Discover.Security.b.b secureString ${key}`);

	const json = JSON.parse(value, null, 4);
	console.log(JSON.stringify(json, null, 4));

	let result = this["b"](key, value);
	return result;
};
```

Now that we can see the traffic, I wanted to check the JSON sent just before clicking create UPI ID. There is a VPA attribute which we can modify to our desired one. There are many ways to do this but I just hard coded the VPA in my Frida script. Unfortunately no screenshot for this. During my testing a UPI ID of at least 5 characters was required. All you need to do to get a custom UPI ID is modify the above code to this:

```js
b["b"].implementation = function (key, value) {
	console.log(`com.Discover.Security.b.b secureString ${key}`);

	const json = JSON.parse(value, null, 4);
	if (json.VPA === "upi_id_from_the_list") {
		json.VPA = "YOUR_DESIRED_ID@bankxyz";
		console.log("CHANGED VPA");
		value = JSON.stringify(json);
	}

	console.log(JSON.stringify(json, null, 4));

	let result = this["b"](key, value);
	return result;
};
```

And voila!

![](../../images/customid.png)
