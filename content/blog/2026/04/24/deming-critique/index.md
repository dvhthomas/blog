---
title: Systems, Not Individuals, Determine Product Quality
date: 2026-04-24T11:07:03-04:00
tags: [quality, lean, leadership]
toc: true
series: [Essays with AI]
summary: |-
  When a software product has reliability problems, slow delivery, or mounting technical debt, the instinct in tech leadership is to hire better engineers, performance-manage underperformers, or add process.
  These responses usually address the wrong cause.
  The engineers are working within a system.
  Fix the system.
draft: false
images: [magnus-engo-W4lcqyH9r8c-unsplash.jpg]
hero_alt: Photo of intel circuit board by Magnus Engo - Unsplash license
---
# Systems, Not Individuals, Determine Product Quality
## Deming's 14 Points, Annotated for Software Engineering Leadership

When a software product has reliability problems, slow delivery, or mounting technical debt, the instinct in tech leadership is to hire better engineers, performance-manage underperformers, or add process.
The argument in this document is that these responses usually address the wrong cause.
The engineers are working within a system.
Fix the system.

In software, three characteristics make this hit harder than in manufacturing:

1. Engineers are knowledge workers with high autonomy and high mobility—fear and misaligned incentives don't just reduce quality, they cause your best people to leave.
2. Software systems are deeply interconnected—optimizing one team's throughput at the expense of another's creates cascading failures.
3. The feedback loops in software are fast—a quality problem that would take months to surface on a factory floor can hit production in hours.

This isn't a new idea.
It's the central argument of W. Edwards Deming's 14 Points for Management, first published in [*Out of the Crisis*](https://mitpress.mit.edu/9780262541152/out-of-the-crisis/) in 1982.

What follows is an annotated version of those points for engineering leaders running software teams—with examples, critiques, and connections to the modern research that has validated (or complicated) Deming's original claims.

## About Deming

W. Edwards Deming (1900–1993) was an American statistician and management consultant.
After World War II, he was invited by Japanese industry leaders to teach statistical process control.
His influence on Japanese manufacturing quality was significant enough that Japan's highest quality award, [the Deming Prize](https://deming.org/deming-prize/), still bears his name.

His book [*Out of the Crisis*](https://mitpress.mit.edu/9780262541152/out-of-the-crisis/) (MIT Press, 1982) laid out the 14 Points for Management—a framework for how organizations should think about quality, leadership, and continuous improvement.
He followed it with [*The New Economics*](https://mitpress.mit.edu/9780262535939/the-new-economics-for-industry-government-education/) (1993), which situated the 14 Points within a broader theory he called the [System of Profound Knowledge](https://deming.org/explore/sopk/): appreciation for a system, knowledge about variation, theory of knowledge, and psychology.

If you've spent time with the DevOps, Lean, or Agile literature, most of what Deming wrote will feel familiar, because his ideas flow—sometimes explicitly, sometimes not—through the movements that shaped modern software engineering.

## The 14 Points

The original wording below is sourced from [The W. Edwards Deming Institute](https://deming.org/explore/fourteen-points/).
Each point is followed by an example of the principle in practice, what happens without it, and how it is commonly misapplied.

## Point 1: Constancy of Purpose

> "Create constancy of purpose toward improvement of product and service, with the aim to become competitive and to stay in business, and to provide jobs."

Dedicate the organization to long-term improvement, not short-term revenue targets.
Deming's emphasis on "staying in business" and "providing jobs" is deliberate—in [*Out of the Crisis*](https://mitpress.mit.edu/9780262541152/out-of-the-crisis/) he ties quality and long-term thinking directly to organizational survival.

- **In practice:** Leadership invests in paying down technical debt each quarter, even when it doesn't directly move revenue metrics, because platform reliability compounds over time.
- **Without it:** Every sprint is hijacked by whatever the largest prospect asked for in a demo.
  There's no product roadmap beyond "close this deal," and engineers context-switch constantly.
- **Misapplied:** Leadership interprets "constancy of purpose" as rigidity—refusing to adjust the roadmap when market conditions change or customer needs shift. Long-term vision becomes an excuse to ignore feedback. The team builds a well-architected platform that nobody wants because "we're playing the long game." Constancy of purpose is about *direction*, not about ignoring the terrain.

## Point 2: Adopt the New Philosophy

> "Adopt the new philosophy. We are in a new economic age. Western management must awaken to the challenge, must learn their responsibilities, and take on leadership for change."

Delays, defects, and poor workmanship are not inevitable—they are symptoms of a broken system that leadership must fix.

- **In practice:** When a deployment causes a production incident, the team runs a blameless post-mortem focused on what systemic gap allowed the bug to ship—missing test coverage, no staging environment parity, etc.
- **Without it:** When an outage occurs, leadership asks "who pushed this?" and puts the individual on a performance plan. The underlying CI/CD pipeline problems remain unaddressed.
- **Misapplied:** "Blameless" post-mortems become performatively blameless—the words are right, but everyone knows who was "at fault," and the document is written to protect leadership from accountability. Or, "the system is the problem" becomes a way to avoid holding anyone accountable for anything, including leaders who refuse to fund the systemic fixes the post-mortems keep recommending. Blameless culture means the system actually gets fixed, not that nothing changes.

## Point 3: Build Quality In

> "Cease dependence on inspection to achieve quality. Eliminate the need for inspection on a mass basis by building quality into the product in the first place."

Build quality into the development process itself rather than catching defects at the end.
The [DORA research](https://dora.dev/) (Forsgren, Humble, and Kim, [*Accelerate*](https://itrevolution.com/product/accelerate/), 2018) provides empirical support: their data shows that high-performing teams achieve quality through continuous integration, trunk-based development, and automated testing—not through more inspection.

- **In practice:** The team has automated test suites, feature flags for incremental rollouts, and contract testing between services. Quality is verified continuously, not at the end.
- **Without it:** A manual QA team sits at the end of a two-week sprint and rejects half the tickets. Engineers never see the failures until days later, rework is massive, and the QA team becomes a bottleneck everyone resents.
- **Misapplied:** The team eliminates QA entirely and declares "engineers own quality" but doesn't invest in the test infrastructure, observability, or deployment tooling that would make that viable. The result is that nobody owns quality. Features ship without adequate testing because there's no time, no tooling, and no one whose job it is to notice. Removing inspection without building in quality is just removing a safety net.


## Point 4: Minimize Total Cost

> "End the practice of awarding business on the basis of price tag. Instead, minimize total cost. Move toward a single supplier for any one item, on a long-term relationship of loyalty and trust."

Deming's emphasis on "total cost" (not sticker price) and single-supplier relationships is specific—he argued in [*Out of the Crisis*](https://mitpress.mit.edu/9780262541152/out-of-the-crisis/) that switching costs, onboarding friction, and inconsistency are themselves expensive.

- **In practice:** The team selects an observability vendor based on integration quality, support responsiveness, and alignment with their stack, and commits to a multi-year partnership. Total cost of ownership, not unit price, drives the decision.
- **Without it:** Every year, leadership renegotiates infrastructure contracts to save 5%, forcing the team to migrate between monitoring tools. The migration costs dwarf the savings, but they don't show up on the same line of the budget.
- **Misapplied:** "Long-term relationship with a single supplier" becomes vendor lock-in by inertia. The team stays with an underperforming vendor because switching feels disloyal to the principle, even when the vendor has degraded in quality or the team's needs have changed. Deming's point was about minimizing *total cost*, which includes the cost of staying with a vendor that's coasting on the relationship.

## Point 5: Improve Constantly

> "Improve constantly and forever the system of production and service, to improve quality and productivity, and thus constantly decrease costs."

Improvement is a permanent discipline, not a project.
Deming explicitly links quality improvement to cost reduction—they are not opposing forces.
Mary and Tom Poppendieck translated this into software in [*Lean Software Development*](https://www.oreilly.com/library/view/lean-software-development/0321150783/) (2003), identifying "eliminate waste" and "amplify learning" as core principles derived from lean manufacturing, which was itself shaped by Deming's work in Japan.
If you want a concrete starting point, Forsgren and Noda's [*Frictionless*](https://developerexperiencebook.com/) (2025) includes a friction point inventory exercise—walking stage by stage through the developer workflow, rating pain levels, and mapping which DevEx dimensions are affected—that gives you a structured way to find what to improve next.

- **In practice:** The team allocates 20% of each cycle to operational improvements—reducing deploy times, improving alerting fidelity, automating toil. These improvements are tracked and measured.
- **Without it:** "Improvement" only happens during an annual "tech debt week" that gets cancelled whenever a deadline looms. The same incidents recur quarter after quarter.
- **Misapplied:** "Continuous improvement" becomes continuous *tinkering*. The team endlessly refactors and migrates frameworks without measuring whether the changes improved outcomes for customers or the business. Improvement becomes an end in itself—a retreat from the harder work of shipping and learning from real usage. Improvement without measurement is just motion.

## Point 6: Institute Training

> "Institute training on the job."

People can't do work they haven't been taught to do.
Ensure they have the skills and context they need through structured onboarding and continuous learning.

- **In practice:** New engineers pair with a buddy for their first month, have a structured onboarding path through the codebase, and ship a real (small) change in their first week with full support.
- **Without it:** New hires are pointed at a stale Confluence wiki and told to "ask if you have questions." Three months later they still don't understand the deployment pipeline and are afraid to admit it.
- **Misapplied:** Training becomes a checkbox exercise—a rigid 12-week program that every new hire must complete regardless of experience level. A senior engineer with deep distributed systems expertise sits through two weeks of "intro to microservices" because the program doesn't adapt. Meanwhile, the tribal knowledge they actually need (why this service is configured oddly, which alerts are real vs. noise) lives only in the heads of tenured engineers and is never taught. Training should close the gap between what people know and what they need to know, not deliver a fixed curriculum at everyone.

## Point 7: Institute Leadership

> "Institute leadership. The aim of supervision should be to help people and machines and gadgets to do a better job.
> Supervision of management is in need of overhaul, as well as supervision of production workers."

The job of management is to help people do better work—to coach, remove obstacles, and improve the system—not to supervise and control.
Note that Deming calls for overhauling supervision of management as well, not just workers.

- **In practice:** An engineering manager notices a team is struggling with flaky integration tests. They carve out time, bring in expertise, and help the team fix the root cause.
- **Without it:** A manager's primary activity is reviewing Jira dashboards, flagging tickets that are "behind schedule," and escalating to the VP. They never engage with the actual technical or process problems slowing the team down.
- **Misapplied:** "Servant leadership" is interpreted as the manager having no authority or opinions—they become a concierge who asks "what do you need?" but never sets direction, makes hard calls, or tells the team something they don't want to hear. Deming said leadership should *help people do a better job*, which sometimes means making unpopular decisions about priorities or pushing back on the team's preferred approach. Leadership without authority is abdication.

## Point 8: Drive Out Fear

> "Drive out fear, so that everyone may work effectively for the company."

People must feel safe to ask questions, report problems, admit mistakes, and propose ideas without fear of punishment.
Deming explicitly links fear to ineffectiveness, not just morale.

Amy Edmondson's research on [psychological safety](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf) (1999) formalized this empirically, showing that teams where members feel safe taking interpersonal risks learn faster and perform better.
Ron Westrum's [organizational culture typology](https://qualitysafety.bmj.com/content/13/suppl_2/ii22) (2004) demonstrated that how organizations process information—whether they suppress, channel, or seek out bad news—predicts safety and performance outcomes.
Both frameworks appear in the [DORA/Accelerate research](https://dora.dev/) as predictors of software delivery performance.

- **In practice:** An engineer notices a potential data privacy issue in a feature that already shipped. They raise it immediately because they know the response will be "thank you, let's fix it"—not blame.
- **Without it:** Engineers know that raising concerns about unrealistic deadlines gets them labeled "not a team player." They stay quiet, cut corners, and the product ships with problems that surface later as customer-facing incidents.
- **Misapplied:** "Driving out fear" is interpreted as creating an environment where no one can ever be uncomfortable. Hard feedback is avoided because it might feel threatening. Underperformance is tolerated indefinitely because addressing it might create fear. This confuses *psychological safety* (safe to take risks, disagree, and be wrong) with *comfort* (no one ever hears anything difficult). Edmondson is clear on this distinction: psychological safety is not about being nice, it's about [candor](https://www.wiley.com/en-us/The+Fearless+Organization%3A+Creating+Psychological+Safety+in+the+Workplace+for+Learning%2C+Innovation%2C+and+Growth-p-9781119477266). Deming wanted people free to speak the truth, and that includes leaders speaking hard truths to their teams.

## Point 9: Break Down Barriers

> "Break down barriers between departments. People in research, design, sales, and production must work as a team, to foresee problems of production and in use that may be encountered with the product or service."

Silos create misalignment, duplicate work, and finger-pointing.
Deming emphasizes working as a team to *foresee* problems, not just react to them.

- **In practice:** Product, engineering, and customer success jointly review the top support tickets each month. They prioritize fixes together based on customer impact, not departmental politics. They track cross-team metrics like PR merge times, handoffs between teams, and knowledge discoverability—the kinds of things that only surface when you measure collaboration, not just individual output.
- **Without it:** Customer success logs bugs in one system, product manages requests in another, and engineering tracks work in a third. Nobody has a unified view of customer pain. Teams blame each other when churn rises.
- **Misapplied:** "Breaking down barriers" becomes "everyone is in every meeting." Cross-functional collaboration is implemented as cross-functional *overhead*: engineers attend sales calls, product managers sit in standups, and every decision requires consensus from six stakeholders. You've replaced silos with a different problem—diffusion of ownership and decision paralysis. Breaking down barriers means teams can see each other's work and align on shared goals, not that every team has a vote on every decision.

## Point 10: Eliminate Slogans

> "Eliminate slogans, exhortations, and targets for the work force asking for zero defects and new levels of productivity.
> Such exhortations only create adversarial relationships, as the bulk of the causes of low quality and low productivity belong to the system and thus lie beyond the power of the work force."

Slogans and arbitrary targets demand results without changing the system that produces them.
Deming's reasoning is in the text itself: the causes of low quality *belong to the system* and are *beyond the power of the workforce* to fix alone.

- **In practice:** Instead of declaring "we will achieve 99.99% uptime this quarter," leadership invests in redundancy, automated failover, and better incident response tooling—then measures whether the system improvements moved the number.
- **Without it:** The CEO announces a "Zero Downtime Initiative" in an all-hands, complete with branded Slack emojis. No additional infrastructure investment is made. Engineers feel the pressure but have no new tools or processes to prevent outages.
- **Misapplied:** This point is used to argue that the organization should never set targets. But Deming wasn't against goals—he was against goals *imposed on workers without changing the system*. An SRE team that sets an SLO of 99.95%, instruments the system to measure it, and then invests in the changes needed to meet it is doing what Deming described. The problem is the target without the system change.


## Point 11: Eliminate Quotas and MBO

> 11a: "Eliminate work standards (quotas) on the factory floor. Substitute leadership."
>
> 11b: "Eliminate management by objective. Eliminate management by numbers, numerical goals. Substitute leadership."

Deming split this into two sub-points. 11a addresses quotas imposed on workers; 11b addresses management by objective (MBO) and numerical goals imposed on managers.
In both cases, the remedy is the same: substitute leadership.
This was a direct critique of MBO, which Deming saw as counterproductive.

Forsgren et al.'s [SPACE framework](https://queue.acm.org/detail.cfm?id=3454124) (2021) addresses the same problem in software: developer productivity cannot be reduced to a single metric like commits or story points.
The framework identifies five dimensions—satisfaction, performance, activity, communication, and efficiency—and argues that only by examining multiple dimensions in tension can organizations understand productivity.

- **In practice:** Teams are measured on outcomes—customer-facing reliability, time to resolve incidents, feature adoption rates—and trusted to determine how much work that requires.
- **Without it:** Engineering is measured on "velocity" (story points per sprint). Teams inflate estimates to hit the number. A massive refactor that would eliminate an entire class of bugs gets deprioritized because it's "only one ticket." The SPACE paper's own [example metrics table](https://queue.acm.org/detail.cfm?id=3454124) flags story points and lines of code with an explicit caution that they "can proxy more things"—meaning they're easily gamed and often measure the wrong thing.
- **Misapplied:** "Eliminate management by numbers" is interpreted as "don't measure anything." The team stops tracking deploy frequency, incident rates, or cycle time because metrics are seen as inherently Deming-hostile. But Deming was a statistician. His objection was to using numerical targets as a *substitute* for understanding the system. Measurement in service of understanding is essential; measurement in service of control is destructive.

## Point 12: Pride of Workmanship

> 12a: "Remove barriers that rob the hourly worker of his right to pride of workmanship. The responsibility of supervisors must be changed from sheer numbers to quality."
>
> 12b: "Remove barriers that rob people in management and in engineering of their right to pride of workmanship. This means, inter alia, abolishment of the annual or merit rating and of management by objective."

12a focuses on production workers; 12b extends the same principle to managers and engineers.
12b explicitly calls for abolishing annual performance reviews and merit ratings—Deming argued in [*Out of the Crisis*](https://mitpress.mit.edu/9780262541152/out-of-the-crisis/) that these destroy intrinsic motivation and teamwork.

- **In practice:** Engineers have modern tooling, reasonable timelines, and the authority to push back on shipping something they believe isn't ready. Code review is a collaborative learning process. Performance is discussed through regular 1:1s and growth conversations, not annual stack-ranking. If you want to know whether you're getting this right, the SPACE framework suggests measuring developer satisfaction and productivity perception directly—ask people whether they feel productive, not just whether the system says they are.
- **Without it:** Engineers are forced to ship features they know are half-baked because "the customer is waiting." They accumulate a backlog of known issues they're never given time to fix. Annual reviews pit team members against each other for a fixed pool of ratings, discouraging collaboration.
- **Misapplied:** "Abolish performance reviews" is implemented literally—the company eliminates all formal feedback mechanisms. Without structured reviews, feedback becomes informal, inconsistent, and biased toward whoever has the most face time with leadership. Promotions and compensation decisions still happen; they just happen without transparency or criteria. Deming's point was that *competitive ranking* systems destroy collaboration. The alternative isn't no feedback—it's feedback oriented toward growth, delivered continuously, and disconnected from zero-sum ranking.

## Point 13: Education and Self-Improvement

> "Institute a vigorous program of education and self-improvement."

Invest in people's growth beyond job-specific training.
Deming distinguished this from Point 6: training teaches people how to do their current job; education develops the whole person.

- **In practice:** Engineers get a learning budget and dedicated time for conferences, courses, and exploration. A backend engineer interested in observability is encouraged to build out the team's OpenTelemetry instrumentation as a growth project.
- **Without it:** The only "development" offered is mandatory annual compliance training. Requests for conference attendance are denied because "we can't spare the headcount." Top engineers leave for companies that invest in their growth.
- **Misapplied:** The learning budget becomes a perk disconnected from the team's actual needs. Engineers attend conferences in technologies the company doesn't use, accumulate certifications that don't change their work, and treat learning time as personal enrichment with no obligation to bring anything back. Education should develop people *and* improve the system. The best implementations tie personal growth to real problems—an engineer learns observability by instrumenting the team's own services, not by watching videos in isolation.

## Point 14: The Transformation Is Everybody's Job

> "Put everybody in the company to work to accomplish the transformation.
> The transformation is everybody's job."

Transformation requires participation from everyone, and leadership must create the structure that enables it.

- **In practice:** Leadership shares the company's reliability and quality goals transparently, involves engineers in defining the improvement plan, and creates working groups where anyone can contribute to process improvements.
- **Without it:** The CTO announces a "culture of quality" initiative. A small committee drafts new processes in isolation and rolls them out as mandates. Engineers, who weren't consulted, see the new processes as bureaucratic overhead and quietly route around them.
- **Misapplied:** "Everybody's job" becomes "nobody's job." If transformation is everyone's responsibility, then no one is specifically accountable for driving it forward. The improvement initiatives that emerge from working groups lack sponsorship, compete with feature work, and quietly die. Deming meant that transformation requires participation from everyone, but it also requires leadership to create the *structure*—time, resources, authority—that makes participation possible. Someone has to own the backlog.

## The Common Thread

All 14 points come back to one idea: most problems are systemic, not individual.
In a software team, that means outages, slow delivery, and quality issues are rarely caused by a single engineer—they're caused by missing automation, unclear ownership, misaligned incentives, and organizational fear.
The leader's job is to fix the system so that capable people can do good work.

The misapplication pattern across all 14 points is consistent: **leaders adopt the language of the principle without doing the structural work it demands.**
"Blameless culture" without systemic fixes.
"Servant leadership" without authority.
"No quotas" without better measurement.
"Everybody's job" without anyone in charge.
In every case, the principle gets turned into a slogan—which is what Point 10 warns against.

## Which Ideas Are Still Relevant

Forty years on, Deming's big claims—that quality is a system property, that fear inhibits performance, that single-metric management distorts behavior—have held up well.
Several independent lines of research have arrived at the same conclusions from different starting points.
Here they are in chronological order.

### Psychological Safety (1999)

Amy Edmondson's research on [psychological safety](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf) and her later book [*The Fearless Organization*](https://www.wiley.com/en-us/The+Fearless+Organization%3A+Creating+Psychological+Safety+in+the+Workplace+for+Learning%2C+Innovation%2C+and+Growth-p-9781119477266) (2018) arrive at the same conclusion as Point 8 from organizational behavior research.
Her data showed that teams whose members feel safe to admit mistakes and raise concerns learn more and perform better.
Ron Westrum's [organizational culture typology](https://qualitysafety.bmj.com/content/13/suppl_2/ii22) (2004) demonstrated that how organizations process information predicts safety and performance outcomes.
[Google's Project Aristotle](https://web.archive.org/web/20181219171141/https://rework.withgoogle.com/guides/understanding-team-effectiveness/steps/foster-psychological-safety/) (2015) studied 180+ Google teams and identified psychological safety as the most important of five factors predicting team effectiveness.

### Lean Software Development (2003)

Mary and Tom Poppendieck's [*Lean Software Development*](https://www.oreilly.com/library/view/lean-software-development/0321150783/) adapted lean manufacturing principles for software.
Lean manufacturing was itself shaped by Deming's work in postwar Japan, so this is a direct line.
Their seven principles—eliminate waste, amplify learning, decide as late as possible, deliver as fast as possible, empower the team, build integrity in, and optimize the whole—will look familiar if you've read the 14 Points above.

### Accelerate and DORA (2018)

Forsgren, Humble, and Kim's [*Accelerate*](https://itrevolution.com/product/accelerate/) used four years of survey data from the State of DevOps reports to identify the capabilities that predict software delivery performance.
Their findings—that performance is driven by systemic capabilities like continuous delivery, trunk-based development, loosely coupled architecture, and generative culture—are Deming's argument validated with data.

The DORA research also validated Westrum's culture typology as a predictor of delivery performance, connecting "drive out fear" directly to measurable outcomes.
The [2019 State of DevOps Report](https://dora.dev/) confirmed psychological safety as a foundational factor in software delivery performance.

### The SPACE Framework (2021)

Forsgren et al.'s [SPACE framework](https://queue.acm.org/detail.cfm?id=3454124) argued that developer productivity cannot be captured by a single metric.
The framework's five dimensions—satisfaction and well-being, performance, activity, communication and collaboration, and efficiency and flow—address the same problem Deming identified in Points 11 and 12: that quotas and single-metric management distort behavior rather than improving outcomes.

### Wiring the Winning Organization (2023)

Gene Kim and Steven Spear's [*Wiring the Winning Organization*](https://itrevolution.com/product/wiring-the-winning-organization/) argues that DevOps, Lean, the Toyota Production System, and Deming's System of Profound Knowledge share common mechanisms of performance.
Their three mechanisms—slowification (creating conditions for deliberate learning), simplification (making problems easier to solve), and amplification (ensuring weak signals of failure are heard and acted upon)—cover a lot of the same territory as the 14 Points, reorganized around how information flows through an organization.
Kim and Spear explicitly cite Deming, TPS, and the State of DevOps research as foundational inputs.

### Frictionless (2025)

Forsgren and Abi Noda's [*Frictionless*](https://developerexperiencebook.com/) takes the measurement philosophy from SPACE and DORA and turns it into a practical 7-step methodology for identifying and removing developer friction—including listening tour scripts, friction point inventories, and survey instruments that give you a structured way to find where your system is broken before you try to fix it.


### Things that didn't age well

Some of Deming's specific prescriptions map awkwardly onto modern software.

His advocacy for single-supplier relationships (Point 4) conflicts with reasonable multi-cloud strategies and vendor diversification. His call to abolish all performance reviews (Point 12b) is directionally right—stack ranking and forced curves are destructive—but the blanket prescription ignores that the absence of formal feedback processes often makes things worse, not better. And his framing occasionally shows its age; "hourly workers" and "factory floors" require translation to land in a software context.

But on the central thesis—fix the system, not the people—the weight of evidence is on his side.

## Where to Start

If you manage engineers and something isn't working—delivery is slow, quality is inconsistent, good people are leaving—the natural impulse is to look at who.
Deming's contribution is the reminder to look at *what*: what system are these people working within, and what about that system is producing the results you're seeing?

You don't need to adopt all 14 points.
Pick the one or two that describe a problem you're actually having, and see if the system-level diagnosis changes how you'd approach it.
Most of the time, it will.

## References

### Primary Sources (Deming)

- Deming, W. Edwards. [*Out of the Crisis*](https://mitpress.mit.edu/9780262541152/out-of-the-crisis/). Cambridge, MA: MIT Press, 1982. pp. 23–24.
- Deming, W. Edwards. [*The New Economics for Industry, Government, Education*](https://mitpress.mit.edu/9780262535939/the-new-economics-for-industry-government-education/). Cambridge, MA: MIT Press, 1993.
- The W. Edwards Deming Institute. ["Dr. Deming's 14 Points for Management."](https://deming.org/explore/fourteen-points/)
- The W. Edwards Deming Institute. ["14 Points One-Pager (PDF)."](https://deming.org/wp-content/uploads/2020/06/One-Pager-14Points.pdf)
- American Society for Quality (ASQ). ["Deming's 14 Points."](https://asq.org/quality-resources/total-quality-management/deming-points)
- Neave, Henry R. ["Deming's 14 Points for Management: Framework for Success."](https://academic.oup.com/jrsssd/article-abstract/36/5/561/7121629) *Journal of the Royal Statistical Society, Series D (The Statistician)*, Vol. 36, No. 5 (1987), pp. 561–570.

### Modern Lineage (Software and Tech)

- Poppendieck, Mary, and Tom Poppendieck. [*Lean Software Development: An Agile Toolkit*](https://www.oreilly.com/library/view/lean-software-development/0321150783/). Boston: Addison-Wesley, 2003.
- Poppendieck, Mary, and Tom Poppendieck. [*Implementing Lean Software Development: From Concept to Cash*](https://www.amazon.com/Implementing-Lean-Software-Development-Concept/dp/0321437381). Boston: Addison-Wesley, 2006.
- Forsgren, Nicole, Jez Humble, and Gene Kim. [*Accelerate: The Science of Lean Software and DevOps*](https://itrevolution.com/product/accelerate/). Portland: IT Revolution Press, 2018.
- Forsgren, Nicole, et al. ["The SPACE of Developer Productivity."](https://queue.acm.org/detail.cfm?id=3454124) *ACM Queue*, Vol. 19, No. 1 (2021), pp. 20–48.
- Kim, Gene, and Steven J. Spear. [*Wiring the Winning Organization*](https://itrevolution.com/product/wiring-the-winning-organization/). Portland: IT Revolution Press, 2023.
- Kim, Gene, et al. [*The DevOps Handbook*](https://itrevolution.com/product/the-devops-handbook-second-edition/). Portland: IT Revolution Press, 2016.
- Forsgren, Nicole, and Abi Noda. [*Frictionless: 7 Steps to Remove Barriers, Unlock Value, and Outpace Your Competition in the AI Era*](https://developerexperiencebook.com/). Shift Key Press, 2025.

### Psychological Safety and Organizational Culture

- Edmondson, Amy C. ["Psychological Safety and Learning Behavior in Work Teams."](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf) *Administrative Science Quarterly*, Vol. 44, No. 2 (1999), pp. 350–383.
- Edmondson, Amy C. [*The Fearless Organization*](https://www.wiley.com/en-us/The+Fearless+Organization%3A+Creating+Psychological+Safety+in+the+Workplace+for+Learning%2C+Innovation%2C+and+Growth-p-9781119477266). Hoboken: Wiley, 2018.
- Westrum, Ron. ["A Typology of Organisational Cultures."](https://qualitysafety.bmj.com/content/13/suppl_2/ii22) *BMJ Quality & Safety*, Vol. 13, Suppl. 2 (2004), pp. ii22–ii27.
- Google re:Work. ["Guide: Understand Team Effectiveness"](https://web.archive.org/web/20181219171141/https://rework.withgoogle.com/guides/understanding-team-effectiveness/steps/foster-psychological-safety/) (Project Aristotle). Archived via Wayback Machine; original page is no longer live.
