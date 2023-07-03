---
title: Tools I Use For Bug Bounty
image: /rafay-ansari-prhMYojFJRY-unsplash.jpg
pubDate: "10 Dec 2022"
description: "We will look into the tools I use for testing a target"
tags: [resources, bugbounty]
---

First off I would like to start off by saying I don't blindly use these tools and scan everything. I get interested in an app/website and then see **ALL** its features then inspect what it's doing behind the scenes.

## Web

- **Burp Suite** - Tool for inspecting HTTP/HTTPs traffic, plugins I use are turbo intruder to brute force or FUZZ an endpoint. It uses a python API and its free to use
- **sqlmap** - Can dump the DB, especially useful for blind SQLIs

## Enumeration

- **feroxbuster** - for directory enumeration, gobuster also its very good
- **amass** - passive inteligence gathering using google, etc.
- **crt.sh** - Find similar certs

## Android

- **jadx-gui** - To view the java source code
- [rootAVD](https://github.com/newbit1/rootAVD) - Root android studio emulator with magisk
- [magisk-frida](https://github.com/ViRb3/magisk-frida) - 🔐 Run frida-server on boot with Magisk, always up-to-date
- Android Studio Emulator - The **ONLY** good emulator I know for bug bounties
- [TrustUserCerts](https://github.com/NVISOsecurity/MagiskTrustUserCerts) - Allows you to bypass SSL pinning on any app
- Objection - Extremely useful for dynamic hooking and analysis
- Frida - Good for JS scripts for hooking into android stuff
