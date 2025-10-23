---
title: Python, SQL, and data eng
date: 2021-11-11T15:20:28-05:00
tags: [replit, python, data engineering, sql, sqlite]
toc: true
series: []
summary: Data engineering audiocast, plus Python photos
mermaid: false
mathjax: false
draft: false
---

## Data Engineering audiocast

This is a conversation that Jason McCollum and I recorded last week.
Light on technical content, but hopefully putting data engineering into context with the more widely known data science term.

{{< youtube Hi29uqpNnFc >}}

## Downloading photos using Python

While someone was tackling [this coding exercise](https://replit.com/@DylanThomas6/Download-photos-using-Python#README.md) for a Woolpert role, I tried it out in Python.
First time attempt; I'm not sure how idiomatic or even performant the concurrent download bit is.
But I had fun doing it.

### Learning parallelism on the fly with Python

- [`starmap`](https://docs.python.org/3/library/multiprocessing.html) is a very new concept to me.
  Took a few minutes to get the correct syntax for calling a function with multiple arguments, but got there in the end.
- Tried to use a [`dataclass`](https://docs.python.org/3/library/dataclasses.html) at first to make the code easier to read.
  Then figured I was making things too complicated, then wished I had stuck with it instead of the crummy `key['value']` crap all over the place.

{{% code file="main.py" lang="python" %}}


## SQL coding exercise

[This short set of SQL exercises was really fun to write](https://replit.com/@DylanThomas6/sql-basics#README.md).

Thanks to Repl.it version control I shared the incomplete exercises with candidates.
However, my version of the answers are there as well.

For example, here's the `music.sql` answer I can up with.
And of course, the first person to look at this proposed a more direct version without the common table expression (CTE), which I was using for clarity's sake.

{{% code file="music.sql" lang="sql" %}}

I love, love, love the fact that Repl.it supports SQLite as a first class project type.
Makes it so much easier to share an idea without needing a whole dev environment.
