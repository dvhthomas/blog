---
title: Building the Android Auto Partner Engineering Team
date: 2018-06-15T12:00:00-06:00
toc: false
series: []
summary: |-
  Grew from individual contributor to global team lead for Android Auto partner engineering, shipping 75+ partner integrations across 130+ head unit variants in 24 months.
  Designed a third-party certification program that removed the team as the bottleneck and let Android Auto scale to hundreds of car models.
mathjax: false
draft: false
capabilities:
  - leadership
  - partnerships
  - automotive
---

## Situation

In January 2014, Google co-founded the [Open Automotive Alliance](https://www.openautoalliance.net/) (OAA) with Audi, GM, Honda, Hyundai, and NVIDIA to bring Android to cars.
A few months later, Google announced Android Auto at Google I/O 2014---a way to project a phone's navigation, media, and messaging apps onto a car's head unit.

The product needed partner engineers who could work directly with OEMs (car manufacturers) and Tier 1 suppliers to integrate the Android Auto Protocol into their head units.
Every integration was unique: different hardware platforms, different software stacks, different organizational structures inside the automaker.
There was no playbook.

I joined as an individual contributor partner engineer, initially focused on Google Maps API automotive integrations.
The early Android Auto work was hands-on, deeply technical, and required building trust with engineering teams inside companies that had never shipped software on a Google platform.

## Behavior

I **led the first two OEM launches**.
[Hyundai was the first automaker to launch Android Auto](https://www.hyundainews.com/assets/documents/original/23958-HYUNDAIISTHEFIRSTAUTOMAKERTOLAUNCHANDROIDAUTO.pdf), shipping in the 2015 Sonata.
Audi followed as a fast-follow---fitting, given they were a founding OAA member.
Both launches required embedded work with the OEM's engineering teams: debugging protocol-level issues on real hardware, navigating internal approval processes, and coordinating across time zones.

Based on the delivery of those launches, I took on **global team leadership** starting in 2015.
I built and led a team of 15 technical staff across five countries---Japan, South Korea, Germany, the UK, and the USA---with accountability for every OEM and Tier 1 supplier integration worldwide.

As the partner count grew, I identified a critical bottleneck: the Google partner engineering team itself was the limiting factor in certifying new head units.

I led the documentation of integration requirements and testing procedures so that third-party engineering teams could validate correctness independently *before* coming to Google for certification.
This effort forced us to make implicit knowledge explicit.
In the process, it improved Google's own codebase---particularly around [audio management](https://source.android.com/docs/automotive/audio/audio-focus), where clarifying partner requirements exposed ambiguities in the platform itself.

The standardization of certification enabled me to start a Third-Party Labs (3PL) program: authorized labs could certify head units without requiring a Google engineer in the loop.
The team went from being the bottleneck to being **the architects of a system that could scale without us**.

## Impact

- **75+ partners across 130+ head unit variants shipped in the first 24 months.** Each one was a distinct integration effort with a distinct partner.
- **3PL program eliminated the certification bottleneck.** Authorized labs could validate integrations independently, decoupling Android Auto's growth from the size of my team.
- **Audio management codebase improved** as a direct result of documenting partner requirements---making the implicit explicit benefited Google's platform, not just the partners.
- **By 2017, Android Auto was available in 300+ car models from 40+ brands**, as noted in Google I/O keynotes.
- **Philosophy: every integration is a partnership.** Technical excellence and relationship building are inseparable. The OEMs that shipped fastest were the ones where we invested the most in trust.
