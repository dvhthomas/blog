---
title: Redefining Technical Program Management at GitHub
date: 2025-01-15T12:00:00-06:00
toc: false
series: []
summary: |-
  Transformed GitHub's ~35-person TPM organization from project coordination into technically grounded program leadership.
  Narrowed the portfolio from 20+ programs to 5 high-impact ones aligned to company-level goals, with VP+ agreement across Engineering and Product.
mathjax: false
draft: false
capabilities:
  - leadership
  - tpm
  - organizational-development
---

## Situation

I joined GitHub as Head of TPM in January 2022, inheriting a team of ~30 TPMs running 20+ programs across the company.

GitHub had built its TPM function from zero in 2020---impressive speed, but the role definition hadn't kept pace with the growth.
Many TPMs were operating as project coordinators or scrum facilitators: tracking status, running standups, updating spreadsheets.
The *technical program* part of the title was underweight.
Engineering and Product partners had inconsistent expectations of what a TPM engagement would deliver, and TPMs themselves had no shared standard for what "good" looked like.

In [Tuckman's model](https://en.wikipedia.org/wiki/Tuckman%27s_stages_of_group_development) terms, the organization had moved through *forming* quickly but was deep in *storming* when I arrived.
The goal was to get to *performing*---a team that GitHub's Engineering and Product leaders actively pulled into their hardest problems rather than tolerated as process overhead.

I gave a [talk at TPM Summit](https://www.youtube.com/watch?v=3ou1ae8uAJQ) covering this journey and wrote about it in more detail in a [blog post]({{< ref "blog/2024/10/20/tpm-journey-at-github/index.md" >}}).

## Behavior

**Defined what "technically strong enough" means.**
I established clear expectations for what it meant to be a TPM at GitHub---not "can write production code," but can read an architecture diagram, challenge a technical decision, identify cross-system dependencies, and hold both the program and the technical dimensions of the role simultaneously.
This became the bar for hiring, performance reviews, and program assignments.

**Introduced consistent program standards.**
I created a shared framework so that every Engineering and Product partner knew exactly what to expect from a TPM engagement: how programs were scoped, how risks were surfaced, how decisions were escalated, and what artifacts a TPM was accountable for.
The goal was to make the TPM function predictable and trustworthy across the organization.

**Ran the cut-line process.**
This was the hardest and most consequential decision.
We were running 20+ programs with a finite team, spreading effort thin and diluting impact.
I led a [deliberate prioritization exercise](https://docs.google.com/presentation/d/e/2PACX-1vQcpNhOQvyvVCIwSSiIrUr58PcaTftCpXzjePcV4mw7n-omPv6a-7j_NMqwGHt-Q-_-Hi0OAakXKeTJ/pub?start=false&loop=false&delayms=5000&slide=id.g2f82f98138f_0_15) to narrow the portfolio down to 5 high-impact programs aligned directly to company-level goals.
That meant telling VP+ stakeholders across Engineering and Product that their program was below the line.
I got alignment from every VP on the final cut-line before executing it---no one was surprised, and the ones who lost dedicated TPM support understood why.

**Created the Flex Team for rapid response.**
I created [the Flex Team]({{< ref "work/flex-team/index.md" >}})---a dedicated squad of 3 TPMs to handle urgent work without disrupting ongoing programs.
This solved the recurring problem of the CTO needing immediate TPM support while every TPM was committed to a strategic program.

## Impact

- **5 high-impact programs by 2025,** all aligned to company-level goals, with VP+ stakeholder agreement across Engineering and Product.
- **100% of GHES releases shipped on time since mid-2023,** turning a historically unpredictable release process into a reliable one. More detail in the [GHES Release Health case study]({{< ref "work/ghes-release-health/index.md" >}}).
- **Mission-critical security program staffed within 60 minutes of CTO escalation,** with measurable improvement within days---made possible by the Flex Team's bench capacity.
- **Protected GitHub's PRC revenue stream** through the [GB18030](https://en.wikipedia.org/wiki/GB_18030) compliance program, ensuring GitHub met Chinese national encoding standards before the regulatory deadline.
- **Moved the TPM organization from *storming* to *performing*** over two and a half years---from a team that partners tolerated to one they actively pulled into their hardest cross-cutting problems.
