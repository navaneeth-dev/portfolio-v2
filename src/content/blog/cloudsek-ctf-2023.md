---

title: Cloudsec CTF 2023
tags: [ctf]
pubDate: "Sep 25 2023"
image: /sveltekit.png
description: Solutions for Cloudsek's CTF
---

Cloudsek has released a small CTF for hiring, I just did it for fun. Here is the writeup with solutions. The thing I liked about this CTF is simple and no bruteforcing required.

## Bases

![](/cloudsek-ctf-2023-bases.png)

I just install pwntools on a VPS and wrote a simple script:

```py
from pwn import *

r = remote('43.204.152.119', 1337)
for i in range(100):
    print(i)
    l = r.recvuntil(b'\n')
    l = l.split(b"\t")
    bstr = l[1][:-1]
    decoded = b64d(bstr)
    if b"flag" in decoded:
        print("===== FOUND=====")
    print(bstr, decoded)
    r.sendline(decoded)

r.interactive()
```

## SHA Juggler

![](/cloudsek-ctf-2023-sha-web.png)

Ctrl + U  

Shows the source:
```
<script>
    const isThisNormal = "50 44 39 77 61 48 41 4b 4c 79 38 67 65 57 39 31 58 32 5a 76 64 57 35 6b 58 32 31 6c 4c 6e 42 6f 63 41 70 70 5a 69 41 6f 61 58 4e 7a 5a 58 51 6f 4a 46 39 48 52 56 52 62 4a 32 68 68 63 32 67 6e 58 53 6b 70 49 48 73 4b 49 43 41 67 49 47 6c 6d 49 43 67 6b 58 30 64 46 56 46 73 6e 61 47 46 7a 61 43 64 64 49 44 30 39 50 53 41 69 4d 54 41 35 4d 7a 49 30 4d 7a 55 78 4d 54 49 69 4b 53 42 37 43 69 41 67 49 43 41 67 49 43 41 67 5a 47 6c 6c 4b 43 64 45 62 79 42 35 62 33 55 67 64 47 68 70 62 6d 73 67 61 58 52 7a 49 48 52 6f 59 58 51 67 5a 57 46 7a 65 54 38 2f 4a 79 6b 37 43 69 41 67 49 43 42 39 43 69 41 67 49 43 41 6b 61 47 46 7a 61 43 41 39 49 48 4e 6f 59 54 45 6f 4a 46 39 48 52 56 52 62 4a 32 68 68 63 32 67 6e 58 53 6b 37 43 69 41 67 49 43 41 6b 64 47 46 79 5a 32 56 30 49 44 30 67 63 32 68 68 4d 53 67 78 4d 44 6b 7a 4d 6a 51 7a 4e 54 45 78 4d 69 6b 37 43 69 41 67 49 43 42 70 5a 69 67 6b 61 47 46 7a 61 43 41 39 50 53 41 6b 64 47 46 79 5a 32 56 30 4b 53 42 37 43 69 41 67 49 43 41 67 49 43 41 67 61 57 35 6a 62 48 56 6b 5a 53 67 6e 5a 6d 78 68 5a 79 35 77 61 48 41 6e 4b 54 73 4b 49 43 41 67 49 43 41 67 49 43 42 77 63 6d 6c 75 64 43 41 6b 5a 6d 78 68 5a 7a 73 4b 49 43 41 67 49 48 30 67 5a 57 78 7a 5a 53 42 37 43 69 41 67 49 43 41 67 49 43 41 67 63 48 4a 70 62 6e 51 67 49 6b 4e 54 52 55 74 37 62 6a 42 66 4e 47 78 68 5a 31 38 30 58 33 56 39 49 6a 73 4b 49 43 41 67 49 48 30 4b 66 53 41 4b 50 7a 34 3d";
  </script>
<title>The SHA Juggler</title>
</head>
<body>
<h1>Do you Know where to Look?</h1>
</body>
</html>
```

![](/cloudsek-ctf-2023-cyberchef-found.png)

```php
<?php
// you_found_me.php
if (isset($_GET['hash'])) {
    if ($_GET['hash'] === "10932435112") {
        die('Do you think its that easy??');
    }
    $hash = sha1($_GET['hash']);
    $target = sha1(10932435112);
    if($hash == $target) {
        include('flag.php');
        print $flag;
    } else {
        print "CSEK{n0_4lag_4_u}";
    }
} 
?>
```

Since it's using `==` we can bypass it with exponent.

Find string which starts with 0e etc
because 0^X = 0

## Serialization

> This Capture The Flag (CTF) challenge is designed to assess your ability to identify and exploit fundamental insecure deserialization vulnerabilities. Can you successfully execute the necessary functions and retrieve the flags? Lesssgoo!

```php
<?php

error_reporting(0);

class CloudSEK  {

    private $func_no;
    private $func_name;

    function __construct($no , $name)  {
        if ($no == NULL && $name == NULL)   {
            $this->func_no = $no;
            $this->func_name = $name;
        }
    }

    function __wakeup()  {
        $func_map = array(
            1 => "XVigil",
            2 => "BeVigil",
            3 => "GetMeDemFlagz",
        );
        
        $func_no = $this->func_no;
        $func_name = str_rot13($this->func_name);

        if ($func_map[$func_no] === $func_name)  {
            $this->$func_name();
        }
        else    {
            echo "<h3>Invalid Object Data</h3>";
        }
    }

    function XVigil()   {
        echo "<h3>XVigil is a cybersecurity platform designed to help organizations monitor and mitigate potential security threats and vulnerabilities across the digital landscape.</h3>";
    }

    function BeVigil()  {
        echo "<h3>World's first Security Search Engine mobiles that makes sure the applications installed in your phone are safe.</h3>";
    }

    function GetMeDemFlagz()    {
        $flag_file = "/tmp/flag.txt";
        if (file_exists($flag_file))    {
            $file_contents = file_get_contents($flag_file);
            echo $file_contents;
        }
        else    {
            $err_msg = "<h3>File Not Found!</h3>";
            $file_contents = $err_msg;
            echo $err_msg;
        }
    }
}

// $cloudsek = new CloudSEK(1 , "XVigil");
$sess = $_GET["sess"];
if (!isset($sess))  {
    exit();
}
$data = base64_decode($sess);
$obj = unserialize($data);

?>
```

Here just serialize the object with 3rd function and rot13 str of the function name and base64 it.