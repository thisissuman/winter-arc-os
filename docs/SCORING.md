# Winter Arc OS — habit history and consistency

## Status

Accepted replacement contract, October 3, 2026; implemented and verified in development; full authenticated browser checks pass. **There are no scores in the simplified product.** The filename remains for stable documentation links. The former weighted scoring, quotas, metrics, timers, challenge evaluation, streaks, and comparisons are [historical](history/2026-10-03-pre-simplification/docs/SCORING.md), not requirements for the new app.

## Calendar rules

Store timestamps in UTC and preserve local business dates and captured timezone for habit logs. Default timezone is Asia/Kolkata; default week begins Monday. Use calendar-day arithmetic, not elapsed 24-hour intervals. Leap days, month transitions, and daylight-saving days remain valid dates.

Timezone changes affect future captures/current-day determination without re-dating any stored log or schedule. Week-start is a calendar grouping preference in this score-free product; changing it changes the displayed week range without rewriting dated records. There are no saved review anchors or quota/score policies to migrate.

A habit begins on its creation business date. Schedule intervals are inclusive at effective_from and exclusive at effective_until. An archive cutoff is also exclusive: archiving today sets archived_from to tomorrow, preserving today's eligibility and every prior date.

Daily schedules select all ISO weekdays 1–7. Selected weekdays is a unique nonempty subset. No custom intervals, every-N-days anchors, weekly/monthly quotas, or count requirements.

## Effective schedule changes

Create a habit and its first schedule together starting today. An edited schedule starts tomorrow; close the preceding version at that date. Earlier dates keep their previous weekday selection. Multiple edits before tomorrow replace the pending version; they must not create duplicate or overlapping intervals.

Name edits apply immediately, since the smaller product does not version labels. Archive preserves history and closes future eligibility tomorrow. No restore workflow in the initial version; deletion is separate and explicit.

Missing/overlapping schedule coverage for an active habit is a configuration/storage error. Do not silently invent obligations or declare it completed.

## Five date states

| Condition | State | May change completion? |
| --- | --- | --- |
| Date is before active_from, on/after archive cutoff, or not a selected weekday | Not scheduled | No |
| Eligible date is after today | Future | No |
| Eligible date has completed=true | Completed | Yes, if today or earlier |
| Eligible date is today with no true completion | Pending today | Yes |
| Eligible date is before today with no true completion | Not completed | Yes |

Check eligibility before accepting any log. History before creation/after archive stays noninteractive. No separate missed or skipped status is persisted. False and absent completion have the same displayed eligibility state; false retains the mutation revision for safe undo.

## Today count

For selected date D, required is the number of scheduled active habits on D; completed is the number of those habits whose dated log is true. Show “completed of required done.”

Zero habits: “Add your first habit.” Habits exist but none are due on the selected date: “Nothing scheduled.” A nonempty list fully completed: quiet all-done feedback. Don't call an empty list 100% success.

## Weekly consistency

For the selected week, count only eligible scheduled opportunities with business_date < today. Today's completed and pending opportunities are both excluded; future dates are excluded. Intersect habit creation/archive dates and the correct schedule version for every date.

Show “18 of 25 completed” and the exact closed range. Numerator is true completion logs within those opportunities. Denominator is scheduled opportunities within those dates. False/absent closed logs count in the denominator, not numerator. With zero closed opportunities show “No closed dates to review.” No weighted percentage, streak, ranking, or projected completion is required.

Summary can cover the relevant active/archived habits with closed opportunities in that week. Archived habits contribute their real eligible history; filtering the displayed routine list doesn't rewrite the all-habit weekly total. Label the calendar's selected habit separately from the all-habit summary.

## Corrections and retries

Today and history call the same completion action/evaluator. Past corrections update the summary from real logs; no synthetic completion data or cached score snapshots. Send the desired completion boolean and expected revision. Enforce ownership, date validity, schedule eligibility, uniqueness, and conflict detection independently on the server.

## Required cases

Daily/selected days, invalid/empty/duplicate weekdays, future and unscheduled writes, before-creation/after-archive dates, tomorrow edits, repeated pending edits, archive retention, corrections and undo, same-state retry, stale conflicting writes, no closed opportunities, zero completion, cross-owner child references, leap/month/week boundaries, and timezone changes without date rewriting. [QA](QA.md) owns actual evidence.
