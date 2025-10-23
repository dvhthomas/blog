---
title: Altitude, Brevity, Contrast, and Directness
date: 2024-06-01T11:11:51-06:00
tags:
- writing
- communication
toc: true
series: []
summary: |
  How to write with a busy reader in mind by answering some questions.
  What altitude are they at?
  How can you be succinct?
  Are you highlighting the important bits?
  Are you being as direct as you can be?
mermaid: true
mathjax: false
draft: false
---

The following is a light adaptation of [something I shared on LinkedIn](https://www.linkedin.com/posts/dylan-thomas_prettyobvious-activity-7201380475133698049-4JUD).

## Write for the reader

You could file this under `#PrettyObvious`, but somehow it's really easy to forget that writing is for the reader, not the writer.

Imagine that you're trying to capture the nuances of a large program involving multiple organizations and things are not going well. Now imagine that you need to ask for a decision or executive action.
All in a few sentences or a couple of paragraphs.
That is surprisingly hard.

GitHub TPMs have Altitude, Brevity, Contrast, and Directness (ABCD) guidance for writing status updates to our senior leadership team (SLT) to help us with that.
Here is that writing guidance in it's entirety:

## Guidance

* **Altitude.** You’re talking to company leadership.
  Imagine you’re actually speaking with them, then filter your comments based on that altitude of “company level impact”.
* **Brevity.** Our SLT does not have the time to work through a lot of words.
  We realize that this may be at odds with the desire for Contrast and Directness; it’s a balance.
  Err on the side of brevity without losing clarity.
* **Contrast.** Don’t shy away from stating harder things.
  You don’t have to be a jerk about it, but highlighting the risks, issues, blockers, and outstanding decisions is kind of the point.
* **Directness.** Avoid corporate jargon and explain acronyms if you have to use them.
  Avoid complicated sentences and language.
  Write in short complete sentences.
  Use data and facts not vague statements.

That's it. Short and sweet and hard to do well 😅

## The Who, When, Why, (and What)

The ABCD doesn't cover the Who, When, and Why: that is the context (What).
For example, our program status update has a Who When Why as follows: Who [SLT] When [Weekly] Why [share progress, decisions, risks, ask for specific action].
Without that, the ABCD is kind of pointless.

This was driven home in a course I took on eCornell recently: [Impactful Unscripted Communication](https://ecornell.cornell.edu/courses/financial-management/impactful-unscripted-communication/).

* **Who** are the listeners and who will make decisions or otherwise ensure the outcome is achieved.
* **Why** is the Purpose
* **What** is the context all of the circumstances surrounding the outcome

They didn't talk about the When so much since that's baked into the Why: it's the Purpose.
But it's worth dwelling on **the What** since that **context** is something that is _very_ easy to assume and one of the prime reasons that a communication can go astray.
It's the reason people ask (themselves) follow-up questions.

## Put it together

Thinking about sending a 'quick' Slack message? Start with Why are you asking for someone's attention (Who), and by When do you expect acknowledgement or action?
And make sure you're not making a bunch of assumptions about the reader's understanding of the context (What).
Then apply the ABCD.

{{<mermaid>}}
graph TD;
    subgraph Purpose
        why(Why? The purpose)
        who(Who do you expect to act?)
        what(What context do they need?)
        when(When do you expect action by?)
    end
    subgraph Communicate
        a(Altitude)
        b(Brevity)
        c(Contrast)
        d(Directness)
    end

    why-->who;
    who-->when;
    when-->what;

    what-->Communicate-->a-->b-->c-->d;
{{</mermaid>}}

## Respect the reader

In GitHub's highly asynchronous culture, ABCD turns out to be generally helpful advice.
Especially when coupled with the Who, When, and Why.
No big revelation: just respect for the reader.
So slow down think about your reader. It's obvious until you forget it!
