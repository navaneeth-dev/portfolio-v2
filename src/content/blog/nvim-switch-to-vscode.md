---
title: Why I am also switching to VSCode from Neovim
tags: [dev, setup]
pubDate: "Jul 2 2023"
image: /nvim-switch-to-vscode.png
description: Remote dev, Ease of config...
---

## Remote Development

Codespaces has automatic port forwarding with VSCode unlike with Neovim where we have to manually run `gh codespace ports forward 3000:3000`. Generally remote development is better with VSCode, dev container extension support etc.

Generally the setup which I like to go for is VSCode + Windows Terminal ssh with Tmux.

## Extensions

Generally extensions have better support and a better community in VSCode.

## Ease of configuration

Although Neovim is easy to configure, it takes way too long to implement a change. In VSCode everything is documented and has good support whereas in Neovim we have to ask in Discord or search forums.

## Integrated Git client

With VSCode I can use GitLens and the integrated Git client unlike Neovim where I have to use cli or lazygit.

## Conclusion

I still like Neovim but VSCode seems like the better option now.
