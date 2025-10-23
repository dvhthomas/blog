---
title: SQLite and Go App
date: 2023-02-01T16:51:08-07:00
tags: [go, yaml, sqlite, program-management]
toc: true
series:
    - SQLite and Go
summary: Using Go and SQLite to munge YAML data for fun and profit...or for free.
mermaid: true
mathjax: false
draft: false
---

## A holiday project

Towards the end of December 2022 I found myself with two things on my mind.

First, I was wondering what type of investments we were making in programs at work.
I'm a technical program manager (TPM) so this is not idle speculation.
More specifically, I wanted to know how many _people_ were working on certain things.
Or what did people _say_ they were working on.
And since I work at GitHub and since we use Git repos to manage just about everything, I though it would be neat to approach this as a learning opportunity to try and use `git` for data storage and update.

> NOTE: I just stress very strenuously that this work **is not** used within GitHub.
> It's something I dreamed up because I was actually wondering about the problem.
> And it's **a problem I defined so that I could learn something**.
> Again, this is not a GitHub-approved or even GitHub-aware bit of code.

Second, was the desire to learn some more Go and to finally get to grips with common table expressions (CTEs) in SQL.
On the Go front, I wanted to try a bit more test driven development (TDD) and to mess about with [HTMX][htmx], which is a way to sidestep a bunch of front-end web complexity and lean heavily on HTML attributes for interactivity.

## The research topic

So I sat down with a notebook and jotted down the following things:

1. I want to define investments.
   An investment is a chunk of work that people across an organization are working on.
1. People get to self-elect their involvement in an investment.
   I'd like that to be a `git` commit in a structured data file using YAML.
   If Bob is working on Project A, then Bob can commit a change to an `investment.yaml` file and that's all it should take.
1. The organization has a management structure.
   So investments roll up from employee to manager.
   And there are cases where someone declares _'I'm working 50% of my time on Area A'_ but their boss says _'I'm investing 60% of my entire team in Area A.'_ Who is right in this case?
   I decided to pick the person who is highest up in the org.
   So in this case I'd ignore the 50% investment that one person is stating, and instead prefer the 60% that the manager is stating.

Why this topic?
Because I work in a role where the investment that an organization is willingly or unwillingly making in a program, project, initiative, or whatever else you call it, is relevant to the business.
Chosing (or letting) an investment to happen in one area inherently means that another area will receive less investment.

Further, I'd like to be able to slice investments up by organization, by investment category, and maybe other ways in future.
For example, it'd be neat to see how much we're 'spending' from the product management discipline across each investment, or see how much we're spending on investments tagged with `enterprise`.

Plus...I just needed a real problem to solve so that I stay focused while tapping away at the code in the relatively quiet part of
December.

The part that was already making me scratch my head was the hierarchical nature of th employee data, and how to correctly assign investment data as a percentage of team size for managers (_'50% of Dylan's team is assigned'_ means I need to know Dylan's total aggregate team size first...and the same recursively for every manager in the org).

## The approach

I envisioned a simple process.
Grab some pre-existing employee data living in a YAML file in one of our corporate Git repos.
Define and populate an app-specific `investments.yaml` file containing the metdata about each investment, plus employee-specific data related to each investment.

Then I'd use some YAML-fu to transform that into a SQLite database.

{{<mermaid>}}
graph LR;
i(investment data)
e(org data)
s(sqlite database)
g(go app)
a(json api)
h(HTML web app)
i --> s;
e --> s;
s --> g;
g --> a
g --> h;
{{</mermaid>}}

## Data shapes

I'll obfuscate the employee data but here's what one record looks like in YAML.
Remember that I have access to every employee and contractor in the same, single file.

**People**

{{< highlight yaml "hl_lines=2" >}}
bitsbyd:
    manager: Alice
    github_login: bitsbyd
    name: Dylan Thomas
    email: XXXXXXX
    title: Senior Director Technical Program Management
    cost_center: XXXXXX
{{</highlight>}}
    
I took some fields out, but the key part is that my `manager` (whose name is not really Alice) is a unique key, as is my own id of `bitsbyd`.
So that's where the hierarchical relationship lives.
And people who report to me have `bitsbyd` as their `manager` value, and people who report to me who are themselves managers...well...you get the point.
It's a hierarchy.

**Investments**

After some back and forth I ended up with the following shape for the investments themselves.
Remember, I want a simple format that anyone could edit then submit using GitHub.
So adding a line should be super simple.

Here's a fake investment called Super Secret.
It has the unique key `super-secret`.
I have declared that I'm spending 100% of my time on the program, whereas `jane` says that she's spending 80% of her time on the same program.

Make sense so far?

{{< highlight yaml "hl_lines=1 7" >}}
super-secret:
    name: Super Secret
    link: https://www.github.com
    description: >
      Something neat *goes here*.
    investments:
    - bitsbyd: 1.0
    - jane: 0.8
{{</highlight>}}

## Getting busy

Next up we'll look at how this YAML data makes it's way into a SQLite database.

[htmx]: http://htmx.org