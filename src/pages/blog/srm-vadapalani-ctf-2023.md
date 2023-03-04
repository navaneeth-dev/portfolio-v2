---
layout: "../../layouts/BlogPost.astro"
title: SRM Vadapalani CTF
tags: [ctf]
pubDate: "4 Mar 2023"
image: /srm-vadapalani-ctf-2023-poster-1.png
description: Capture the Flag Technozarre '23 Experience And Some Solutions
---

## TLDR

**CTF IP**: [159.89.165.85](http://159.89.165.85)  
**Place**: 1st  
**Difficulty**: Easy-Medium  
**Remarks**: Very Organized event

## Superbowl Star - Steganography

First always check the file type in CTFs.

```shellscript
rize@rizexor:/mnt/c/Users/decod/Downloads$ file Superbowl1.pdf
Superbowl1.pdf: ASCII text, with CRLF line terminators

# since its text lets use cat
rize@rizexor:/mnt/c/Users/decod/Downloads$ cat Superbowl1.pdf
It's just a text file (note that the string below has spaces in between):
_!!__!!_ _!!_!!__ _!!____! _!!__!!! _!!!!_!! _!__!_!! _!!__!_! _!!!_!!_ _!!_!__! _!!_!!!_ _!__!!_! _!!____! _!!_!___ _!!_!!!! _!!_!!_! _!!__!_! _!!!__!! __!!___! __!!___! _!!!!!_!
```

Initially I thought it was morse code but online tools said it was corrupted but then I noticed the hint said spaces so I counted the _ and ! and found they were all 8 characters and then a space. I did a find and replace in CyberChef and From Binary and viola!

![](/srm-vadapalani-ctf-2023-from-binary.png)

