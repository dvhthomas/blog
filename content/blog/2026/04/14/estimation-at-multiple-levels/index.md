---
title: Estimation at Multiple Levels
date: 2026-04-14T22:21:01-04:00
tags: [estimation, planning, timebox]
toc: true
mathjax: true
series: [Essays with AI]
summary: |-
  Estimation is a dirty word in software and it has been for decades.
  But is it always bad?
  Are there times or situations where estimates add a degree of clarity without being dishonest?
  I think so, but for me, the situations are limited and 'how much time do we have' is often the better starting point.
draft: false
images: []
hero_alt:
---

# How Much Should We Invest in Estimates?

A Practical Guide for Software-Centric Product Organizations.
April 2026---written with VPs, Directors, PMs, and TPMs in engineering-led EPD companies

## The honest starting point

Sean Goedecke names the underlying dynamic around software estimation well:

> The tension between this polite fiction and its well-understood falseness causes a lot of strange activity in tech companies.[^1]

The polite fiction is that a skilled team, given time and effort, can learn how long work will take. Every experienced engineer knows this is largely false. Most of what looks like bad estimation in large organizations is actually the fallout of working around that tension.

The goal of this document is not to find a better estimation methodology. It is to help leaders invest the *right amount* of effort in estimation---which, for most work, is less than they currently spend---and to direct that effort toward the decisions where it actually matters.

This is not an argument against estimation. Estimates serve real purposes: they inform resourcing decisions, signal feasibility, and allow the business to make commitments. The argument is against over-investing in precision that the nature of software work cannot support, and against applying the same estimation rigor to decisions that don't require it.

The argument in three parts:

1. **Know what you're building and what you're not.** The most valuable planning work isn't estimation---it's scope definition and dependency mapping.
2. **Estimate only when it's critical.** Estimates serve organizational purposes more than team purposes. Understanding who needs the estimate and why saves significant wasted effort.
3. **How to estimate when you have to.** The right approach depends on your situation: when you have delivery history, when you don't, and when you're estimating specific work as a practitioner.

---

## Part 1: Know what you're building and what you're not

### The dependency problem is larger than the estimation problem

In large-scale software organizations, the dominant planning risk is almost never that individual tasks are mis-estimated. It is that cross-team dependencies slip, and no one surfaced them early enough to adjust.

One team's delayed delivery holds up three downstream teams. A third-party API that was assumed to be ready isn't. A platform team that was supposed to provide infrastructure tooling is prioritizing something else. These are the actual reasons large initiatives miss their dates---not inaccurate story points.

This is the core insight of Goldratt's [Theory of Constraints](https://en.wikipedia.org/wiki/Theory_of_constraints)[^2] applied to software delivery: every system has exactly one constraint limiting overall throughput at any given time. Improving anything *other* than that constraint doesn't improve the system---it just creates a pile-up of work waiting at the bottleneck. In practice this shows up as pull requests waiting for the one senior reviewer, features complete but blocked on a platform dependency, or work done but stuck because the release process is manual and slow. Goldratt's five focusing steps---identify the constraint, make sure it isn't wasted on unnecessary work, subordinate everything else to it, elevate it if needed, then repeat---are the right mental model for anyone trying to move a large initiative forward.

Before investing time in task-level estimates, map the dependencies. The core argument in Dominica DeGrandis's *Making Work Visible* is that every dependency increases the probability that a project is late.[^degrandis] Her five "thieves of time"---too much WIP, unknown dependencies, unplanned work, conflicting priorities, and neglected work---are worth naming because three of them (unknown dependencies, unplanned work, and conflicting priorities) are specifically invisible at planning time and directly cause estimates to fail. The first job of planning is making these visible before committing, not after.

- **What is the [critical chain](https://en.wikipedia.org/wiki/Critical_chain_project_management)?**[^2b] Which sequence of handoffs, if any single one slips, moves the end date? Goldratt distinguishes this from the traditional "critical path" because critical path ignores resource constraints---the scarce people, skills, or capacity that multiple work streams compete for---and encourages each person to pad their own estimate as self-protection. That distributed padding hides where the real bottleneck is. Critical chain names the binding resource constraint explicitly and protects the end date with a single shared project buffer instead.
- **What is outside your control?** Third-party vendors, partner deliverables, compliance reviews, platform teams with their own roadmaps---anything you can't directly unblock.
- **Which team has the most downstream dependents?** That's where to look first for the constraint---but having many dependents doesn't make a team the bottleneck. A team can have many others waiting on them and still be fine if they're ahead. The point is to look there first, not to assume.

A one-page dependency map reviewed weekly is worth more than a detailed sprint plan that ignores it.

### Scope definition: ask what the work is worth, not just what it will take

The most important question before any estimate is: *what do we actually need to ship, versus what would be nice to have?*

Shape Up, Ryan Singer's methodology developed at Basecamp, offers a useful reframe. The concept of **appetite**---distinct from an estimate---asks how much time this problem is worth to us. Singer puts it like this:

> Estimates start with a design and end with a number. Appetites start with a number and end with a design.[^3]

When you fix the time budget first and shape scope to fit it, scope becomes the variable rather than the date. You don't need to adopt any other Shape Up machinery to use this question. "How much is this worth to us?" belongs in VP and Director planning conversations as much as it does at the team level.

As James Stanier puts it from a constraints perspective: "Instead of asking 'How long will this take?' ask 'What's the fastest we can do this?' and then work backwards from there."[^5] The deadline is a design input, not just a delivery pressure.

Practical questions that sharpen scope before any estimate is made:

- **What is the minimum version that achieves the business goal?** Not the minimum *acceptable* version---the one that actually delivers the outcome.
- **What are we explicitly not building this cycle?** Named exclusions are as important as inclusions. Without them, scope expands to fill available time.
- **If we had half the time, what would we cut first?** This reveals which parts of scope are load-bearing, even when you're not actually cutting anything.
- **Who depends on us, and who do we depend on?** Before a scope agreement becomes a commitment, the dependency chain needs to be visible.

---

## Part 2: Estimate only when it's critical

### Estimates serve organizational purposes more than team purposes

The common view of estimation is that a manager proposes a project, the team estimates it, and the manager decides. In practice it often works the opposite way. Goedecke is blunt about the actual dynamic:

> If an engineering team comes up with a long estimate for a project that some VP really wants, they will be pressured into lowering it.[^6]

Estimates help managers negotiate with each other about which projects get funded and which get cancelled. An engineering team's estimate is an input into that negotiation, not the final word. Understanding this is not an argument for sandbagging---it is an argument for understanding *who the estimate is actually for* before investing heavily in producing it.

A team that never pushes back, though, has given up the only mechanism by which genuinely infeasible work gets surfaced. Goedecke is clear that the ability to push back is earned:

> When I do that, I'm drawing on a well of trust that I build up by making pragmatic estimates the rest of the time.[^7]

### When estimates genuinely matter

**When someone outside engineering needs to make a staffing or commitment decision.** A sales leader telling a customer when a feature will ship, or a VP deciding whether to staff a project, needs order-of-magnitude signal. The decision changes between "two weeks" and "six months." It doesn't change between "eleven days" and "fourteen days"---so getting the exact number right isn't where the effort should go.

**When the work might be genuinely infeasible.** If proposed scope is technically impossible given real constraints, an honest estimate is the mechanism for saying so. This is engineering's legitimate veto, and it only works when used sparingly.[^7]

**When the cost of being wrong is high.** Contracted dates, regulatory deadlines, or dependencies with another company all warrant deeper investigation of what you don't know before committing---not more task breakdowns, but honest scrutiny of the riskiest unknowns.

**When a team is new to a domain.** Without delivery history or familiarity with the codebase, teams need more investigation before committing. Timebox the investigation---spend two days answering a specific question, not open-ended weeks of "research."

### The case for story points---and its limits

Story points have genuine defenders and genuine critics, and both are partly right.

Defenders point out that relative sizing at the sprint level helps teams avoid over-committing before a sprint starts, without requiring hour estimates. Teams develop shared intuitions about complexity over time, and Ron Jeffries and the original XP community designed them for exactly this: sprint-level scope negotiation, not forecasting.

The problem is what happens once points travel. When velocity becomes a target rather than a diagnostic, teams optimize the number rather than the delivery. T-shirt sizes get translated into hours and days the moment they leave the team, which is precisely what they were meant to avoid.[^8] Velocity is also not portable---one team's points say nothing about another team's, making them useless for cross-team planning. [DORA research](https://en.wikipedia.org/wiki/DevOps_Research_and_Assessment) consistently identifies lead time for changes, deployment frequency, change failure rate, and recovery time as the metrics that correlate with organizational performance, not velocity.[^9]

So a reasonable position is to use story points at the sprint level if your team finds them useful for scope negotiation. Don't report them upward, don't use them for quarterly forecasting, and don't compare them across teams. If you're tracking cycle time, you can phase them out entirely.

### When to skip the estimate

Most sprint planning, backlog grooming, and quarterly roadmapping does not require formal estimates. It requires clear scope, a team with known throughput, a dependency map that surfaces blockers early, and an honest distinction between what is a commitment and what is a guess.

Before running a sizing session, ask: what decision does this estimate inform, and does it need this level of precision? Often the answer is no.

---

## Part 3: How to estimate when you have to

When an estimate is genuinely needed, the right approach depends on your situation. There are three meaningfully different cases.

### When you have delivery history: use probabilistic forecasting

If your teams have been delivering consistently for several quarters, you have better forecasting data than any estimate: your actual history. Daniel Vacanti's work on [flow metrics](https://en.wikipedia.org/wiki/Kanban_(development)#Metrics) establishes the method: rather than estimating the size of future work, sample from the distribution of how long past work actually took, run that distribution through thousands of simulations using [Monte Carlo methods](https://en.wikipedia.org/wiki/Monte_Carlo_method), and express the result as probabilities.[^10]

A Monte Carlo forecast answers two questions: how many items can we complete by a specific date, and when will a given set of items most likely be done? The result is a range---"85% probability of completing this scope within twelve weeks"---rather than a single date. The gap between the 50th and 85th percentile dates is a direct, data-backed conversation about how much buffer is warranted.

In practice: export [cycle time](https://en.wikipedia.org/wiki/Cycle_time) data from your issue tracker for the last two to four quarters, segment by work type if your team handles meaningfully different categories, and present P50 as the expected case and P85 as a safer commitment level. This doesn't require specialized software---you can run it in a spreadsheet. Good starting points:

- [Monte Carlo Simulation for backlog prognosis in Google Sheets](https://www.marcusoft.net/2024/03/monte-carlo-simulation.html) --- the whole thing in roughly one function.
- [Introduction to Monte Carlo simulation in Excel](https://support.microsoft.com/en-us/office/introduction-to-monte-carlo-simulation-in-excel-64c0ba99-752a-4fa8-bbd3-4450d8db16f1) --- Microsoft's own walkthrough.
- [Focused Objective's](https://www.focusedobjective.com) [Monte Carlo explainer](https://observablehq.com/@troymagennis/introduction-to-monte-carlo-forecasting?collection=@troymagennis/agile-software-development) --- free, battle-tested templates from Troy Magennis.
- [gh-velocity](https://gh-velocity.org) --- a CLI tool I built for teams working in GitHub; turns issues, pull requests, and releases into flow metrics without leaving the terminal.

#### A worked example

Suppose a team has 20 weeks of throughput history---items completed per week:

```
5, 3, 7, 4, 6, 2, 0, 8, 4, 6, 9, 1, 5, 7, 3, 8, 4, 6, 2, 10
```

The mean is 5 items/week. There are 40 items remaining. The naive estimate is $40 / 5 = 8$ weeks. That's a single number with no uncertainty attached, and it assumes every future week will behave like the average---which real weeks almost never do.

The Monte Carlo procedure is a way of replaying history to see what *could* have happened. One trial looks like this:

1. Pick a random week from the history---say, week 11, which delivered 9 items. Running total: 9.
2. Pick another random week with replacement---say, week 7, which delivered 0 items. Running total: 9.
3. Keep going: week 14 → 7 items (total 16), week 3 → 7 (total 23), week 19 → 2 (total 25), week 8 → 8 (total 33), week 1 → 5 (total 38), week 16 → 8 (total 46).
4. The running total crossed 40 on the 8th draw. This trial finished in 8 weeks.

That's one possible future. Run the same procedure 10,000 times and you get 10,000 possible futures---some where a string of bad weeks stretches delivery to 11+ weeks, some where a string of good weeks finishes in 6. The forecast is just the shape of that distribution.[^mc-notation]

Running this on the data above gives:

| Percentile | Weeks to complete |
|---|---|
| P50 | 8 |
| P70 | 9 |
| P85 | 10 |
| P95 | 11 |

The naive 8-week estimate happens to match the P50---the coin flip. If the team commits to 8 weeks, they're essentially saying "we'll hit this half the time." Committing to P85 (10 weeks) gives roughly an 85% probability of delivering on time; the two extra weeks are the cost of turning "likely" into "reliable." Those two weeks aren't padding---they're the honest answer to "how much buffer does our actual variability require?"

A wide probability distribution isn't a failure---it is honest information. A team with erratic cycle times will get a wide forecast, and tightening that variability is a better investment than tightening the estimate.[^11]

### When you lack history or are in a new domain: set an appetite

For new teams, new codebases, or genuinely novel work with no useful delivery baseline, the appetite approach from Shape Up is a practical alternative to estimation. Rather than trying to estimate unknown work, set a time budget based on what the problem is worth---and shape a solution that fits within it.

A team asked to "build a permissions system" in an unfamiliar codebase may honestly have no idea how long it will take. A team told "we have four weeks for this" can narrow scope to what's achievable, identify the risky parts early, and deliver something real rather than something over-promised.[^12]

The key discipline is doing enough investigation *before* giving the team the time budget---narrowing the problem definition, sketching a rough approach, and explicitly calling out what is out of scope. Singer calls this shaping, and its purpose is specifically to prevent a team from running into an unknown cliff mid-cycle.[^13] In practice, a PM and tech lead spending two to three days on this before a cycle begins is usually enough.

### When estimating specific work as a practitioner: focus on unknowns, return with options

When an engineer or tech lead is asked for an estimate on a specific piece of work, bottom-up decomposition is the least reliable approach. The reason Goedecke gives is blunt:

> software engineering projects are not dominated by the known work, but by the unknown work, which always takes 90% of the time.[^14]

Estimates rarely blow out on the tasks you can name and sequence; they blow out on everything you didn't know was waiting. So the investigation should be weighted toward the unfamiliar parts of the problem: code you haven't touched, integrations whose behavior isn't fully documented, dependencies that might be harder than they look.[^15]

And rather than returning a single number, return a menu. Goedecke describes going back to his manager with

> a _series_ of plans, not just one[^16]

---each one representing a different scope and approach trade-off, rather than a single point estimate that pretends to be the answer.

That gives the decision-maker real choices and makes explicit that timeline depends on scope and approach decisions that are business calls, not purely engineering ones.

### Expressing uncertainty across all three approaches

Regardless of approach, express uncertainty as a range---not a single number with a verbal hedge. Best case, most likely, and worst case works for practitioner estimates. P50 and P85 are the right outputs from a Monte Carlo forecast. Appetite-based planning handles uncertainty through scope flexibility rather than date ranges, which is its main structural advantage.

Publishing only the most likely figure consistently leads to chronic optimism, and the constant re-forecasting that follows.[^17]

## By level: the right questions at each horizon

### VP level---quarterly and annual commitments

At this level the question isn't "how long will this take?" It's "what can we credibly commit to before our next fixed deadline---a launch, a sales cycle, a fiscal year---and what is genuinely flexible?"

- **What fraction of team capacity is committed vs. flexible?** Over-committing leaves no room to absorb surprises, and surprises arrive every quarter.
- **What cross-team dependencies could cause cascading slippage?** A VP who doesn't know the critical chain of major in-flight initiatives will be surprised by date changes that were visible weeks earlier at the team level.
- **What is the order-of-magnitude scale of each major initiative?** Historical delivery data answers this better than task estimates. If teams typically take ten to fourteen weeks to ship a substantial initiative, that is the planning unit---not story points.
- **What commitments are genuinely fixed vs. being treated as fixed?** External commitments (sales, contracts, launch announcements) are genuinely fixed. Internal roadmap items often are not, but get treated as if they are. Distinguishing between them creates room to negotiate when a dependency slips.

### Director level---monthly and initiative-level tracking

At this level the job is monitoring whether in-flight work is moving or stuck---a flow health question, not an estimation question.

Re-estimating work already in flight is almost never useful. Unblocking it is. If the same kind of work consistently takes longer than expected, that is a system problem---unclear requirements, inadequate tooling, a platform team that is the bottleneck for too many others---and it needs to be addressed at the source.

- **Where is work piling up?** A build-up at code review, product sign-off, or deployment is a bottleneck signal. Address the bottleneck directly.
- **Are Service Level Expectations being met?** If 85% of large initiatives usually ship within ten weeks and the current one is at fourteen with no end in sight, that is a risk to escalate now, not at the next quarterly review.
- **Are teams protecting capacity for unplanned work?** Unplanned work is the primary reason estimates miss. A sprint plan built on 100% availability will fail whenever incidents, bugs, or urgent requests arrive---and they always do.
- **Who owns each active cross-team dependency?** The director level is often the right place to force dependency resolution before it becomes a VP-level problem.

### Team and TPM level---sprint and work-item commitments

Teams are the ones who actually need to estimate, and the right approach depends on which situation applies. If delivery history exists, use it for forecasting rather than story points. If the work is genuinely new, set an appetite before committing to specific scope. If an estimate is needed on specific work, use the unknowns-first, options-based approach.

Regardless of approach:

- **Timebox discovery work.** A spike needs a defined question and a time limit. "We'll spend two days determining whether approach X is feasible" is a commitment. "We'll investigate and then estimate" is not.
- **Flag external dependencies immediately.** The moment your work requires something from another team or vendor, it goes on the dependency map. Don't assume it will resolve itself.
- **Distinguish commitment from forecast.** What the team will definitely deliver by end of sprint is a commitment. What might also get done is a forecast. Conflating the two produces a stream of near-misses that erodes trust.

---

## Recommendations for an engineering-led EPD company of 500–1,500 people

At this size, companies have real cross-team dependencies and multiple initiatives running in parallel, but not so many layers that every decision needs a formal governance process. Engineering-led means engineers have credibility in planning conversations---an opportunity to be more honest about estimation limits than is possible when planning is imposed from above. EPD integration means product, design, and engineering share context, which makes scope conversations easier.

1. **Stop producing per-task hour estimates for planning purposes.** The evidence that these improve delivery predictability is weak relative to their cost. They produce false precision and become targets. Invest that time in dependency mapping and scope clarification instead.
2. **Keep relative sizing at the sprint level, but don't report it upward.** Sprint-level scope negotiation is a legitimate use of story points. Velocity as a stakeholder metric is not. DORA research identifies lead time, deployment frequency, change failure rate, and recovery time as the metrics that actually correlate with performance.
3. **Invest in cycle time tracking as your primary above-sprint forecasting tool.** Two to three quarters of consistent tracking produces the data needed for Monte Carlo-based forecasting, which is more honest and more defensible than story-point projections for quarterly and annual planning.
4. **Map dependencies before committing to any cross-team initiative date.** A half-day dependency mapping session before a quarterly planning cycle will surface more risk than weeks of estimation. The output: what is the critical chain, what is outside team control, who owns each dependency.
5. **Apply appetite-setting for initiatives where delivery history doesn't exist.** For new product areas, new teams, or novel work, "how much is this worth to us?" produces better scoping conversations than bottom-up estimation on work that isn't yet understood.
6. **Use the unknowns-first, options-based approach for practitioner-level estimates.** Understand the time constraint first, investigate the unfamiliar parts of the problem, and return with a range of options rather than a single number.
7. **Protect capacity explicitly, and base the buffer on your actual data.**
   The most common reason estimates miss is not poor estimation---it is unplanned work consuming capacity that was assumed to be available.
   DeGrandis argues you should measure your actual ratio of planned to unplanned work, then set your buffer to match it: if 30% of your team's work historically arrives unplanned, reserve 30% of capacity for it.
   The queueing theory behind this is blunt: once a system exceeds roughly 80% capacity utilization, queue size starts to grow almost exponentially.
   A 20–30% buffer is a reasonable starting point, but your own data is a better guide than a rule of thumb.

8. **Use agentic AI tools to reduce the cost of discovery spikes, not to generate estimates.** DORA 2024/2025 data suggests AI accelerates individual throughput while exposing system-level bottlenecks---the Goldratt pattern. The best current use case for AI in planning is faster investigation of unknowns before committing, not automated estimation.

## A note on agentic AI tools

Agentic coding tools are changing throughput for some categories of work, but not the fundamental estimation problem.

Where they help: repetitive, well-understood work can be done substantially faster. For bounded problems with clear specifications, AI can produce an architecture or implementation that is roughly 80% complete and accurate, reducing the time a senior engineer spends reviewing and iterating.[^18]

Where they don't help: unknown work is still unknown. The 2024 DORA report found a genuine paradox---roughly 75% of people report that AI makes them individually more productive, yet the same survey showed that AI use correlated with *decreased* system-level throughput, stability, and valuable work per person.[^19] The most credible explanation is that AI has been accelerating the non-bottleneck work---individual coding---while the actual constraints (coordination, review, deployment, product clarity) remain unchanged or worsen,[^20] which is exactly the Goldratt pattern the whole document has been circling.

The practical implication: AI tools lower the cost of exploratory spikes. Use that savings to resolve more unknowns before committing---not to produce more estimates.

## The short version

- **Invest in scope and dependency mapping before investing in estimation.** Most plans miss because a cross-team dependency slipped, not because story points were wrong.
- **Estimate only when an estimate actually changes a decision.** Most sprint planning and quarterly roadmapping doesn't meet that bar.
- **Match the method to the situation.** Delivery history when you have it, appetite-setting when you don't, and an unknowns-first options-based approach for specific practitioner work.
- **Express uncertainty as a range.** A single number with a verbal hedge is the worst of both worlds.

## Sources and further reading

- DeGrandis, D. (2022). *Making Work Visible: Exposing Time Theft to Optimize Work & Flow*, 2nd ed. IT Revolution Press. [itrevolution.com](https://itrevolution.com/product/making-work-visible/)
- Goedecke, S. (2026). *How I Estimate Work as a Staff Software Engineer.* [seangoedecke.com](https://www.seangoedecke.com/how-i-estimate-work/)
- Goldratt, E. (1984). *The Goal.* North River Press. [northriverpress.com](https://northriverpress.com/the-goal-30th-anniversary-edition/)
- Goldratt, E. (1997). *Critical Chain.* North River Press. [northriverpress.com](https://northriverpress.com/critical-chain-eliyahu-m-goldratt/)
- Singer, R. (2019). *Shape Up: Stop Running in Circles and Ship Work that Matters.* Basecamp. [basecamp.com/shapeup](https://basecamp.com/shapeup) *(free online)*
- Vacanti, D. (2015). *[Actionable Agile Metrics for Predictability](https://actionableagile.com/books/aamfp/).* ActionableAgile Press.
- Vacanti, D. (2020). *[When Will It Be Done?](https://actionableagile.com/books/wwibd/)* ActionableAgile Press.
- Magennis, T. *Focused Objective --- probabilistic forecasting tools and spreadsheets.* [focusedobjective.com](https://www.focusedobjective.com/)
- Stanier, J. (2025). *[The Beauty of Constraints](https://www.theengineeringmanager.com/growth/the-beauty-of-constraints/)* and *[One Bottleneck at a Time](https://www.theengineeringmanager.com/growth/one-bottleneck-at-a-time/).* The Engineering Manager.
- Hinshelwood, M. (2025). *Service Level Expectation.* [nkdagility.com](https://nkdagility.com/resources/service-level-expectation/)
- Planview (2023). *Using Flow Metrics to Optimize Software Delivery.* [planview.com](https://www.planview.com/resources/articles/using-flow-metrics-to-optimize-software-delivery/)
- Stephens, R. (2025). *DORA 2025: Measuring Software Delivery After AI.* [RedMonk](https://redmonk.com/rstephens/2025/12/18/dora2025/)
- Google DORA (2024). *Accelerate State of DevOps Report.* [dora.dev](https://dora.dev/research/2024/dora-report/)
- McLean, P. (2020). *Lean Portfolio Management: Managing Cross-Functional Dependencies.* [Medium](https://patrickmclean-88888.medium.com/lean-portfolio-management-managing-cross-functional-dependencies-e7ec4fee91e5)
- Parker, A. (2025). *Navigating Estimation Risks: A Closer Look at Underestimation of Effort.* [iseoblue.com](https://iseoblue.com/post/navigating-estimation-risks-in-projects-a-closer-look-at-underestimation-of-effort/)
- CIO.com (2025). *How Software Architects and Project Managers Can Leverage Agentic AI.* [cio.com](https://www.cio.com/article/4058031/how-software-architects-and-project-managers-can-leverage-agentic-ai.html)

[^mc-notation]: In formal notation, each trial $j$ computes $k^{(j)} = \min\left\lbrace k : \sum_{i=1}^{k} W_i^{(j)} \geq 40 \right\rbrace$ where $W_i^{(j)} \sim \text{Uniform}(\text{history})$, and the forecast percentiles come from $\lbrace k^{(j)} \rbrace_{j=1}^{10{,}000}$.

[^degrandis]: DeGrandis, D. *[Making Work Visible: Exposing Time Theft to Optimize Work & Flow](https://itrevolution.com/product/making-work-visible/)*, 2nd ed. IT Revolution Press (2022). The five thieves, the dependency probability argument, and the queueing theory basis for the ~80% capacity ceiling are all from this book. The Time Thief O'Gram---a visual tool for tracking the ratio of planned to unplanned work by category---is DeGrandis's practical mechanism for measuring these thieves rather than just naming them.

[^1]: The framing of estimation as a "polite fiction" and the observation that the gap between fiction and reality "causes a lot of strange activity in tech companies" is Goedecke's, from *How I Estimate Work as a Staff Software Engineer* (2026).

[^2]: The five focusing steps are from Goldratt, *The Goal* (1984). The application to software team bottlenecks---PRs, platform dependencies, deployment gates---draws on Stanier, *One Bottleneck at a Time* (2025).

[^2b]: Goldratt, E. *Critical Chain* (1997). North River Press. Critical path analysis ignores resource constraints---the scarce people, skills, or capacity that multiple tasks compete for---so every task owner pads their own estimate as self-protection. This distributed padding hides the real bottleneck and makes the overall schedule dishonest. Critical chain identifies the binding resource constraint explicitly, strips per-task padding, and replaces it with a single project buffer at the end.

[^3]: Direct quote from Singer, *Shape Up* (2019), Chapter 3.

[^5]: Direct quote from Stanier, *The Beauty of Constraints* (2025), The Engineering Manager newsletter.

[^6]: Goedecke's central argument in *[How I Estimate Work](https://www.seangoedecke.com/how-i-estimate-work/)* (2026). His specific formulation: "If an engineering team comes up with a long estimate for a project that some VP really wants, they will be pressured into lowering it."

[^7]: The point that engineering's ability to credibly say "this is impossible" depends on having built trust through pragmatic estimates is also Goedecke's.

[^8]: Goedecke specifically names this dynamic: "many engineering teams estimate work in t-shirt sizes instead of time, because it just feels too obviously silly to give direct time estimates. Naturally, these t-shirt sizes are immediately translated into hours and days when the estimates make their way up the management chain."

[^9]: Lead time for changes, deployment frequency, change failure rate, and mean time to recover as the core delivery performance metrics: Google DORA, *Accelerate State of DevOps Report* (2024), dora.dev.

[^10]: Monte Carlo simulation on cycle time and throughput data as the basis for software delivery forecasting: Vacanti, D. *Actionable Agile Metrics for Predictability* and *When Will It Be Done?* ActionableAgile Press; also Troy Magennis' throughput forecasting work at Focused Objective.

[^11]: The observation that tightening throughput variability improves forecast quality more than tightening estimates is implicit in Vacanti's framework: the fundamental assumption of Monte Carlo simulation is that the future resembles the past---meaning a stable, consistent process is a prerequisite for useful forecasting.

[^12]: The appetite concept and its application to teams working in unfamiliar codebases is an extrapolation from Singer, *Shape Up* (2019). Singer develops it primarily for new features; the application to new-domain estimation is this document's synthesis.

[^13]: Singer, *Shape Up*, on shaping as pre-work that reduces cycle risk: "We shape the work before giving it to a team... we focus less on estimates and more on our appetite."

[^14]: The argument that unknown work dominates software projects and cannot be estimated in advance, while only known work can be estimated reliably, is Goedecke's core technical claim in *How I Estimate Work* (2026).

[^15]: Goedecke's practice of going to the code with a target range already in hand---asking "which approaches could be done in one week?" rather than "how long would this take?"---and focusing investigation on the unfamiliar parts of the codebase ("dark forests"), is from *How I Estimate Work*.

[^16]: The structure of returning with a menu of options---each with a scope, timeline, and risk profile---is Goedecke's method: "I go back to my manager with a series of plans, not just one."

[^17]: The argument that publishing only the most likely estimate is dangerous because it misses the uncertainty that matters for planning is from Parker, *Navigating Estimation Risks* (2025), iseoblue.com.

[^18]: The "80% complete and accurate" figure for AI-generated architecture is from CIO.com (2025), *How Software Architects and Project Managers Can Leverage Agentic AI*.

[^19]: The 75%/decreased-throughput paradox is from the DORA 2024 report, as quoted in Stephens, *DORA 2025: Measuring Software Delivery After AI*, RedMonk (2025).

[^20]: The "wrong constraint" hypothesis---that AI accelerates individual output while leaving system-level bottlenecks unchanged---is Stephens' analysis of the DORA data, RedMonk (2025).
