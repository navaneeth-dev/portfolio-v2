---
layout: "../../layouts/BlogPost.astro"
title: Android Malware/Reversing Resources
pubDate: "Jul 08 2022"
description: "Some android malware/reversing resources. Can be useful for learning android game hacking etc."
image: /android-malware.jpg
tags: android resources
---

## Emulators

Emulators allow you to run android apps. Some **might not have ARM support**.

- Android Emulator (Android 11 - Tested with ARM apps and google play works properly)
- Bluestacks (Untested)
- Windows subsystem for android (ARM seems to work, but hard to setup frida)
- Genymotion (Good but google play wont work perfectly)

## APK downloaders

These sites allow you to get safe virus free apks.

- [Download Straight from Google Play's API - https://apps.evozi.com/apk-downloader/I](https://apps.evozi.com/apk-downloader/)
- [https://www.apkmirror.com/](https://www.apkmirror.com/)

## Proxies

Proxies allow you to intercept HTTP/s traffic and modify them. Certificates should be installed via CA certificates.  
`10.0.2.2` is a special IP in android emulator for `127.0.0.1` .

- Burp suite

## SSL Pinning Bypass

1. [Magisk](https://github.com/topjohnwu/Magisk/) - [MagiskTrustUserCerts](https://github.com/NVISOsecurity/MagiskTrustUserCerts) module (works on all apps - tested)
2. Xposed - SSL Pinning bypass app
3. Objection ssl pinning bypass with Frida server running as root
4. Patch APK
