---
title: Pear-ish theme for Zed
date: 2026-04-02T14:01:05-06:00
tags: [zed, themes, editors, tools, ide]
toc: false
series: []
summary: I made a warm, earthy theme for Zed. It took exactly a month to get merged.
draft: false
images: [pearish-dark.png]
hero_alt: "Pearish Dark theme for Zed editor"
---

I built a [theme for Zed](https://github.com/dvhthomas/pearish-theme) called Pearish. It has a dark and a light variant, both built around warm earth tones and a pear green accent color. I've been using [Zed](https://zed.dev) as my daily editor for a while now and wanted something that felt comfortable for long sessions.

{{< figure src="pearish-light.png" title="Pearish Light" >}}

I [submitted a PR](https://github.com/zed-industries/extensions/pull/5067) to the Zed extensions registry on March 2nd. It got merged on April 2nd. Exactly one month. The Zed team has a lot of extensions to review so I'm not complaining, but if you're thinking about contributing a theme, set your expectations accordingly. You can search for "Pearish" in Zed's extensions panel (`cmd+shift+x`) now that it's live.

The thing I keep coming back to while tweaking the color assignments is [Nikita Tonsky's post on syntax highlighting](https://tonsky.me/blog/syntax-highlighting/). His argument is that comments are important and deserve to stand out, but not every single language feature needs its own unique color. I agree. Most themes try to make everything visually distinct, and you end up with a rainbow that doesn't actually help you read code faster. Pearish tries to keep things calm and let the structure of the code do most of the work.
