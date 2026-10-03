# Winter Arc OS — simple habit product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Status and authority

Accepted October 3, 2026 when the user requested implementation of the simple-habit plan. This contract supersedes the broader performance-app requirements. **The source and matching development database now implement the simple habit product.** Designs approved October 3, 2026; local and hosted verification is recorded in QA. Final real-auth desktop/mobile and visual review passed; see QA for results and remaining release checks.

The previous product, architecture, design, scoring, roadmap, and QA records are preserved in [the historical snapshot](docs/history/2026-10-03-pre-simplification/README.md). The [original specification](docs/MASTER_SPEC.md) remains unchanged. [ROADMAP](docs/ROADMAP.md) records the active gates; [cleanup inventory](docs/SIMPLIFICATION.md) records removal scope.

## Purpose and users

A private habit app for someone who found the broader tracking app too complicated to keep using. Open Today, check off routines, and leave in under a minute. Phone check-ins and desktop review both matter. Keep the multi-account privacy boundary, without public profiles or social features.

## Positioning and operating context

Winter Arc is the identity, not a challenge or season configuration system. Three sections support one workflow: decide on a small routine, record whether it happened, and review dated history. Training, studying, and drinking water can be ordinary named habits. Recording quantities, sets, study time, scores, or goals is outside this product.

## Three sections

| Section | Required behavior |
| --- | --- |
| Today | Selected date, scheduled habits, one-tap completion/undo, “3 of 5 done,” and quiet empty/all-done feedback |
| Habits | Routine creation/editing, schedules, archive/permanent deletion, per-habit calendar history, and a compact weekly consistency summary |
| Settings | Account/profile, theme, timezone/week start, global Privacy Mode, private JSON export, data deletion, account deletion |

Habits contains Routines and History views. History and the editor are not additional navigation destinations. Desktop and mobile expose only Today, Habits, Settings. Retired feature URLs return 404 after cleanup.

## Habit definition and recording

- Setup asks only for a name and schedule. Every day is the default. Selected weekdays includes weekday-only schedules without a separate recurrence type.
- New habits begin on their creation business date. Daily and selected weekdays are the only schedules.
- Completion is a boolean for one habit/date. Tap to complete; tap again to undo. Use the desired value rather than a blind toggle, with pending/error feedback and revision conflict handling.
- No required description, note, icon, category, time-of-day group, dosage, unit, numerical value, count target, or private-item flag.
- Past scheduled dates can be corrected. Future, unscheduled, pre-creation, and post-archive dates cannot be completed.
- Name edits apply immediately. Schedule edits take effect tomorrow, retaining historical schedule versions. Multiple edits to the same tomorrow version replace that pending version.
- Archive ends eligibility tomorrow and retains history. The initial simple version has no restore workflow. Archived routines are available in History; explicit permanent deletion removes that habit and its history after confirmation.
- Start with no seeded habits or performance records. “Add your first habit” is the empty-state action. Suggest 3–5 habits without imposing a limit.

## History and consistency

Five user-facing date states: Completed, Not completed, Pending today, Not scheduled, Future. No skipped/missed entry form or partial count. Missing/false completion on a closed scheduled date is Not completed; an uncompleted scheduled date today is Pending today.

The weekly summary is completed opportunities divided by scheduled opportunities on closed dates in the selected week, through yesterday. Today's records and all future dates are excluded from this closed summary. Show the counts and through-date, never a weighted score. Empty eligible history has an honest empty state, not 0% success. No streak rewards, rankings, four-domain heatmaps, trends dashboard, or separate Progress/Insights section.

The [history contract](docs/SCORING.md) defines date and eligibility calculations. Raw calendar dates are preserved across timezone edits.

## Settings and privacy

Keep account names, login/logout, themes (dark/light/system), timezone (default Asia/Kolkata), week start (default Monday), and global Privacy Mode. Mask every habit name before rendering/serialization when Privacy Mode is enabled; never leave original names in hidden attributes or accessible names. Creation/name editing is unavailable while names are masked. Counts and dated statuses remain visible.

Export is a private, versioned JSON download of all five owned application tables, without Auth credentials or other owners. Clearing habit data retains the account/profile/preferences. Account deletion independently verifies the current identity/password, deletes only that account, and clears owned descendants transactionally. Destructive controls use clear scope and confirmation.

Keep the existing public offline/PWA shell and install behavior only where the browser actually offers installation. No personal offline cache or sync, reminders, push notifications, or new PWA workflow.

## Explicit removals

Remove Fitness, Career, Metrics, Tasks, Goals, Insights, Reflection, Challenges, Track/Plan/More hubs, organization management, numerical logging, weekly/monthly quotas, timers, configurable scoring, starter bundles, and onboarding wizard. Their data models, actions, queries, routes, tests, dependencies, and unused shared code are removal scope, not hidden options.

## Fresh-start boundary

Use the same configured development Supabase project. Discard all existing product history across that project; retain Auth identities, profiles, and essential account preferences. The new habit tables start empty. No import/preservation path for old product history is planned.

The hosted reset is deliberately destructive and may run only after image approval, locally verified migration/application replacement, matching project verification, live schema/history inspection, and review of the explicit affected scope. No data is deleted during planning or image design. Never substitute a remote database reset or another project.

## Brand commitments and accessibility

Retain Winter Arc OS, charcoal/violet, Geist, and complete light/dark themes. Use more open space, fewer panels, simple rows, and clear 44 px or larger touch controls. No decorative charts, gradients, neon/glass, hype, or childish rewards. The five approved boards govern composition; DESIGN records implemented tokens and verified behavior.

Use semantic controls, keyboard navigation, visible focus, labelled forms, non-color date states, reduced motion, responsive editors, loading/empty/error states, and honest saved/failed feedback. Screenshots do not establish accessibility.

## Delivery and verification

Follow the six-step [roadmap](docs/ROADMAP.md), with one implementation gate at a time. The user authorized the overall plan; image approval is the required checkpoint before foundation work. No deployment, push, or merge is authorized.

Signup/confirmation/recovery email delivery remains unverified until custom SMTP checks before production. Historical old-product tests are not evidence that the simplified app passes. The simplified app and development schema are implemented and verified.
