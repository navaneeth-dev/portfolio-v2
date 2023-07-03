---
title: External Recon
pubDate: "May 24 2022"
description: Red Team External Recon Methods
image: /spy.jpg
tags: [recon, bugbounty, redteam, resources]
---

## DNS

[DNS Dumpster](https://dnsdumpster.com/) dumps all the dns records but can only be used for public websites\
![6bb7a092cdaeaf94a12cc8e7bce54bdd.png](/resource/1de3a8f8563549daa480e215c304634c.png)

[Security Tails](https://securitytrails.com/list/apex_domain/nethergames.org) - Signup required

nslookup is an interactive dns querier

```bash
$ nslookup
> server cyberbotic.io
Default server: cyberbotic.io
Address: 172.67.205.143#53
Default server: cyberbotic.io
Address: 104.21.90.222#53
Default server: cyberbotic.io
Address: 2606:4700:3033::6815:5ade#53
Default server: cyberbotic.io
Address: 2606:4700:3037::ac43:cd8f#53
> cyberbotic.io
172.67.205.143
```

dig

```bash
root@kali:~/Tools# dig cyberbotic.io +short
104.21.90.222
172.67.205.143
```

## IP Info / Whois

`whois`\
[IP Location](https://iplocation.net)
[IP Gelocation](https://www.ipfingerprints.com/geolocation.php)

## Google Dorks

`site:"linkedin.com" Tesla`

## Leaked creds recon

<https://www.dehashed.com/>\
<https://haveibeenpwned.com/>

## Emails

Gather, checking email security and checking if emails are valid.

### Gathering Emails

Hunter.io\
![Hunter.io email pic](/resource/23ca40fcb63c46ed8545b558c57c9b78.png)

### Valid Email Checker

<https://tools.emailhippo.com/>

### Email Security / Spoof Email

Checking email security of a domain

```bash
$ ./spoofcheck.py cyberbotic.io
[+] cyberbotic.io has no SPF record!
[*] No DMARC record found. Looking for organizational record
[+] No organizational DMARC record
[+] Spoofing possible for cyberbotic.io!
```

## Social Media Recon

Twitter:

- [Tweet Analytics](https://socialbearing.com/)
- Twitter search dorks

Instagram:

- [Instagram Image Viewer / Saver](https://imginn.com/therock/)

## Maps

[Google Maps](https://maps.google.com)

## Reverse Image Search

yandex

## Code Search

1.  [www.github.com](http://www.github.com)
1.  [www.grep.app](http://www.grep.app)

## Resources

- [Open-Source Intelligence (OSINT) in 5 Hours - Full Course - Learn OSINT!](https://youtu.be/qwA6MmbeGNo)
- <https://osintframework.com/>
