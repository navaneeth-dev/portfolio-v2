---
layout: "../../layouts/BlogPost.astro"
title: Why I am also switching to VSCode from Neovim
tags: [dev, setup]
pubDate: "Jul 2 2023"
image: /nvim-switch-to-vscode.png
description: Remote dev, Ease of config...
---

## Remote Development

Codespaces has automatic port forwarding with VSCode unlike with Neovim where we have to manually run `gh codespace ports forward 3000:3000`. Generally remote development is better with VSCode, dev container extension support etc. 

Generally the setup which I like to go for is VSCode + Windows Terminal ssh with tmux.

## Ease of configuration

Although Neovim is easy to configure, it takes way

## Extensions

Generally extensions have better support in VSCode. Example Astro.

## Integrated Git client

With VSCode I can use GitLens and the integrated Git client unlike Neovim where I have to use cli or lazygit.