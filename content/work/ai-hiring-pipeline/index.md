---
title: Accelerating Hiring at a SaaS Company
date: 2026-03-02T12:00:00-06:00
toc: false
series: []
summary: |-
  Built an AI-powered candidate screening pipeline using Claude, BambooHR, and GitHub Actions that reduced 1,000+ applicants to fewer than 300 requiring manual review.
  Part of a broader rethink of the client's engineering hiring process.
mathjax: false
draft: false
images: [bamboo.png]
capabilities:
  - ai
  - automation
  - human resources
  - startups
  - scaling
---

## Situation

A SaaS client was hiring across multiple Senior Software Engineer roles simultaneously.
Inbound applications exceeded 1,000 candidates across open positions, and each one required a recruiter to download the resume, read it against the job description, and make a keep-or-reject decision.

At roughly five minutes per candidate, the manual review backlog was consuming the equivalent of a full-time recruiter.
A quick audit suggested that 50--60% of applicants were clearly not qualified---wrong tech stack, wrong seniority, no relevant experience.
The bottleneck wasn't attracting candidates; it was processing them fast enough to reach the good ones before they accepted other offers.

## Behavior

This was part of a broader rethink of the client's engineering hiring process.
I created structured interview rubrics, trained interviewers on system design interviews, and set up a Talent Pool in [BambooHR](https://www.bamboohr.com/) so warm candidates from previous rounds could be resurfaced for future roles.

The resume screening bottleneck was the most pressing piece: repetitive, criteria-based, and high-volume---ideal for AI augmentation rather than replacement.
I built a tool that pulls applications and resumes from BambooHR, sends them to [Claude](https://www.anthropic.com/claude) for evaluation, and writes decisions with per-candidate reasoning back to each candidate record.

The system needed to be *conservative*---it was far worse to reject a potentially qualified candidate than to let a borderline one through to human review.
I designed a three-tier decision framework (reject, manual review, approve to phone screen) and tuned the prompts so that ambiguous cases always route to a person.
Role-specific dealbreakers are checked first, then application responses are validated, and only then does Claude evaluate the candidate against job requirements with a high evidence bar.
Every decision must cite specific resume evidence, not generic impressions.

This was an iterative process: fine-tune the system, talk through the sample results with the Head of HR, update the prompts. Then we were ready to work through 1K+ candidates.

{{< figure src="bamboo.png" title="Reducing the size of the hiring funnel" >}}

## Impact

- **1,000+ candidates reduced to fewer than 300 requiring manual review.** Recruiters focused on candidates who actually warranted human evaluation.
- **1--2% of candidates promoted directly to phone screen.** The strongest matches surfaced immediately instead of sitting in a queue.
- **~60% auto-rejected with documented reasoning.** Each rejection cited specific evidence, e.g., ".NET specialist with no Python experience despite claiming four years."
- **Review time per candidate dropped from ~5 minutes to seconds,** with human review only needed for the ~38% with genuinely mixed signals.
- **Caught patterns humans might miss at scale:** suspected AI-generated profiles with formulaic metrics and implausible company names, credential mismatches where claimed skills had zero resume evidence, and future-dated employment raising credibility questions.
- **Built-in audit trail.** Every decision was logged with reasoning, enabling quality review and prompt iteration over time.
