---
title: Shipping GHES on Time, Every Time
date: 2024-01-15T12:00:00-06:00
toc: false
series: []
summary: |-
  Turning late GitHub Enterprise Server releases into a predictable cadence
  by making implicit expectations explicit for every feature team.
mathjax: false
draft: false
capabilities:
  - tpm
  - release-management
---

## Situation

[GitHub Enterprise Server (GHES)](https://docs.github.com/en/enterprise-server@3.18/admin/overview/about-github-enterprise-server) is the self-hosted version of GitHub, used by organizations that need to run GitHub on their own infrastructure.
GHES accounts for a significant share of GitHub's revenue.

In early 2022, GHES releases were missing deadlines.
This was one of the programs that emerged from the broader [TPM transformation at GitHub]({{< ref "work/github-tpm-transformation/index.md" >}}) --- as the TPM function matured, GHES release health became a dedicated program focus.

## Behavior

I led a small team of TPMs to establish clear expectations for all GitHub feature teams shipping to GHES.
We defined what "on time" meant and made it visible: timeframes, quality bar, and communication channels.

The work was creating repeatable processes so every feature team knew exactly what was expected of them for each release cycle.
The approach was not adding process for its own sake --- it was making implicit expectations explicit.

## Impact

* Every [GHES release](https://docs.github.com/en/enterprise-server@3.18/admin/all-releases) since mid-2023 shipped on time with minimal regressions.
* The GHES engineering team was freed to invest more in net-new features for customers, rather than firefighting late releases.
* Predictability became the norm --- Engineering and Product partners could rely on the release cadence.
