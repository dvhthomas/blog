---
title: "Automating Gitlab With Terraform"
date: 2021-02-05T13:32:45-07:00
tags: [automation]
abstract: [Learning how to terraform Gitlab while fixing an early mistake in Gitlab authorization setup]
toc: true
draft: true
mermaid: true
---

We use Gitlab at Woolpert for a large majority of our code- and project-hosting needs. One of the things we didn't get quite right when we started out was the authorization story. And by 'we' I mean 'me' since I'm the Gitlab administrator.

First, we did not implement Single Sign On (SSO) using our corporate identity and access management solution.
I suppose I can be forgiven that one since we switched things up during the implementation and it was a conscious decision on my part.
That said, it would have been really nice to get that in place up front. Oh well.

Second was the authorization model for groups within Gitlab. This post is less about that _per se_ and more about using Terraform to experiment with the solution. But still, I goofed up majorly on that and it **was not** a conscious choice; it was a mistake.
There is no potential for information loss or exposure, but how I structured authz definitely has limited our Gitlab usage.

## First, on Gitlab groups

Gitlab uses what I interpreted as a literal folder structure to represent groups. If I'd read the documentation even remotely closely early on I would have realized my error. Groups are the main way that projects are organized in Gitlab, **and** how access is granted.

For example:

{{<mermaid>}}
graph TD;
    t(Root level group)
    note
    t-->B;
{{</mermaid>}}

{{% code file="structure.txt" lang="txt" %}}
