---
title: 2021-08-28
date: 2021-08-28T07:40:13-06:00
tags: [git]
toc: true
series: []
summary: Using GitLFS for the first time.
mermaid: false
mathjax: false
draft: false
---

## Using GitLFS for the first time

Testing Git Large File Support (LFS) behavior in [Gitlab](https://docs.gitlab.com/ee/topics/git/lfs/index.html).

### One time

I created a quick repo to experiment with.
We use hosted Gitlab at work so GitLFS is available by default.

```sh
brew install git-lfs
git clone git@gitlab.com:woolpert/experimental/dylan.thomas/lfs-noodling.git
git lfs install
```

### For big files

Made a screenshot and a random binary of 5MB in size.
Then told `git` which files I want to track and manage using LFS.

```sh
$ git lfs track "*.bin" "screenshot.png"
$ cat .gitattributes
*.bin filter=lfs diff=lfs merge=lfs -text
screenshot.png filter=lfs diff=lfs merge=lfs -text
$ git add .
```

Then `commit`-ing and `push`-ing does the right thing:

```sh
$ git commit -m "adding some large files using GitLFS"   lfs-noodling -> main +
[main 395982e] adding some large files using GitLFS
 4 files changed, 28 insertions(+), 1 deletion(-)
 create mode 100644 .gitattributes
 create mode 100644 bar.bin
 create mode 100644 screenshot.png

$ git push                                              lfs-noodling -> main |•
Locking support detected on remote "origin". Consider enabling it with:
  $ git config lfs.https://gitlab.com/woolpert/experimental/dylan.thomas/lfs-noodling.git/info/lfs.locksverify true
Uploading LFS objects: 100% (2/2), 5.5 MB | 1.8 MB/s, done.
Enumerating objects: 8, done.
Counting objects: 100% (8/8), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (6/6), 942 bytes | 942.00 KiB/s, done.
Total 6 (delta 0), reused 0 (delta 0), pack-reused 0
To gitlab.com:woolpert/experimental/dylan.thomas/lfs-noodling.git
   1553a4c..395982e  main -> main
```

Looking at gitlab we see the LFS label on large files:

{{< figure src="lfs.png" title="Visual indicator that GitLFS is doing the right thing" >}}
