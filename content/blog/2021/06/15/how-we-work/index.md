---
title: Operating Principles a.k.a. How We Work
date: 2021-06-15T15:46:31-07:00
tags: [leadership, work, learning]
toc: true
series: []
summary: |-
  This is a lightly obfuscated version of something I wrote for the technical
  team at Woolpert Cloud Solutions. It reflects the values I promote for the team
  and my ethos around enabling people to make their own decisions based on core values
  rather than an endless list of rules.
mermaid: false
mathjax: false
draft: false
---

**Principles**

It’s easy to get bogged down in discussions like: “should we do TDD or should we do BDD?”
By defining operating principles rather than rules, we hope it’s easier for everyone to make their own decisions in context.
Because, you know...it depends!

**Not details**

These principles avoid the details: they’re about how we approach work in general.
If you want details, talk to people who are already doing that type of work and see if it fits what you’re doing.

## Write Things Down

> Writing things down is the best way to capture knowledge that is easily shared.

Taking the time to jot down the answer to a problem is like writing **knowledge for your future self** to benefit from.
Even better, a **teammate** reads the same thing to get up to speed on something or solve a problem.

We also write things down because we’re a team that mostly **works remote**.
And for a remote team it’s easier to benefit from well-written snippets, factoids, long-form prose, and great bug reports than it is to wait a week to talk to someone.
It requires sharing information in a place that multiple people can benefit from it.

Finally, it makes sense to **write well**.
Re-read the email before you send it. Make sure someone not ‘in the room’ can follow the discussion.
Ask for a specific decision not “Thoughts?”

#### Examples

1. **Get up and running fast.** An engineer (you or someone else) should be able to git clone and get up and running really quickly. And listing the gotchas is always appreciated.
   1. ______ wrote great instructions for ______ which is good because there were a whole lot of manual steps that are easy to forget.
1. **Write down the answer.**
   1. ______ was trying to figure out how to configure API authorization for a customer. Luckily, ______ had already written the answer down 6 months before in a support article.
   1. ______ wrote down how to get Python working on his Mac. When the whole thing got wiped 2 months later, he was thankful that he wrote the instructions down somewhere public.
1. **Code is communication.** Documentation is great and working executable code is even better.
  Human-readable code is better than clever, obtuse code.
   1. ______ used to have a long document of CLI commands to set up the infrastructure, it had a less than perfect track record in real life.
  Replacing that with Terraform meant we could stand the whole stack up with a single command.
  Even better, that single command automatically fixed the entire stack in a couple of minutes when a resource was accidentally removed from production.
1. **Document technical decisions.**
   1. ______ needed to communicate a solution proposal to a client. After some back and forth conversation, he shared a deliberately drafty-looking diagram to help. It really helped everyone to have something to look at while the discussion continued.

And sometimes it makes sense to just have a conversation when your questions are too open-ended or the problem space too complex.
Favor collaboration over documentation.
But, after having these conversations, write down the key takeaways to help your teammates out.

## Boring Technology Choices

> Choosing unsurprising and widely used technologies may not be exciting, but we’re not trying to be exciting: we’re trying to ship reliable things for ourselves and our clients.

Smart engineers who built Etsy went on to say [smart things](https://mcfunley.com/choose-boring-technology) about predictably delivering great software without drama.
Which led them to the idea of **innovation tokens**.
They preferred to use exciting new shiny technology ONLY when it was a critical differentiator, because they knew that it would come with problems they didn’t even know existed.
They called that ‘spending an innovation token’.

Using new tech is basically buying into unknown unknowns.
With the incumbent or boring tech, they already knew where the problems and pains were: **BORING(known knowns + known unknowns)** or **NEW(unknown unknowns)**.

So it’s about making **balanced technology choices**.
Use leading edge technology when it will be a differentiator, pick boring choices for the mundane.
Make balanced big picture decisions and keep the number of moving parts as low as you can.

Does that mean we don’t value innovation and new ideas and techniques?
Nope! But think about things being [‘on the radar’](https://www.thoughtworks.com/radar) meaning ideas worth tracking vs. immediately then wanting to use them on a project/product.
Unless something is truly revolutionary and provides client value, then being ‘on the radar’ is good enough to begin with.

#### Examples

1. **Use innovation tokens carefully.** Don’t use tech because it’s cool and you want to try it or put it on your resume or write a blog post.
   Do think hard about introducing a language, tool, framework, etc., that the team will have to keep up with.
   1. ______ picked Django to build a website for ______, because this Python web framework with PosgreSQL ORM checked boxes of fast, obvious, and uncomplicated.
   The innovation came with figuring out GCP multi-tenancy.
1. **Optimize globally.** Spending one innovation token per project or product can still add up if you have a lot of projects or products.
   1. ______ was writing a logging framework for ______ so we could monitor the app on GCP. One microservice is written in Javascript, another is written in Python. Both ‘boring’ choices but still resulting in ______ having to write the same logging boilerplate code twice. Optimizing globally (one language) would have saved time.

## Culture of Learning

> Software is hard; learning from doing and learning by studying can make it easier.

Software and systems engineering is hard because even some of the fundamental rules of the game seem to change every 5-10 years.
In the real world, it’d be like an architect trying to build a bridge when the effect of gravity keeps changing every 10 year.
The way to mitigate that is to _Always Be Learning_.

Learning doesn’t have to be ‘big’.
It can be small things learned and shared in the moment.
It can also be big: getting a professional certification is a real time commitment, but the value to ______’s business and our ability to reason about technical debt is significant.
Basically, avoiding problems before you make them is way cheaper, and that’s where knowledge comes in.

#### Examples

1. **Shades of gray.** Life isn’t black and white, **explore the gray area** that might be unfamiliar. In [Decoding Tech Talk](https://www.douglassquirrel.com/resources.html) Douglas Squirrel calls the assertive B&W tendency in engineers _“Betterisms and Worserisms”_.
   1. Squirrel examples: "It's the best practice." "We need to do it the right way." "That would increase our technical debt."
   1. Rather than argue when Python should use spaces or tabs the team picked PEP8 because life is too short for topics that would never add client value.
1. **Learn from mistakes.** We all make mistakes with impacts big and small.
   We’re actually pretty forgiving of mistakes.
   The key is to learn from them.
   1. ______ accidentally deployed Kubeflow into the production ______ cluster.
   This resulted in quick learning on the Product Engineering team who created a list of action items to tighten things up in future.
1. **Little experiments.** Grow your toolbox, don’t miss an opportunity to take 15 minutes to research a possible solution, even if you don’t use it.
   1. When figuring out ______, ______ and ______ both ran short experiments for the same feature using different tools to understand the constraints and costs associated with each.
   We ended up NOT doing more serious work with ______ based on their findings.
1. **Lead with questions not statements.**
   1. _"Why would you propose…"_ is better than _"You should never…"_ (see B&W above)
   1. _"What worked for me is…"_ vs. _"You should…"_

## Two-sets of Eyes

> We care about quality, so having two sets of eyes on everything we do is the technology equivalent of ‘measure twice, cut once’.

Having two sets of eyes on things can easily feel like friction that slows us down.
But that’s just survivorship bias speaking.
It’s the times we somehow avoid getting hammered that we should think about.
And anyway, going a little slower to start with is what gives you the confidence to start to move more quickly.

#### Examples

1. **Catch the error.** 'Two sets of eyes' is ultimately around avoiding errors. 
   1. ______ was looking at some Terraform that ______ was about to run.
   By looking at Terraform plan output he could spot a problem with the proposed load balancer configuration.
   Now the product team actually spits out the Terraform plan results into MRs so that everyone gets in the habit of looking at what might happen BEFORE you make a mistake in production.
1. **Diverse perspectives.** If you look outside the code, how does the finished product look to someone else?
   1. ______ was writing a storage backend and generic app API for the ______ App.
   The shape of the API made a lot of sense from a GCS perspective (the default storage provider).
   When Jason tried to implement it, we realized that a lot of GCS-isms had crept into the API.
   An early API review could have saved some time.
1. **A second opinion before shipping.** If we’re shipping to clients then we DEFINITELY want to at least get a second opinion of the dev/test version.
   You don’t have to call it User Acceptance Testing (UAT): but a 15 minute demo to a peer can give you insights.
   1. ______ was looking at a Google Maps page that ______ was writing.
   It worked fine, but somehow seemed kind of janky when zooming.
   ______ took a look and found a small tweak that made the zoom buttery smooth.
   Fixed in 10 minutes!
1. **Pick the right format.** Sometimes it makes sense to just have a conversation when your **questions** are open-ended or the problem space is too complex.
   In those cases you might favor in-person (video) collaboration over writing.
   But, after having these conversations, write down the key takeaways to help your teammates out.
   1. ______ was trying to figure out the shape of the problem for GeoAwareness.
   That was best suited to open-ended discussion with CEs and Sales at first.
   With some boundaries defined, he could focus on writing a pitch and sketching out code.

## A Few Commandments

> Thou shalt…(unless Thou shalt not)

There are a very small number of actual commandments.
These are tactical items so important that they’re rules for anyone on the team.

Add the words _"...unless you shouldn’t"_ to the end of these rules.
Even commandments have context. _"Put everything in version control...unless you shouldn't"_.

1. **Put everything in version control.**
   1. Even small experiments belong there.
      The risk to ______ of losing the output of engineering thought is too great to skip this.
   1. Everyone (should) have an experimental folder in hosted git to put things.
1. **Show respect, especially when you disagree.**
   1. One of Woolpert’s core pillars is A Great Place to Work.
      We WILL NOT tolerate jerks on this team, even if they’re brilliant technologists.
   1. Assume good intentions of your teammates until such time as you’re absolutely certain they’re just "being a jerk".
   Then let them know in the moment that their style of communication is getting in the way of the content of the conversation.
