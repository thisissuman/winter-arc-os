# Winter Arc OS — product requirements

<!-- impeccable:product-schema 1 -->

## Platform

web

## Status and authority

Accepted product contract for V1; foundation, core tracking, fitness, and Career are implemented in the configured development project. Feature implementation continues one requested phase at a time. This document records the user's specification and confirmed planning decisions. The [original specification](docs/MASTER_SPEC.md) is preserved unchanged. Calculation details belong in [SCORING](docs/SCORING.md), implementation details in [ARCHITECTURE](docs/ARCHITECTURE.md), and delivery status in [ROADMAP](docs/ROADMAP.md).

## Verification decision — October 1, 2026

The user explicitly deferred signup-confirmation and password-recovery email delivery tests until custom SMTP is configured before production. Phase 1 may close after real confirmed-account login, session refresh, settings, logout, and all other foundation checks pass. Signup/recovery implementation remains in scope; successful email callbacks and delivery are unverified, not reported as passing. Restore these checks in the Phase 9 release gate before production. No email-confirmation protection is disabled to accommodate this deferral.

## Users

The initial user is a frontend engineer working from home, generally 11 AM–8 PM, training around four times weekly, focused on muscle gain and senior frontend/full-stack interview preparation. Approximate body weight is context only, not a measurement to insert into the database.

The application starts as a personal tool but must safely isolate multiple accounts. There is no public profile, social feed, or shared workspace in V1.

## Product purpose

Answer “What should I do today?” and make logging fast enough for daily use. Track health, career preparation, habits, weekly tasks, goals, focus, and reflection. Provide meaningful progress from real measurements and explainable calculations.

Support future seasons, challenges, and personal arcs. Winter Arc 2026 is optional starter content, spanning September 1–December 1, 2026 inclusively (92 days), not an application-wide date restriction.

## Positioning

One personal workflow connects daily behaviors, raw measurements, flexible quotas, study/workout sessions, planning, and reflection. Shared trackers can participate in multiple challenges without duplicate logging. Scores explain their inputs and expectations rather than treating everything as a checkbox.

## Operating context

Frequent phone logging and desktop review/planning are first-class workflows. Today prioritizes quick actions. Charts and comparisons help the user interpret consistency over weeks and months. Streaks are supporting information rather than the primary measure of success.

## Terminology and confirmed decisions

| Concept | Meaning |
| --- | --- |
| Habit | A scheduled behavior, binary or recurring |
| Metric | A raw numerical measurement or derived numerical total |
| Frequency target | A quota over a week/month, e.g. four completed workouts |
| Goal | A longer outcome tracked manually, with milestones, or from a metric |
| Challenge | A dated grouping of reusable trackers and goals |
| Life area | An editable organizational area, not a fixed scoring category |
| Daily score | Adherence to scheduled daily items only |
| Weekly score | Due daily opportunities and weekly quotas, without duplicate contributions |

Confirmed: daily and weekly scoring are separate; trackers are shared across challenges. Weekly progress appears on Today. Monthly quotas remain separate until monthly evaluation. Tracking remains usable without a selected challenge.

## V1 capabilities

- Email/password signup, confirmation, login, logout, password recovery, persistent sessions, and private accounts.
- Challenges with title/description, inclusive dates, status, optional color/icon, associations, and selected dashboard context.
- Habits with editable descriptions/icons/categories, time of day, privacy, active range, archive state, effective-dated schedules, counts, and logs.
- Daily, weekdays, selected weekdays, weekly/monthly quotas, and a bounded custom recurrence of every N days from an anchor date.
- Monthly habit matrix with completed, missed, skipped, unscheduled, pending-today, and future states; scheduled-opportunity streaks and period consistency.
- Manual raw metrics and configurable minimum/maximum targets; derived study/sleep totals; observation-only body weight.
- Fitness: weight history and seven-day/weekly averages, protein, water quick-add/manual entry, creatine behavior/dosage, sleep hours or timestamps and optional quality, steps.
- Lightweight workouts with date/name/duration/notes, reusable exercise identity, muscle group, ordered sets, load/reps/optional RPE, copying, and progression history.
- Career: editable study categories, manual sessions, recoverable stopwatch, notes/topics, optional challenge, daily/weekly totals and category analytics.
- Seven-day tasks with status/priority/category/notes, estimates/actual duration, reorder controls, move/copy unfinished tasks, and optional goal/challenge associations.
- Goals with target dates, category/challenge/status, manual percentage, milestones, or metric-derived progress. Every goal may carry milestones.
- Insights: truthful score/consistency trends, fitness and career summaries, heatmaps, strong/missed habit rankings, equal-coverage comparisons, and missing-data indicators.
- Weekly reviews and monthly reflection with adjacent statistics and optional mindset ratings.
- Settings for profile, appearance, timezone/week start, targets, tracker/challenge/organization management, privacy, JSON export, and personal data/account deletion.
- Installable PWA with public offline shell; polished light/dark themes, accessible mobile/desktop flows, and visible loading/empty/error states.

## Optional starter definitions

Apply only after the user chooses the starter setup. Keep every item editable/deletable and make repeated application idempotent. Never seed measurements, completions, workouts, study sessions, tasks presented as completed, or scores.

| Group | Definitions and editable defaults |
| --- | --- |
| Challenge | Winter Arc 2026; September 1–December 1, 2026 |
| Life areas | Health, Career, Learning, Finance, Relationships, Mindset, Creativity |
| Daily habits | Creatine (3 g/day description/configuration), Meditation, Stammering practice |
| Metrics | Protein target 130 g; water target 3.5 L; body weight observation; sleep and steps definitions |
| Weekly targets | Gym 4 completed sessions; career study 5 completed sessions; walking 5 qualifying days |
| Study categories | JavaScript, TypeScript, React, Next.js, Frontend System Design, DSA, Python, AI Engineering, Mock Interview, Portfolio, Applications |
| Scoring categories | Fitness 30%, Career 30%, Recovery 15%, Nutrition 15%, Discipline 10% |

Sleep hours, step threshold, and study-duration targets are not prescribed by the brief. Offer them for user configuration during the applicable onboarding/setup step; a definition can remain unscored without a target. The examples of 150 minutes/day and 12 hours/week are illustrative, not mandatory defaults.

Starter trackers become effective on setup day by default, even when the challenge started earlier. Future-source targets may be stored before their feature exists but are excluded with “source not available” until that feature is delivered; do not invent workout/study/sleep data in Phase 2. A rolling update to starter setup must not re-create user-deleted defaults automatically.

## Date, history, and privacy expectations

- Initial timezone is Asia/Kolkata, week starts Monday, with editable preferences.
- History retains its business dates. Backdated corrections are allowed within a tracker's effective range; future completions are not.
- Expectation changes take effect prospectively, with period-boundary rules defined in SCORING.
- Routine removal archives trackers; permanent deletion removes explicitly selected history.
- Privacy Mode obscures private labels, notes, tooltips, and accessible names. Hiding private Today items is a separate preference. Calculations retain those items; privacy mode is not encryption or a sharing permission system.
- Exports are private downloads containing the user's real data, including sensitive records. No public export links.

## Brand commitments

Name: Winter Arc OS. Mature, restrained, dark-first interface with readable density, compact typography, charcoal surfaces and cool violet/indigo accent. Also provide a complete light theme. Linear, Raycast, Vercel, and fitness dashboards are quality references only; create original layouts and copy. Avoid hype, excessive gradients, neon/glass effects, and childish gamification.

## Product principles

1. Make daily actions quick and reporting truthful.
2. Respect the difference between behaviors, quotas, and measurements.
3. Preserve historical expectations and raw data.
4. Keep personal information private across accounts and presentation states.
5. Prefer maintainable, tested functionality over speculative infrastructure.

## Accessibility and inclusion

Use semantic HTML, keyboard navigation, labelled controls, visible focus, appropriate contrast, reduced motion, large touch targets, and non-color status cues. Mobile must adapt interaction and hierarchy rather than shrink a desktop page. Charts require accompanying summaries and accessible alternatives.

## Constraints and later work

Use the required stack documented in README. No AI cost or API is necessary. Defer OAuth, wearables, Pomodoro, freeze tokens, full offline sync, CSV import/export, AI reviews, advanced drag-and-drop, billing, and social features. JSON export and account deletion remain V1 requirements.

## Evidence on hand

The original written specification and accepted plan define the product. Phases 1–4 have migrated development schemas and verified foundation/tracking/fitness/Career checks. There are no production tracking records, integrations, or brand assets. Synthetic fixtures may be used in tests only; they must never be represented as the user's actual analytics.
