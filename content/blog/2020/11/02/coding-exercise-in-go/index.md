---
title: "Coding Exercise in Go"
date: 2021-02-06T12:02:31-07:00
tags: [code]
summary: |-
  Answering my own coding exercise using Go and sharing a 
  couple of things I learned along the way about JSON and
  concurrency.
toc: true
draft: false
mermaid: false
---

## A real world coding exercise

We have a one-hour open book coding exercise at Woolpert.
Each person interviewing for the team gets to answer it.
Because it's open book, i.e., use Google, use Stackoverflow, use whatever, we feel it reflects real day-to-day programming.

The exercise is basically _"Use a pre-determined API call to the GitHub API to download avatar photos of the top `X` GitHub users."_

We ask people to get working code if possible, but if not, they should at least write pseudo code and explanatory notes.

The goals are:

1. Get it running.
1. Optional - make it concurrent
1. Optional - make it robust

We've had people use bash, C#, Python, an JavaScript.
We find it a good way to quickly get a feel for how comfortable someone is getting data from an API.
Which these days is very much a real world daily or weekly task.

## My attempt

I sat in bed one night and thought I'd have a crack with a language that's relatively new to me: Go.

Here's what I came up with in 60 minutes.

{{%code file="main.go" lang="go" %}}

## Things I learned

### net/http is nice

`net/http` in the Go standard library is nice. I find myself always installing the `requests` library in Python for sensible API work. Good to have that baked in.

### JSON is nice but finicky

JSON handling in Go is nice. You just define a `struct` (or even use an empty `interface`. Optionally you can name fields in the struct something more meaningful while translating from the source JSON naming.

One thing that tripped me up (lot of rapid Googling!) was how to extract just a subset of the JSON document. For example, there are a lot of fields for each user in the `Items` array that I mapped to `Person[]` but I only needed a couple.

Turns out to be really simple, but not well documented--at least to someone under time pressure.
Basically you just omit fields for data you don't care about and `encoding/json` does the right thing.

### Concurrency is easy

You can use `goroutines` or in this case I found a `sync.WaitGroup` to do what I needed. That's nice succinct code.

```go
var wg sync.WaitGroup
for _, p := range people {
    wg.Add(1)
    go saveAvatar(p, &wg)
}
wg.Wait()
```

## And in bash for fun

Marc on my team responded to this snippet with a fun little implementation in bash. It totally works, which just goes to show that there are many ways to tacklet a problem. And rarely just one right tool:

Both Marc and I are big fans of [jq](https://stedolan.github.io/jq/) for slicing and dicing JSON.
And it makes short work of this task.

```bash
curl -s 'https://api.github.com/search/users?q=followers:%3E10000+sort:followers&per_page=50' |
jq -r -c '.items[] | {item: (.avatar_url+ "," + .login)} | .item' |
while IFS=',' read -r url user; do
  echo "Saving download to $user.jpeg"
  curl -s $url > $user.jpeg &
done
```