---
title: Caddy File Server
date: 2026-01-23T19:36:22Z
tags: [utility, webserver]
toc: true
series: []
summary: Using Caddy as a web server for a local file system.
draft: false
images: []
---

There's a good Python one-liner to start a web server in a directory:

```bash
python -m http.server 8000
```

But I also have Caddy installed and like the fact that it's an actual web server rather than a script pretending to be a web server.

Here's how I use Caddy to serve a directory (`git clone https://github.com/alwaysmap/brand`) of Web browser-friendly files on my Mac:

```bash
cd ~/directory/of/web/content
caddy file-server --browse --listen :8080
```

Now open `http://localhost:8080` in your browser to see the directory listing.
If you had an index.html file in the directory, it would be served automatically.

![web page listing the directory contents](listing.png)

And clicking on the HTML file does exactly what you expect: it renders the page correctly:

![web page rendering the HTML file](page.png)

Caddy can do a lot more but this is such a handy one liner that I have this in my `~/.zshrc`: `bash alias cfs="caddy file-server --browse --listen :8080"` so that I can run `cd ~/project/a && cfs`.
