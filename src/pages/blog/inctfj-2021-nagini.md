---
layout: "../../layouts/BlogPost.astro"
title: "InCTFJ Finals: Rebirth of Nagini"
description: "This is how I first blooded Rebirth of Nagini in 5mins which was a hard 400 point reversing challenge in InCTF Finals by Team bi0s."
tags: [inctfj, ctf]
pubDate: "Jan 10 2022"
image: /snake.jpg
---

## Introduction

I would like to start off by saying I don't think this is the indented way to solve it as It was a hard challenge and I solved it withnin 5mins but I wasn't able to solve the easy challenges in the reversing category. Anyways lets see how I solved it.

## Static Analysis

I always start with `file` command which displays if its 64bit/32bit, dynamically/statically linked and stripped or not stripped.

```bash
──(rize㉿kali)-[~/Desktop/inctfj/Reversing/nani]
└─$ file Nagini
Nagini: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=e0f4dcaeab0c1c50f5da7ac13322687c75f796cd, for GNU/Linux 3.2.0, not stripped
```

After this I run the program to see what its about which makes looking at decompilation easier.

![4470233554f88222839ce52f3310d981.png](/resource/d61071123e714d3eb5efb10f69b636eb.png)

If its 64bit i usually open it with ida freeware first which usually gives me a cleaner decompilation. But I use both ghidra and IDA and both tools are good. Lets analyze the main function.

```cpp
...
while ( (unsigned __int8)sf::Window::isOpen((sf::Window *)v20) )
  {
    v12[0] = sf::Clock::getElapsedTime((sf::Clock *)v11);
    sf::Time::asSeconds((sf::Time *)v12);
    sf::Clock::restart((sf::Clock *)v11);
    v6 = v6 + COERCE_FLOAT(_mm_cvtsi128_si32(v4));
    while ( (unsigned __int8)sf::Window::pollEvent(v20, v12) )
    {
      if ( !LODWORD(v12[0]) )
        sf::Window::close((sf::Window *)v20);
    }
    if ( (unsigned __int8)sf::Keyboard::isKeyPressed(71LL) )
      dir = 1;
    if ( (unsigned __int8)sf::Keyboard::isKeyPressed(72LL) )
      dir = 2;
    if ( (unsigned __int8)sf::Keyboard::isKeyPressed(73LL) )
      dir = 3;
    if ( (unsigned __int8)sf::Keyboard::isKeyPressed(74LL) )
      dir = 0;
    v4 = (__m128i)LODWORD(v6);
    if ( v6 > 0.1 )
    {
      v4 = 0LL;
      v6 = 0.0;
      Tick(); // here
    }
    sf::Color::Color((sf::Color *)v10, 0, 0, 0, 0xFFu);
    sf::RenderTarget::clear((sf::RenderTarget *)v21, (const sf::Color *)v10);
    for ( i = 0; i < N; ++i )
    {
      for ( j = 0; j < M; ++j )
      {
        sf::Transformable::setPosition((sf::Transformable *)&v17, (float)(i * size), (float)(j * size));
        sf::RenderTarget::draw(v21, v16, &sf::RenderStates::Default);
      }
    }
    for ( k = 0; k < score; ++k )
    {
      sf::Transformable::setPosition(
        (sf::Transformable *)v19,
        (float)(s[2 * k] * size),
        (float)(dword_A204[2 * k] * size));
      sf::RenderTarget::draw(v21, v18, &sf::RenderStates::Default);
    }
    *(float *)v4.m128i_i32 = (float)(f * size);
    sf::Transformable::setPosition((sf::Transformable *)v19, *(float *)v4.m128i_i32, (float)(dword_A844 * size));
    sf::RenderTarget::draw(v21, v18, &sf::RenderStates::Default);
    sf::Window::display((sf::Window *)v20);
  }
...
```

This is the main loop of SFML and the main game logic is in `Tick()`. As a side note when playing the game after getting a score of 1, this screen pops up:

![027d96354bbc257a6275897c843887b2.png](/resource/693c291410944cde98053f8e165bf28e.png)

And when opening the Tick function seeing the strings in the code I knew the score was referenced somewhere here. Knowing its a game I thought getting 99999 score might give us the flag and you can see its something similar below.

```cpp
...
if ( ::s[0] == f && dword_A204[0] == dword_A844 )
  {
    ++score;
    std::operator<<<std::char_traits<char>>(&std::cout, "\x1B[2J\x1B[1;1H");
    v0 = std::ostream::operator<<(&std::cout, &std::endl<char,std::char_traits<char>>);
    v1 = std::operator<<<std::char_traits<char>>(
           v0,
           "8    8888 b.             8     ,o888888o. 8888888 8888888888 8 8888888888   ");
    std::ostream::operator<<(v1, &std::endl<char,std::char_traits<char>>);
    v2 = std::operator<<<std::char_traits<char>>(
           &std::cout,
           "8    8888 888o.          8    8888     `88.     8 8888       8 8888         ");
    std::ostream::operator<<(v2, &std::endl<char,std::char_traits<char>>);
    v3 = std::operator<<<std::char_traits<char>>(
           &std::cout,
           "8    8888 Y88888o.       8 ,8 8888       `8.    8 8888       8 8888         ");
    std::ostream::operator<<(v3, &std::endl<char,std::char_traits<char>>);
    v4 = std::operator<<<std::char_traits<char>>(
           &std::cout,
           "8    8888 .`Y888888o.    8 88 8888              8 8888       8 8888         ");
    std::ostream::operator<<(v4, &std::endl<char,std::char_traits<char>>);
    v5 = std::operator<<<std::char_traits<char>>(
           &std::cout,
           "8    8888 8o. `Y888888o. 8 88 8888              8 8888       8 888888888888 ");
std::ostream::operator<<(v5, &std::endl<char,std::char_traits<char>>);
    v6 = std::operator<<<std::char_traits<char>>(
           &std::cout,
           "8    8888 8`Y8o. `Y88888o8 88 8888              8 8888       8 8888         ");
    std::ostream::operator<<(v6, &std::endl<char,std::char_traits<char>>);
    v7 = std::operator<<<std::char_traits<char>>(
           &std::cout,
           "8    8888 8   `Y8o. `Y8888 88 8888              8 8888       8 8888");
    std::ostream::operator<<(v7, &std::endl<char,std::char_traits<char>>);
    v8 = std::operator<<<std::char_traits<char>>(
           &std::cout,
           "8    8888 8      `Y8o. `Y8 `8 8888       .8'    8 8888       8 8888         ");
    std::ostream::operator<<(v8, &std::endl<char,std::char_traits<char>>);
    v9 = std::operator<<<std::char_traits<char>>(
           &std::cout,
           "8    8888 8            `Yo     `8888888P'       8 8888       8 8888         ");
    std::ostream::operator<<(v9, &std::endl<char,std::char_traits<char>>);
    std::ostream::operator<<(&std::cout, &std::endl<char,std::char_traits<char>>);
    std::ostream::operator<<(&std::cout, &std::endl<char,std::char_traits<char>>);
    v10 = std::operator<<<std::char_traits<char>>(&std::cout, "points: ");
    v11 = std::ostream::operator<<(v10, (unsigned int)(score - 3));
    std::ostream::operator<<(v11, &std::endl<char,std::char_traits<char>>);
    enc_res = encrypt(score - 3);
    if ( enc_res == 0x147 && clock() - start_time > 45999999 ) // check
    {
      std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::basic_string(v184);
      std::allocator<char>::allocator(&v177);
...
      stream = popen(dest, "r");
      if ( !stream )
      {
        v15 = std::operator<<<std::char_traits<char>>(&std::cout, "Failed to run :/");
        std::ostream::operator<<(v15, &std::endl<char,std::char_traits<char>>);
      }
      while ( fgets(s, 128, stream) )
...
```

So I noticed a score if check here and a call to `popen` and some encrypt function. So I knew this was where the flag was. I checked in gdb if this was being called and as expected this was never being called.

## Dynamic Analysis

So I thought I'll do dynamic analysis with gdb and get the flag. Soo in IDA we can see the disassembly of the if check:

```x86asm
.text:0000000000003F2B                 cmp     [rbp+enc_res], 147h
.text:0000000000003F35                 jnz     short loc_3F55
.text:0000000000003F37                 call    _clock
.text:0000000000003F3C                 mov     rdx, cs:start_time
.text:0000000000003F43                 sub     rax, rdx
.text:0000000000003F46                 cmp     rax, 2BDE77Fh
.text:0000000000003F4C                 jle     short loc_3F55
.text:0000000000003F4E                 mov     eax, 1
.text:0000000000003F53                 jmp     short loc_3F5A
```

So lets set a breakpoint. Since PIE is enabled we have to run the program then set breakpoint. Lets use starti to break on start. Then set breakpoint.

```bash
──(rize㉿kali)-[~/Desktop/inctfj/Reversing/nani]
└─$ gdb-peda ./Nagini                                                                                                                                                                   1 ⚙
Reading symbols from ./Nagini...
(No debugging symbols found in ./Nagini)
gdb-peda$ starti
Starting program: /home/rize/Desktop/inctfj/Reversing/nani/Nagini

Program stopped.
[----------------------------------registers-----------------------------------]
RAX: 0x0
RBX: 0x0
RCX: 0x0
RDX: 0x0
RSI: 0x0
RDI: 0x0
RBP: 0x0
RSP: 0x7fffffffdfd0 --> 0x1
RIP: 0x7ffff7fcd050 (<_start>:  mov    rdi,rsp)
R8 : 0x0
R9 : 0x0
R10: 0x0
R11: 0x0
R12: 0x0
R13: 0x0
R14: 0x0
R15: 0x0
EFLAGS: 0x200 (carry parity adjust zero sign trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x7ffff7fcd040 <_dl_catch_error@plt>:        jmp    QWORD PTR [rip+0x2ffea]        # 0x7ffff7ffd030 <_dl_catch_error@got.plt>
   0x7ffff7fcd046 <_dl_catch_error@plt+6>:      push   0x3
   0x7ffff7fcd04b <_dl_catch_error@plt+11>:     jmp    0x7ffff7fcd000
=> 0x7ffff7fcd050 <_start>:     mov    rdi,rsp
   0x7ffff7fcd053 <_start+3>:   call   0x7ffff7fcdd70 <_dl_start>
   0x7ffff7fcd058 <_dl_start_user>:     mov    r12,rax
   0x7ffff7fcd05b <_dl_start_user+3>:   mov    eax,DWORD PTR [rip+0x2ec97]        # 0x7ffff7ffbcf8 <_dl_skip_args>
   0x7ffff7fcd061 <_dl_start_user+9>:   pop    rdx
...
gdb-peda$ breakrva 0x3F2B
Breakpoint 1 at 0x555555557f2b
```

Now lets get 1point so that the breakpoint can hit.

```bash
=> 0x555555557f2b <_Z4Tickv+869>:       cmp    DWORD PTR [rbp-0x1b4],0x147
   0x555555557f35 <_Z4Tickv+879>:       jne    0x555555557f55 <_Z4Tickv+911>
   0x555555557f37 <_Z4Tickv+881>:       call   0x5555555575f0 <clock@plt>
   0x555555557f3c <_Z4Tickv+886>:       mov    rdx,QWORD PTR [rip+0x629d]        # 0x55555555e1e0 <start_time>
   0x555555557f43 <_Z4Tickv+893>:       sub    rax,rdx
[------------------------------------stack-------------------------------------]
0000| 0x7fffffffd7e0 --> 0x2940 ('@)')
0008| 0x7fffffffd7e8 --> 0x7fffffffd800 --> 0x0
0016| 0x7fffffffd7f0 --> 0x0
0024| 0x7fffffffd7f8 --> 0x400000000
0032| 0x7fffffffd800 --> 0x0
0040| 0x7fffffffd808 --> 0x0
0048| 0x7fffffffd810 --> 0x0
0056| 0x7fffffffd818 --> 0x0
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Thread 1 "Nagini" hit Breakpoint 1, 0x0000555555557f2b in Tick() ()
```

Lets make the compare true by doing the following:

```bash
gdb-peda$ x/x $rbp-0x1b4
0x7fffffffd7fc: 0x0000000000000004
gdb-peda$ set *0x7fffffffd7fc = 0x147
gdb-peda$ x/x $rbp-0x1b4
0x7fffffffd7fc: 0x0000000000000147

...
# clock check
gdb-peda$ p $rax
$7 = 0x9de8f8
gdb-peda$ set $rax = 0x2bde790
gdb-peda$ p $rax
$8 = 0x2bde790
gdb-peda$ c
...
```

Flag: `inctfj{c0ngr4ts!!n0w_y0u'll_b3_4ble_t0_c0mmun1c4te_w1th_N4g1n1_4s_4_P4rs3lm0uth}`
