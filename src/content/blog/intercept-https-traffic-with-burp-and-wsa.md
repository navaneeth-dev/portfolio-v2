---
layout: "../../layouts/BlogPost.astro"
title: Intercept HTTPS traffic with Burp and Windows Subsystem For Android
tags: [android, wsa]
pubDate: "Jul 2 2022"
image: /resource/phone.jpg
description: In this blog we will take a look at how to get windows subsystem for android to work with burp suite for bug bounties, etc. Earlier there was only one option which was to use Android Studio emulator with arm64 image. This method is faster, less system intensive and most apps just work.
---

## Requirements

- Windows 11
- Burp suite
- Python3
- Pip

## Installing WSA (Windows subsystem for android)

First search for windows features and enable hypervisor and virtual machine platform.

Then lets use [MagiskOnWSA](https://github.com/LSPosed/MagiskOnWSA) to install WSA and play store. See the video on how to install. Select pico for minimal google play apps and download the zip after the build finishes.

Magisk and Play store should pop up now, just sign in and close both.

## Installing Frida Server And Objection

Download [frida-server](https://github.com/frida/frida/releases) latest x64 version and run the following commands. Objection uses frida as a backend so we need to run it first to use objection.

Then lets install objection. This will install `objection`, `frida-ps`, `frida` etc.

```ps
PS C:\Users\gamep> pip3 install objection
```

## Export Burp Suite Certificate

Now lets gather all the files like the certificate and frida-server to upload to the android device.

Lets bind the the correct address:

![6d4ea50a8b4a8a17458ba3a590972fcd.png](/resource/68d28a40d7044623b1dfd6ff8cd2eeee.png)

Now lets export the certificate:

![1038e2a452dee9af9bb4cbc9d6cac6d7.png](/resource/a1791009564e4f8ea177408fef87a64f.png)

![aff46ce101b921e94c0024cfaed1d0e3.png](/resource/66b79207ef164f84825a4823ed7887b9.png)

## Enabling Developer Mode

Now we need to enable developer mode so that we can connect to adb. Search for Android and goto developer tab and enable developer mode.

## Setting up Frida Server And Objection

```ps
PS C:\Users\gamep> adb connect 127.0.0.1:58526
adb:connected
PS C:\Users\gamep> adb push .\Downloads\frida-server-15.1.27-android-arm64 /data/local/tmp/frida-server
.\Downloads\frida-server-15.1.27-android-arm64: 1 file pushed, 0 skipped. 51.8 MB/s (47172184 bytes in 0.869s)
PS C:\Users\gamep> adb push .\Downloads\cacert.der /sdcard/Downloads
PS C:\Users\gamep> adb shell
redfin:/ $ cd /data/local/tmp
redfin:/data/local/tmp $ su
redfin:/data/local/tmp $ chmod 777 ./frida-server
redfin:/data/local/tmp # ./frida-server &
[1] 5023
redfin:/data/local/tmp # exit
```

Now that the frida server is running lets setup the wifi proxy settings.

## Wifi Proxy

![c29267d21680d44f8d4ad99a4db3a208.png](/resource/aa8e4197e5c74d17928c7bdffc965393.png)

Search ceritifcate.

![a942265ea40ae83577a4451539f8d9bb.png](/resource/d954add652104bfea25924983594ea64.png)

![92ce8bc35306f3237cabfa9e02c32e2a.png](/resource/702f9306e11a4109a1844b22130daa2e.png)

Great now the certificate is installed. Now search for wifi click edit and put your proxy ip and port is 8080 default (you have to use keyboard because there is some bug with mouse).

## SSL Pinning Bypass

You should see some requests coming to burp now but many apps have ssl cert pinned and we cannot use our cert to decrypt the traffic. So we need a bypass for that, this is where ssl pinning bypass comes in.

```ps
objection --gadget com.glassdoor.app explore -s 'android sslpinning disable'
```

![bcde70fe384df091c8da366d9714fc93.png](/resource/a788924a30bb4fbda8a1ed4835c6361b.png)

The app should automatically launch and now we can inspect the traffic.

![cb447513bd5b8ca6ee4e0d2860a87e76.png](/resource/7679fc5ad6c5417886911ae825b95376.png)

## Additional Resources

- [How to setup Android Subsystem on Windows 11 VIDEO GUIDE](https://youtu.be/cOJbzmZTKvM)
- xda-developers
- [MagiskOnWSA](https://github.com/LSPosed/MagiskOnWSA)
