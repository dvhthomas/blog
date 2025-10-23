---
title: 2021-05-29
date: 2021-05-29T10:27:57-06:00
tags: []
toc: true
series: []
summary: Trying svelte-kit and Tailwind CSS
mermaid: false
mathjax: false
draft: false
---

## Svelte Kit and Tailwind CSS

Whenever I approach front end development these days I honestly get pretty discouraged.
Not that I don't understand CSS, HTML, and JavaScript.
It's more that the modern stack is sooooo complicated and seemingly built on a shaky foundation of dependencies.
Someone updates a library and before I know it, my CSS doesn't work for reasons take me ages to diagnose.

So while I'm sitting an home recovering from nasal surgery (!) I decided to poke around at a toy project using new-ish comers [Svelte Kit](http://kit.svelte.dev) and [Tailwind CSS](https://tailwindcss.com/).

[Let the games commence!](https://github.com/dvhthomas/ciptrack)

### What I learned in a couple of sessions

- Svelte-kit is pretty easy to set up these days.
  I used their docs to get an empty project going using TypeScript.
- Tailwind CSS is confusing to integrate into. PostCSS, `purge`, and a bunch of other dependencies.
  I finally got a [working setup](https://github.com/dvhthomas/ciptrack/commit/b6fec252dc8e7bac8b5d37f2d333f0e93efd25b3) and will keep that commit handy for future starting points.
  However, I'm pretty certain that any change on the Tailwind CSS library side or even Svelte will break this in short order. Sigh.
- Tailwind's centralized configuration is really nice.
  [For example] I could alias the colors I'm using so that in my HTML/*.svelte components I can use a class name like `bg-primary-500` and expect that to be dark indigo by default.
  Then I could switch the value of `primary = colors.red` and have that automagically permeate through my entire app. Nice!



