---
title: Capacity at Multiple Levels
date: 2026-05-06T22:50:05-06:00
tags: [capacity, planning, flow, wip]
toc: true
series: [Essays with AI]
summary: |-
  Determining team and organization capacity for work is relatively simple in theory, and gets messy and even emotional in practice.
  Here's a synthesis of a lot of practices from across a bunch of books, articles, and tech companies into a single playbook.
draft: false
images: [specialization-heat-map.png]
hero_alt: "Specialization heat map for a notional 10-person team showing per-person row-share of work across components"
---

# How Much Can We Do?

*How a large-scale SaaS engineering company can assess, quantify, and refine commitments based on engineering capacity.*

May 2026---written for CTOs, VPs, Directors, and TPMs in engineering-led SaaS organizations.

## The honest starting point

The [previous article](https://bitsby.me/blog/2026/04/14/estimation-at-multiple-levels/) was about estimation: how to figure out how long a piece of work will take. This one is the harder, more upstream question: how much work *should* a team commit to in the first place?

Those questions get conflated. They shouldn't be. Estimation answers "given this scope, what's the cost?" Capacity answers "given this team, what scope is responsible?" An organization that nails estimation and gets capacity wrong will still miss every quarter.

The polite fiction this time is the org chart. It says you have eighty engineers, so eighty engineers' worth of work can be done. The data, every time, says something much smaller. The gap between the two is where most quarterly plans break.

Capacity is what survives a series of subtractions from headcount × hours, every one of which is measurable. Most point to a system you already operate (HR, on-call rotation, Jira, calendar) that already has the data. Some of the conversion factors below are starting heuristics drawn from my own experience running engineering organizations; where that's true, I've said so. Replace them with your own measurements as soon as you can.

The argument in three parts:

1. **Capacity is what's left after four subtractions.** Available time, the specialist constraint, external wait time, and risk reserves. Each comes from a measurable input.
2. **WIP limits are the operational mechanism that enforces capacity.** A capacity number that lives only in a planning spreadsheet doesn't constrain the system on a Tuesday afternoon.
3. **Throughput history is the cross-check, not the primary number.** When the bottoms-up model and revealed throughput agree, you have a defensible plan. When they don't, the gap is the analysis.

---

## Part 1: Building the bottoms-up capacity number

There are four subtractions. The first three are calendar arithmetic. The fourth is probabilistic.

### Subtraction 1: Available time

The first subtraction is the one most planning frameworks skip: how much time engineers actually have for product work, after all the things that aren't product work.

The components are individually small but they compound, and they're all knowable from systems that already exist.

| Source | Where the data lives |
| --- | --- |
| Public holidays | Payroll calendar |
| PTO and sick days | HR system |
| On-call and support rotations | PagerDuty / rotation tool |
| Recruiting and interviewing | ATS, calendar |
| Training, learning, conferences | L&D system, calendar |
| Planning ceremonies and team meetings | Calendar |
| All-hands, town halls, retros | Calendar |
| New-hire ramp-up cost | Hire dates |
| Known parental leave, sabbaticals, planned medical leave | HR system |

Most of these are calendars or rosters that already exist. The two that need explicit modeling are on-call burden and ramp-up cost.

**On-call.** Primary on-call rarely consumes 100% of an engineer's productive time during their week, because incidents are bursty. It also rarely consumes 0%. A reasonable starting heuristic is that primary on-call costs 30% of productive output during the week, with secondary on-call costing 5--10%. The right number for your team is in your incident data: pull mean time-to-resolution × incidents-per-week and divide by 40.

**Ramp-up.** New engineers consume mentor capacity for some months before becoming net-positive contributors. The pattern is well-documented as a phenomenon, but the specific shape of the curve varies enough between organizations that any starting numbers I publish would be made up.[^1] The minimum required practice is to hold the curve as a parameter you tune against your own onboarding data: track the time from start date to first independent commit, first solo PR review, first incident handled, etc., and adjust the model.

For a typical 10-person US-based team with a couple of recent hires and one engineer in an on-call rotation, available time after these subtractions is usually noticeably less than headcount × hours. The worked example below shows the math.

### Subtraction 2: The constraint, not the aggregate

The second subtraction is the one that breaks most spreadsheet capacity models. Engineers are not fungible. The team's *aggregate* available time is rarely the right unit, because most work has skill or context requirements that bind throughput to a smaller subset of the team.[^2]

Two patterns to look for, with different remedies:

**Specializations are people.** The platform engineer who is the only one who can safely modify the auth system. The senior reviewer who approves most PRs. The data engineer responsible for the warehouse. When a class of work requires one of them, the team's capacity for that work is bounded by that person's available time, not by the team's. Remedies: cross-training, secondary ownership, pair programming, documented runbooks.

**Choke points are stages of work.** Production deployment that requires manual approval. Security review with a 5-business-day SLA. Architecture review that meets weekly. These constrain the system regardless of who's doing the upstream work. Remedies: automation, parallelization, or elimination.[^3]

Both produce backlogs. Both look the same on a kanban board. The remedies differ, so distinguishing them matters.

**The data lives in your issue tracker.** For the last completed quarter, build a heat map: rows are work types or components, columns are people, cells are the count of items each person delivered in each type. In Jira, the input data is one CSV export with `Component`, `Assignee`, and `Resolution Date`. The pivot is one Excel formula or one line of pandas. Color the cells by row-share---what fraction of each row's work went to that person---so the encoding stays meaningful regardless of team size or item counts.

{{< figure src="specialization-heat-map.svg" alt="Specialization heat map for a notional 10-person team. Sarah did 79% of auth/platform work and Lin did 90% of data warehouse work — both colored as dominant. Mike at 47% of frontend is a soft constraint. Backend services row is uniformly light because no individual contributed more than 20%." >}}

Three patterns jump out and matter for next quarter's plan:

- Sarah delivered 79% of auth/platform work. Capacity for auth/platform is bounded by Sarah's available time, not the team's.
- Mike delivered 47% of frontend work. Mike is a soft constraint; the team has some redundancy with Ravi and others.
- Lin delivered 90% of data warehouse work. Bus factor of 1. PTO, illness, or attrition for Lin zeroes out that work type.

Backend services and infrastructure are well-distributed; the team's aggregate capacity is the right unit there.

For the next-quarter plan, the relevant question becomes: of the proposed work, how much falls into each row? If 18% of the plan is auth/platform and Sarah handles 79% of auth/platform, then 0.18 × 0.79 = 14% of the *total plan* must come out of *Sarah's individual* capacity. That's the constraint test, applied per specialist. The most-binding test sets the cap.

### Subtraction 3: External wait time

The third subtraction doesn't reduce your team's available time, but it extends the calendar over which work commits. Treating it the same way as available-time subtractions is a category error; ignoring it produces missed dates regardless of how clean the capacity math is.

External wait time is duration during which an item is "in flight" but the team is not actively working it: security review, compliance and legal sign-off, third-party vendor SLAs, customer-side validation or UAT, cross-team dependencies on platform teams with their own roadmaps, procurement cycles for new tooling.

These show up in cycle-time data as long stretches in a non-working state with no PR activity. The data lives in two places:

- **Jira state-transition history.** Time-in-status data for "Awaiting Review," "In Validation," "Blocked," or whatever your workflow calls them. The Jira REST API exposes this via the `changelog` field on each issue.
- **GitHub PR activity** linked to the issue. The signal is an issue in flight without commits, PR reviews, or comments for some threshold (typically the 85th percentile time-in-state for that work type).

Pair the two and you can quantify external wait time per work type. A feature that requires 4 weeks of engineering plus 2 weeks of security review plus 1 week of customer UAT is a 7-week commitment, not a 4-week commitment, even though it consumes only 4 weeks of capacity. State both numbers when committing.

If your tracker doesn't have distinct states for these wait conditions, that's the first hygiene fix. Adding `In Security Review` and `In Customer Validation` columns to a board takes an afternoon and pays off the first time someone asks why a feature shipped late.

### Subtraction 4: Risk reserves

The fourth subtraction is probabilistic. The reserves come from your own historical base rates.

**Unplanned work.** Incidents, hotfixes, urgent customer escalations, security exceptions. The reserve is the team's own historical planned-to-unplanned ratio, measured from Jira labels or issue types. DeGrandis treats this as the single most important capacity protection a team can adopt: measure your actual ratio of planned to unplanned work, then reserve to match it.[^4] If your team has spent 22% of its cycle-time budget on unplanned work for the last three quarters, reserve 22% of next quarter's commitable capacity for it.

**Statistical attrition.** Your HR system has the team's annualized attrition rate. The reserve isn't for the departure itself but for the productivity loss around it: handover, recruiting load, mentor cost for the replacement. The cleanest way to model this is directly: expected departures per quarter × expected cost per departure. For a 10-person team at 12% annual attrition, expected departures over a 13-week quarter = 10 × 0.12 × (13/52) ≈ 0.3 people. If you observe handover plus recruiting plus replacement ramp-up costs roughly 4 person-weeks per departure (measure this in your own data; it varies considerably), the reserve is 0.3 × 4 ≈ 1.2 person-weeks. This is much smaller than rule-of-thumb percentage reserves I've seen cited elsewhere, but it's also more defensible.

**Foreseeable absences are not risks.** Parental leave dates, sabbaticals, and known notice periods are calendar events. They go in Subtraction 1 at full duration, not in Subtraction 4 probability-weighted.

**Illness.** If your historical PTO/sick number already includes typical illness days (most do, because it's coming from HR), don't add an illness reserve here---it's double counting. If it doesn't, a small additional reserve drawn from your trailing-12 data closes the gap.

### Putting the four subtractions together

The four subtractions compose, with one structural difference: external wait time extends the commitment calendar without changing the FTE total. The other three reduce FTE capacity directly.

The worked example below shows the math end to end.

---

## A worked example

A notional 10-person, US-based team. 13-week quarter ahead. Composition: 7 senior engineers, 2 mid-level, 1 engineer who started 6 weeks ago. One engineer carries primary on-call about one week per month. Two open hires in flight. One engineer has parental leave scheduled for weeks 7--13 of the quarter.

I'll work in **person-weeks** throughout. Gross capacity = 10 people × 13 weeks = **130 person-weeks**.

**Subtraction 1---available time:**

| Item | Calculation | Person-weeks lost |
| --- | --- | --- |
| Public holidays (≈2.5 days/quarter) | 2.5 days × 10 / 5 | 5.0 |
| PTO + sick (≈5 days/quarter average) | 5 days × 10 / 5 | 10.0 |
| On-call (1 person rotating, 30% productivity loss during week) | 0.30 × 13 | 3.9 |
| Recruiting load (4 panelists × 5 hrs/wk × 13 wks) | 260 hrs / 40 | 6.5 |
| Ceremonies, training, all-hands (~8% averaged) | 0.08 × 130 | 10.4 |
| New-hire ramp-up (1 hire ~62% productive avg + 10% mentor cost on 2 seniors) | 4.9 + 2.6 | 7.5 |
| Known parental leave | 7 weeks × 1 person | 7.0 |
| **Total subtracted** | | **50.3** |
| **Available time** | 130 − 50.3 | **79.7** |

**Subtraction 2---specialist constraint:**

The team's specialization heat map (above) shows Sarah at 79% of auth/platform, Mike at 47% of frontend, Lin at 90% of data warehouse. Each specialist's individual available time, after Subtraction 1, is roughly their fair share of 79.7 (allowing for some variation): assume Sarah and Lin have ≈ 8 person-weeks each, Mike has ≈ 8 person-weeks.

Next quarter's proposed plan composition:

- Auth/platform: 18%
- Frontend: 22%
- Data warehouse: 8%
- Backend services: 47%
- Infrastructure: 5%

Constraint tests, where T is total plan size in person-weeks:

| Specialist | Test | Bound |
| --- | --- | --- |
| Sarah (79% of auth, 18% of plan) | 0.18 × 0.79 × T ≤ 8 | T ≤ 56.3 |
| Mike (47% of frontend, 22% of plan) | 0.22 × 0.47 × T ≤ 8 | T ≤ 77.4 |
| Lin (90% of warehouse, 8% of plan) | 0.08 × 0.90 × T ≤ 8 | T ≤ 111.1 |

Sarah binds first, at **56.3 person-weeks**. The team's aggregate available time of 79.7 is the soft cap, but Sarah's specialty caps it tighter than that. The spare 79.7 − 56.3 = 23.4 person-weeks of non-specialist capacity is genuine slack, available for unplanned work, opportunistic fixes, or cross-training to widen Sarah's bottleneck for next quarter.

**Subtraction 3---external wait time:**

Two of the proposed initiatives require security review (5 business days at the 85th percentile, per Jira state-transition data). One requires customer UAT after delivery (2 weeks, per the customer's contract). These don't change the 56.3 person-week effort total but extend the commit dates for those specific initiatives by 2--3 weeks each.

Effort total unchanged: **56.3 person-weeks**, with calendar adjustments noted per initiative.

**Subtraction 4---risk reserves:**

| Reserve | Source | Person-weeks |
| --- | --- | --- |
| Unplanned work (21% of historical throughput) | Jira labels, last 3 quarters | 11.8 |
| Statistical attrition (12% annual × 0.25 quarter × 4 person-weeks/departure) | HR system | 1.2 |
| Illness reserve | (already in PTO/sick number; no double count) | 0 |
| **Total reserves** | | **13.0** |

**Final commitable capacity: 56.3 − 13.0 = 43.3 person-weeks.**

That is **3.33 FTE-quarters** from a 10 FTE-quarter headline. A 67% reduction.

The number isn't precise. Several conversion factors above (the 30% on-call loss, the 8% ceremonies, the 62% ramp-up productivity) are starting points to be tuned with your own data. But the structure is defensible: every line in the table points to a system that has the data, every reduction is shown, and every input can be argued *with* rather than away.

If the next-quarter plan calls for more than 43 person-weeks of work, that gap is the conversation. If revealed throughput from the previous three quarters averaged 40 person-weeks, the bottoms-up estimate agrees within 8% and the model is plannable. If revealed throughput averaged 20 person-weeks, the model is overstating capacity by 100% and the question is which of the four subtractions is too small.

---

## Part 2: WIP limits and choke points

A capacity number that lives only in a planning spreadsheet doesn't constrain the system on a Tuesday afternoon. The day-to-day mechanism is **work-in-progress limits**, and the framework that makes them work is Little's Law.

### Little's Law

For any stable system in steady state:

> Average cycle time = Average WIP ÷ Average throughput[^5]

Two of the three numbers determine the third. If WIP doubles and throughput stays flat, cycle time doubles. If you want predictable cycle times, the only lever the team controls in real time is WIP.

This is also why running near 100% utilization breaks predictability. Queueing theory (formally, the Pollaczek--Khinchine formula and its M/M/1 special case) shows wait time growing as 1/(1−ρ), where ρ is utilization.[^6] At 80% utilization, wait time is 5× the service time. At 90%, it's 10×. At 95%, it's 20×. The wall isn't gradual.

Reinertsen's *Principles of Product Development Flow* develops the implications at length, including the observation that the dominant management orthodoxy (efficiency is good, idle capacity is waste) combined with the invisibility of queues in product development "drive[s] us to disastrous levels of capacity utilization."[^7] The remedy isn't lower ambition. It's running the system below 100% on purpose, so variability has somewhere to go.

### Setting WIP limits in practice

The mechanics are simple; the discipline is hard.

1. **Measure current actual WIP per stage.** For each column on the board, measure the running average over the last 4--8 weeks (not the peak, not the median; mean WIP is what Little's Law actually wants).
2. **Set the initial limit a step below current actual.** Anderson's *Kanban* doesn't prescribe a specific reduction; the practical heuristic in my experience is around 80% of current actual, but the right answer depends on how hot your team is running. Adjust based on what happens.[^8]
3. **Identify aging WIP.** For each work item in flight, compute time-in-current-state. Compare to the team's 85th-percentile time-in-state for that work type, computed from the trailing 90 days of completed items. Anything over the 85th percentile is aging. Refresh daily.
4. **Adjust limits where work piles up.** The column that hits its WIP limit consistently is the constraint. That's where capacity needs to be lifted, or where work needs to be subordinated upstream.

WIP limits also operationalize Goldratt's subordination step: when the constraint stage is full, upstream stages have to *stop starting new work* and instead help unblock the constraint, even if their own queues are empty.[^9] This is counter-intuitive for engineers who prefer to keep moving. It is also the only intervention that actually shortens cycle time for the system as a whole.

### Mapping choke points across the org

At the organization level, the common choke points across SaaS engineering are predictable: code review (especially senior-reviewer-bound changes), production deployment when manual or gated, security review for changes touching authentication or PII, architecture review for cross-team or platform-affecting changes, cross-team API contracts between teams with mismatched roadmaps, QA or release validation when separated from the development team, and product or design sign-off when the cadence doesn't match engineering's.

A directory-level inventory is more actionable than any roadmap: for each likely choke point, the typical wait time at the 85th percentile, the team that owns it, and the items currently waiting on it. Updated weekly, it tells you where the system constraint is right now.

{{< figure src="choke-point-inventory.svg" alt="Choke-point inventory for one week, showing seven stages where work waits with bar charts of 85th-percentile wait time vs. target SLE. Architecture review (9 days vs 5 day target) and security review (7 days vs 5 day target) are red, with 4 and 5 items waiting respectively — the active constraints. In-team stages and external SLE are green or within target." >}}

A note on where these targets come from. A **Service Level Expectation (SLE)**[^10] isn't an industry benchmark or a published guideline. It's an internal commitment a team or org makes to itself, derived from its own cycle-time data: typically something like "85% of items in this state will clear in N days or fewer," where N is set by looking at the team's actual distribution and picking a target that's slightly tighter than today's reality. The "5 day target" for security review in the example above isn't an external rule; it's what the security team committed to maintaining, based on what they've actually been able to do. SLEs only have force when the team that owns the stage signs up to them.

The diagnostic question every week is the same: which stages are over their target SLE, and how many items are queued behind them? In the example above, architecture review and security review are both blocking, with 9 items stuck behind them combined. Adding capacity to either stage, or finding a way to subordinate work that doesn't need them, will move more throughput than any individual team's effort. The constraint is outside the team.

### Specialization mapping at the org level

Specializations across the org follow the same pattern. The director-level question, every month, is: for each specialization, who has it, and how much of the work proposed for next quarter requires it? A two-column table---specialization on one side, individual available capacity in person-weeks on the other---turns "we don't have enough platform capacity" from a feeling into a number, and surfaces hiring or cross-training priorities concretely.

This also reframes hiring decisions. Adding engineers to a team whose constraint is a specialization those new engineers don't have does not increase the team's capacity for the constrained work; in the short term it decreases it, because the existing specialists now spend mentoring time on the new hires.

---

## Part 3: Throughput history as the cross-check

The bottoms-up model produces a number. The team's revealed throughput from the issue tracker produces another number. The most useful thing you can do is compare them.

If they agree to within ~10--15%, the model is approximately right. Trust the rollup, plan against it.

If the bottoms-up model substantially exceeds revealed throughput, the model is missing something. The most common causes:

- A hidden choke point: the actual bottleneck isn't where you thought.
- Specialization overload: one person is the actual constraint and is at 100% utilization.
- Unplanned work is higher than the labeled-Jira data suggests, because the labeling is incomplete.
- Cycle time has degraded due to high WIP, and "throughput" looks low because nothing is finishing.

If the bottoms-up model is substantially below revealed throughput, either the team is heroically overcommitting and headed for burnout, or one of the reserves is set too high.

The forecasting techniques from the [estimation article](https://bitsby.me/blog/2026/04/14/estimation-at-multiple-levels/#when-you-have-delivery-history-use-probabilistic-forecasting)---Monte Carlo simulation on historical throughput, P50 and P85 percentiles---are the right toolkit for the revealed-throughput side. The point isn't to use the forecast as the capacity number. It's to use it as the cross-check on the bottoms-up model.

---

## By level: the right questions at each horizon

### CTO / VP --- quarterly and annual capacity at the portfolio level

- **Is each team operating against a documented capacity number, with all four subtractions visible?** Plans built on headcount × hours will miss for invisible reasons; plans built on the four subtractions might still miss, but the misses will be diagnosable.
- **Where is the org-level constraint?** Across teams, what choke point or specialization is most consistently bound? That's where the next dollar of investment changes throughput; anywhere else, it doesn't.[^9]
- **What is the org-level planned-to-unplanned ratio, and is it trending?** A rising unplanned share is often the earliest visible sign that the org is over-committed, weeks or months before any milestone slips.
- **Are SLEs being met across the org's choke points?** Security review, deployment, code review, architecture review---the 85th-percentile wait times are what the rest of the business experiences. If they're degrading, the constraint is moving.[^10]

### Director --- monthly and initiative-level commitment health

- **Per-team commitment ratio against the defensible capacity number.** Anything above 80% should be a deliberate decision with named contingency, not a default.
- **WIP relative to WIP limits.** Teams without WIP limits accumulate WIP until cycle time degrades; teams with WIP limits give a leading indicator before the calendar does.
- **Specialization heat checks.** For each specialist on each team, what fraction of next month's plan requires them, and what's their available capacity? Specialists run hot first; the early warnings live here.
- **Aging WIP.** Items past the team's 85th-percentile time-in-state for their current state are the leading indicator of where the constraint has moved.
- **Trends in the planned-to-unplanned ratio.** A team whose unplanned share is climbing month over month is heading for missed commitments before the quarter ends.

### TPM and team --- sprint and weekly delivery

- **Throughput vs. forecast.** Track each week's throughput against the simulation's expected range. A few low weeks aren't a signal; a run of low weeks is.
- **WIP visibility, with limits per column.** The team should feel a WIP limit before a director does, and the conversation about lifting one should be local.
- **Aging items.** Anything past the team's SLE for its current state is a now-problem to address that day, not at the next standup.
- **Dependency unblocking.** The dependency map from quarterly planning should be reviewed weekly. The TPM-level question: which dependencies are aging, and who owns moving them?
- **Distinguish commitment from forecast.** A sprint commitment is what the team will deliver. A sprint forecast is what they might also get to. Conflating these produces the chronic near-miss that erodes trust upward.[^11]

---

## Recommendations for a large-scale SaaS engineering org

1. **Build a defensible bottoms-up capacity number per team, with all four subtractions visible.** It is more important that the math is shown than that the number is precise. A capacity number listing holidays, PTO, on-call, recruiting, ramp-up, specialist constraint, external wait time, and risk reserves can be argued *with*, not *away*.

2. **Treat the calendar as the source of truth for available time.** PTO, parental leave, sabbaticals, and known absences are calendar events, not unknowns. They appear in the model at full duration the moment they're known.

3. **Build a specialization heat map at the team level, monthly.** One CSV from your issue tracker, one pivot table. The output answers two questions: who is a single point of expertise, and what fraction of next month's plan depends on each of them.

4. **Inventory choke points at the director level, weekly.** For each likely choke point in the org, the typical 85th-percentile wait time, the owner, and the items currently waiting. This is the most actionable single artifact for cross-team delivery health.

5. **Set WIP limits everywhere---per team, per column, per choke point.** Start a step below current actual; adjust based on aging WIP. Without WIP limits, the planning number is decorative.

6. **Track aging WIP as the primary leading indicator.** It moves before throughput does, before cycle time does, before any milestone slips. If you only track one operational metric weekly, this is the one.[^12]

7. **Cross-check the bottoms-up model against revealed throughput every quarter.** When they disagree by more than the team's natural variability, find out why before the next planning cycle. The disagreement is the diagnostic work.

8. **Reserve for unplanned work at the historical rate, not the aspirational one.** "We're going to reduce incidents this quarter" is not a planning input; the measured incident rate from the last three quarters is. If the rate genuinely drops, capacity expands automatically next cycle.[^4]

9. **State capacity and calendar as separate numbers in any commitment.** External wait time extends the calendar without consuming capacity. Both numbers matter for the audience receiving the commitment.

10. **Stabilize before you optimize.** Following Deming, a system needs to be in statistical control before targets become useful. A team with high throughput variability does not benefit from a tighter commitment; it benefits from understanding its own variability first.[^13]

---

## The short version

- Headcount × hours is the headline. The defensible number is what's left after four subtractions: available time, the specialist constraint, external wait time, and risk reserves.
- Available-time data already exists. Sum the line items from systems you already operate. Expect a meaningful reduction before anything else is touched.
- Engineers are not fungible. Map specializations and choke points. The team's capacity for a given work type is bounded by the specialists who can do it.
- External wait time extends commitment dates without consuming capacity. State both numbers.
- Risk reserves come from your own historical base rates, not from rules of thumb.
- WIP limits are the operational enforcement mechanism.
- Cross-check bottoms-up against revealed throughput. The gap is the analysis.

---

## Sources and further reading

- Anderson, D. (2010). *Kanban: Successful Evolutionary Change for Your Technology Business.* Blue Hole Press.
- DeGrandis, D. (2022). *Making Work Visible: Exposing Time Theft to Optimize Work & Flow*, 2nd ed. IT Revolution Press. [itrevolution.com](https://itrevolution.com/product/making-work-visible/)
- Goldratt, E. (1984). *The Goal.* North River Press. [northriverpress.com](https://northriverpress.com/the-goal-30th-anniversary-edition/)
- Goldratt, E. (1997). *Critical Chain.* North River Press. [northriverpress.com](https://northriverpress.com/critical-chain-eliyahu-m-goldratt/)
- Hinshelwood, M. (2025). *Service Level Expectation.* [nkdagility.com](https://nkdagility.com/resources/service-level-expectation/)
- Little, J.D.C. (1961). *A Proof for the Queueing Formula: L = λW.* Operations Research, 9(3).
- Reinertsen, D. (2009). *The Principles of Product Development Flow: Second Generation Lean Product Development.* Celeritas Publishing.
- Stanier, J. (2025). *[The Beauty of Constraints](https://www.theengineeringmanager.com/growth/the-beauty-of-constraints/)*, *[One Bottleneck at a Time](https://www.theengineeringmanager.com/growth/one-bottleneck-at-a-time/)*, *[Being in the Details](https://www.theengineeringmanager.com/growth/being-in-the-details/)*. The Engineering Manager.
- Stanier, J. (2026). *[One List to Rule Them All](https://www.theengineeringmanager.com/growth/one-list-to-rule-them-all/).* The Engineering Manager.
- Vacanti, D. (2015). *[Actionable Agile Metrics for Predictability](https://actionableagile.com/books/aamfp/).* ActionableAgile Press.
- Vacanti, D. (2020). *[When Will It Be Done?](https://actionableagile.com/books/wwibd/)* ActionableAgile Press.

---

[^1]: The "contribution curve"---that new engineers consume more than they produce for some period before turning net-positive---is widely observed in practice but does not have a single canonical citation with specific percentages. The shape varies considerably by codebase complexity, hiring level, and onboarding investment. Hold whatever curve you use as a parameter to be tuned, not a constant.

[^2]: Goldratt, *The Goal* (1984), Ch. 17--18 on the constraint determining throughput. Stanier's *One Bottleneck at a Time* (2025) develops this for software teams specifically. The corollary that team-aggregate capacity numbers can overstate the team's ability to deliver any given specific scope follows directly from the focusing-on-the-constraint argument.

[^3]: The distinction between specialization-based bottlenecks (people) and stage-based choke points (process steps) is foundational in the kanban literature. Anderson, *Kanban* (2010), is the original treatment for software.

[^4]: DeGrandis, D. *[Making Work Visible](https://itrevolution.com/product/making-work-visible/)* (2022). The five thieves of time, the planned-to-unplanned ratio as the practical capacity buffer, and the Time Thief O'Gram for tracking these are all from this book. Platform teams typically run higher unplanned ratios than feature teams because they absorb the org's incident load.

[^5]: Little, J.D.C. (1961). *A Proof for the Queueing Formula: L = λW*, Operations Research 9(3). Little's Law is true for any stable system in steady state, regardless of arrival or service distribution. Vacanti's flow-metrics work is the most accessible application to software teams; *When Will It Be Done?* (2020) walks through the practical implications for engineering managers.

[^6]: The 1/(1−ρ) relationship is the M/M/1 result. The Pollaczek--Khinchine formula generalizes to non-exponential service distributions; both predict that as utilization approaches 1, queue size and wait time grow without bound. The 5×, 10×, 20× multipliers at 80%, 90%, 95% utilization are direct consequences.

[^7]: Reinertsen, D. *The Principles of Product Development Flow* (2009), Ch. 1. The full argument: combining "efficiency is good" with "queues are invisible in product development" produces "disastrous levels of capacity utilization" because the cost of the queues is hidden until cycle time has already collapsed.

[^8]: Anderson, *Kanban* (2010), discusses WIP-limit selection as an empirical adjustment process rather than a formula. The starting heuristic of "a step below current actual" is mine; the practical point is to start somewhere that imposes mild pressure and adjust based on what happens.

[^9]: Goldratt's five focusing steps from *The Goal* (1984): identify the constraint, exploit it, subordinate everything else to it, lift it, then repeat. The subordination step---telling the fast parts of the system to slow down or redirect---is the part most leadership instincts resist. Stanier's *One Bottleneck at a Time* (2025) makes the case for it explicitly in the engineering context.

[^10]: Hinshelwood, M. *Service Level Expectation* (2025), [nkdagility.com](https://nkdagility.com/resources/service-level-expectation/). An SLE is a probabilistic statement of cycle time derived from the team's own data; its value as a leading indicator follows from being measurable in real time against a target the team's own history justifies.

[^11]: The distinction between commitment and forecast in sprint planning is implicit in much of the agile literature; the framing here follows Vacanti's treatment in *When Will It Be Done?* (2020).

[^12]: Aging WIP as the leading operational indicator is from the kanban literature; Anderson, *Kanban* (2010) is the original treatment. The argument: throughput is trailing, cycle time is trailing, but aging WIP can be observed in real time and the team can act on it the same day.

[^13]: The Deming sequence---bring the system into statistical control first, *then* set targets---is the foundational argument of *Out of the Crisis* (1986). The implication for engineering capacity is that targets imposed on an unstable system make it worse, not better; teams optimize the metric rather than the outcome.
