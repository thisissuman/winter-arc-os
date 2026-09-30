# Scheduling, adherence, and scoring

## Status

Accepted calculation contract; no scoring engine exists yet. Implement and unit-test this in Phase 2, then reuse it in fitness, career, and Insights. All examples below are illustrative fixtures, not actual user performance. See [PRODUCT](../PRODUCT.md), [schema design](ARCHITECTURE.md), and [QA](QA.md).

## Calendar and effective rules

Use business calendar dates in the user's capture timezone, initially Asia/Kolkata. ISO weekdays are Monday=1 through Sunday=7; initial week starts Monday. A month is a calendar month, not a rolling 30 days. Calendar arithmetic must not assume every day has 24 elapsed hours.

Challenge date endpoints are inclusive. Rule-version intervals are start-inclusive/end-exclusive. For each opportunity choose the rule active on that date. A missing/overlapping required rule is a configuration error, not an invented zero expectation.

Daily expectation changes take effect the following local day; weekly/monthly quotas take effect at the next corresponding period boundary. Scoring policies have period scope: daily policy edits begin next day, weekly policy edits next week, monthly edits next month. Retain prior versions. Initial creation begins on setup day unless deliberately backdated.

Timezone changes apply to future captures and do not re-date stored logs. Week-start changes apply at the next weekly boundary; retain the week-start context used for existing frequency rule/policy periods. Old review anchors and historical score periods remain fixed. Queries use retained period context rather than re-bucketing every past event with the newest preference.

Archive ends future eligibility from its recorded effective cutoff, not all prior eligibility. Challenge-scoped evaluation intersects tracker active dates with the challenge range. Changing a challenge range deliberately changes that view; it does not mutate underlying records.

## Habit schedules and states

| Frequency | Required opportunities |
| --- | --- |
| DAILY | Every active date |
| WEEKDAYS | Monday–Friday in the active range |
| SPECIFIC_DAYS | Configured ISO weekdays |
| TIMES_PER_WEEK | A quota across a week, with no forced daily obligation |
| TIMES_PER_MONTH | A quota across a calendar month |
| CUSTOM | Every positive N days from an anchor date |

For custom recurrence, evaluate nonnegative calendar-day distance from the anchor modulo N. Dates before the anchor are not due.

For daily count habits, expected count defaults to one. Completion contribution is `min(completion_count / expected_count, 1)`. Binary completion is therefore exactly 1 or 0. Retain excess occurrence counts even though their contribution is capped.

Past required days with no completion are missed. Today's unlogged opportunity is pending and contributes zero to the provisional daily score; it does not break yesterday's streak until the day closes. Explicit missed/skipped contributes zero. Future days, unscheduled days, and dates outside the active range are excluded.

Period-quota habits show recorded occurrence counts by date in the grid. An empty date in a flexible quota period is not a missed daily habit. Evaluate quota success at period level. Derive unscheduled/future/pending states rather than filling the database with synthetic log rows.

## Raw metrics

Retain the full numeric input in canonical units. Display conversions never overwrite raw values. Absence is null/not logged, not a measured zero. For a required scored metric, missing input contributes zero and is labelled missing.

| Direction | Adherence for positive target T and nonnegative actual A |
| --- | --- |
| Minimum | `min(A / T, 1)` |
| Maximum | 1 when `A <= T`; otherwise `T / A` |
| Observation | No score contribution |

Minimum/maximum ratio targets must be positive; reject zero/negative targets. A logged zero is valid and meets a maximum target. Body weight is observational unless explicitly configured otherwise. No score bonus for exceeding targets in V1.

Derived study/sleep metrics read their source records; prohibit duplicate manual logs for the same definition. A source not yet delivered by the application is unavailable and excluded with a reason. Its activation date is persisted when feature setup becomes available; pre-activation expectations stay excluded from historical scores. Once active, an absent required value contributes zero. Deliberate backdating is a separate user correction, not an automatic consequence of a release.

Example: protein 126 g with a 130 g minimum gives `126 / 130 = 0.969230...`, displayed as **96.9%**. Protein 160 g stays 160 g in history but contributes 100%.

Example: a 60-minute maximum with 90 minutes logged gives `60 / 90 = 66.7%`. An unlogged maximum is missing, not automatically compliant.

## Frequency and partial periods

Count completed source records only. Session mode counts sessions; distinct-day mode counts qualifying business dates once, regardless of multiple records that day. Gym counts completed workouts. Starter career quota counts completed study sessions. Walking counts days meeting the configured metric threshold.

For weekly/monthly quota Q, full period length L calendar days, and active intersection A calendar days:

**Required quota = ceil(Q × A / L)**

The active intersection includes tracker effective dates and, for a challenge view, challenge dates. It does not shrink merely because the current period has not ended. Weekly targets for an entire active week keep their full quota on Monday and are labelled in progress. If no dates are eligible, exclude the item.

A tracker created Friday with a four-session weekly quota and a Monday-start week has three eligible days: `ceil(4 × 3 / 7) = 2`. A full-week target with three of four sessions contributes 75%, even on an open Wednesday; its daily score remains unaffected.

Maintain the configured counting mode and effective rule in the result. Monthly quotas do not contribute to daily/weekly scores. Show their separate month progress.

## Score inputs, categories, and formula

Initial category weights are Fitness 30, Career 30, Recovery 15, Nutrition 15, Discipline 10. Names and weights are editable. Scoring categories are separate from life areas and UI categories. Each scored source is assigned once per policy with a positive item weight. Default item weight is one.

1. Find eligible inputs in the selected period/context using effective rules.
2. Compute each capped contribution `r_i` between 0 and 1.
3. For category k, compute `C_k = sum(w_i × r_i) / sum(w_i)` over its eligible inputs.
4. Exclude categories with no eligible inputs or zero category weight.
5. Compute `score = 100 × sum(W_k × C_k) / sum(W_k)` over eligible categories.

If no eligible positively weighted input remains, total is null and the UI reads **“No scheduled targets.”** Do not return 0 or 100 for an empty score. Keep full precision during calculations; round the displayed total to one decimal place. All-muted category weights are invalid configuration.

Return item/category contributions, effective policy, missing/unscheduled/unavailable exclusions, total, coverage, and provisional/final period state. Privacy presentation does not remove underlying score inputs.

### Daily score

Include only due daily habits and daily metric targets. Flexible weekly/monthly quotas are excluded. Today may display incomplete progress; future dates have no scored expectations.

### Weekly score

For each daily item, average contribution across due dates through the evaluation date using each date's effective expectation. Unscheduled dates are absent from the denominator. Then combine those per-item values with weekly metric/frequency contributions using the week's effective scoring policy. Completed weeks use all eligible dates.

Keep missing daily observations at zero contribution. Current-week quota contributions retain their prorated full active-period targets and are marked in progress. Daily and weekly scores answer different questions and are explicitly labelled.

### Duplicate-source exclusion

One source reference may appear once per score policy. If the policy includes a period-total version of a metric, exclude the same metric's daily-average version from that period score. For example, a weekly study-minute target supersedes its daily-minute aggregate in the weekly score.

Different dimensions can coexist: study minutes and completed study-session count are distinct expectations. Make their separate contributions visible. Reject accidental duplicate trackers targeting the same underlying behavior in starter setup instead of double-weighting it.

### Monthly evaluation

Use the same period evaluator for monthly daily opportunities and monthly quotas. Score trend/overall heatmap defaults to daily scores; weekly and monthly summaries keep their own explicit series. Do not blend differently defined scores into one unlabeled trend.

## Worked weighted example

Illustrative day with three eligible categories:

| Category | Eligible contributions | Category result | Weight |
| --- | --- | --- | --- |
| Career | Study 135/150 minutes | 0.9 | 30 |
| Nutrition | Protein 126/130 and water 3.5/3.5, equal item weights | 0.984615... | 15 |
| Discipline | One due habit completed | 1 | 10 |

Fitness and Recovery have no scheduled inputs and are excluded. The denominator becomes 55:

`100 × (30 × 0.9 + 15 × 0.984615... + 10 × 1) / 55 = 94.125874...`

Display **94.1 / 100**. A weekly gym target at 3/4 appears separately; it does not change that day's 94.1.

## Streaks, consistency, and analytics

Daily-habit streaks traverse scheduled opportunities, not consecutive calendar days. Non-required days do not break a streak. A missed/skipped closed opportunity breaks it. Pending today preserves the prior streak; completing today extends it. Longest streak uses completed opportunity runs across historical schedule versions. Quota habits use period attainment/consistency; do not present day streaks for them.

Binary habit consistency is completed opportunities divided by required opportunities. Count habits use capped count adherence; label this distinction. Frequency consistency is quota adherence or attained-period percentage, with its denominator shown. Missing measurements stay missing in averages while contributing zero to required-target adherence.

Weight seven-day moving average uses recorded values within the seven calendar dates ending on the selected date. Weekly averages use recorded values in that calendar week. Show observation count; do not interpolate missing measurements or fill them with zero.

Timestamped study sessions split elapsed seconds at local midnight using their retained timezone. Manual duration-only sessions belong to their chosen date. Session-frequency counting counts each completed session once on its completion business date. Sleep duration belongs to the wake business date.

Heatmaps distinguish no eligible inputs, eligible zero performance, partial score, today, and future. Tooltips/text alternatives show date, score or absence reason, and completed/required inputs. Bounded category/source heatmaps use the same eligibility rules.

Week-over-week comparisons of open periods compare equivalent elapsed local weekdays and disclose coverage. An entire previous week is not compared to three current days without a label. Historical aggregate views use historical rules, not today's targets.

Challenge timing: `total_days = end - start + 1`; within range `day_number = date - start + 1`. Show upcoming/finished states outside the range. End-of-day time progress is clamped `day_number / total_days`; days after today are `max(end - date, 0)`, labelled as such. On September 30, 2026 the seed challenge is day 30 of 92, time progress 32.6%, with 62 days after today. This time progress is never tracking adherence.

## Required calculation cases

Test empty categories, all unscheduled inputs, missing versus measured zero, skipped zero, minimum/maximum targets, overachievement, weighted renormalization, quota proration, open/final periods, rule changes, policy changes, unavailable sources, duplicate exclusion, weekend/custom recurrence, archive cutoff, challenge intersections, timezone/week-start history, DST, leap dates, and overnight sessions. The complete test matrix is in [QA](QA.md).
