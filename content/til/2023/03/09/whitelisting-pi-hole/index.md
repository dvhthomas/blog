---
title: Whitelisting Pi-hole
date: 2023-03-09T18:51:29-07:00
tags: [sed, macos, pihole, networking]
toc: true
series: []
summary: Working with Pi-hole and a bit of `sed`.
mermaid: false
mathjax: false
draft: false
---

## Whitelisting with [Pi-hole][pi]

I set up [Pi-hole][pi] on my home network, and had the first chance to do some whitelisting.
My wife uses [Mixpanel](https://mixpanel.com) for her product's analytics.
After loading up some blacklists, she discovered the next day that Mixpanel was not loading.
Mission accomplished!
But not in a good way :-\

Here's what I did to get it working.

### First pass

1. Open the management page for [Pi-hole][pi] which is http://192.168.0.14/admin on my network.
1. Whitelist `mixpanel.com` and all subdomains. Really important to check the _Add subdomains as wildcard_ option so that you get a regex whitelist like this: `(\.|^)mixpanel\.com$` otherwise it...doesn't work!

### Spot the problem

Now the Mixpanel site loads but there's barely anything at all on it.
I wonder why...

1. ssh into the pihole: `ssh pi@192.168.0.14`.
1. Tail the log to only what is getting actively blocked by Pi-hole: `sudo tail -F /var/log/pihole.log | grep 0.0.0.0`
   1. Better than `pinhole -t` because you [only see the blocked stuff](https://www.reddit.com/r/pihole/comments/bnyc7s/comment/enboh3z/) vs. the whole log which is too noisy.
1. Notice that `cdn.mxpnl.com` and similar subdomains are being blocked.

    {{< figure src="ssh.png" title="tailing the pihole log" >}}
1. Add `*.mxpnl.com` and all it's subdomains** to the whitelist.

    {{< figure src="whitelist.png" title="regex-based whitelisting subdomains" >}}


After clearing the browser cache for the last hour on my wifes computer and refreshing a few times we have success! Mixpanel now loads just fine.

I followed the same process to get search working on my AndroidTV.

## `sed` on MacOS

I want to replace the default title of new Today I Learned (TIL) posts.
TIL posts are just markdown files in the `content/til` directory.
Each one in an `index.md` file in a sub-directory for the date, like `2023-03-07`.
And in Hugo, that `content/CONTENT-TYPE/DATE/index.md` becomes a web page called `CONTENT-TYPE/DATE`, where `CONTENT-TYPE` for me is `til` and `DATE` is used to create the title of the post as YAML front-matter:

```yaml
...
title: 2023 03 23
...
```


So, the title for TILs is currently a date in the YAML file, like `title: 2023-03-07` but I wanted it to read `title: My TIL Post` or similar.
I added a `sed` command to find the `title` text on the second line of the `content/til/DATE/index.md` file and replace the whole thing with the title passed in from the command line `TITLE="my til post" task til`.
Unfortunately my first few attempts at using the inplace `-i` flag for `sed` failed.
It really did not want to replace the contents inline.
[Stack Overflow to the rescue](https://stackoverflow.com/a/22084103)!
Turns out, on MacOS you _must_ provide the `-i` parameter with a backup file extension so that you can, in a sense, overwrite your current file but only if you also make a backup copy of it first.
Ugh.

So if you look in the `Taskfile.yaml` file now it has the `-i.bak` argument to make `sed` on MacOS happy, and then an immediate command to delete the backup file: `rm the/path/to/the/file.md.bak`.

```yaml
cmds:
- hugo new til/{{.DATE}}/index.md
- 'sed -i.bak "2s/title.*/title: $TITLE/" content/til/{{.DATE}}/index.md'
- rm content/til/{{.DATE}}/index.md.bak
```

The final comment: using an environment variable `$TITLE` in the `sed` command requires that the entire search-and-replace clause is contained in double-quotes.
And so, therefore, the entire command is wrapped in single quotes to make YAML happy.

[pi]: https://pi-hole.net
