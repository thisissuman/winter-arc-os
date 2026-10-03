# Simple habit cleanup inventory

## Status and sources

October 3, 2026. This records the **executed, verified cleanup**. Product decision and five design boards are approved; the coordinated replacement is complete. The original inventory came from migration/source files and graphify; the matching live development catalog and affected records were inspected before application. [Machine-readable inventory](simple-habits-inventory.json) lists exact tables/routines/paths/packages/tests and applied migrations to preserve.

## Database scope

The former 36 public tables are now five: profiles, user_preferences, habits, habit_schedules, habit_logs. Auth identities, profiles, essential preferences stay; all existing product history, including old habits, is discarded in the same configured development project.

| Retired subsystem | Remove tables |
| --- | --- |
| Organization | life_areas, categories |
| Challenges | challenges, challenge_habits, challenge_metrics, challenge_targets |
| Numerical measurements | metric_definitions, metric_targets, metric_logs |
| Quotas | frequency_targets, frequency_target_rules |
| Scores | score_categories, score_policies, score_category_weights, score_items |
| Fitness | sleep_logs, exercises, workouts, workout_exercises, workout_sets |
| Career | study_categories, study_sessions, focus_timers |
| Planning | tasks, goals, goal_milestones |
| Reflection | weekly_reviews, monthly_reflections |
| Internal receipts | tracking_operations, workout_operations, task_carry_operations |

Rebuild the three habit tables for binary completion and selected weekdays. Remove obsolete preferences, relationships, routine grants, policies, indexes/triggers, and retired helper/RPC functions. The JSON inventory distinguishes retired routines from ownership/timestamp/Auth/data helpers to retain or rewrite. Names refer to local definitions; actual signatures/dependencies must be checked in the migration/live catalog before dropping.

Rewrite existing export/deletion routines and Auth before-delete trigger to the five-table model; export format becomes version 2. Never leave a dynamically referenced retired table inside a retained PL/pgSQL function. Test those routines, not only catalog absence.

## Runtime routes and modules

Delete feature directories career, challenges, fitness, insights, metrics, onboarding, planning, reflection, tracking-settings under src/features, with their actions/validation/forms/queries/domain tests.

Delete corresponding workspace routes and nested loading pages; also remove track, plan, more, settings/organization, settings/tracking, onboarding. Fold settings/data into settings rather than keeping another primary section. Retired URLs return 404. Update redirect allowlists, navigation, auth-next validation, links, metadata/copy, empty-state setup suggestions, and privacy expectations together.

Replace Today/Habits views and general tracking actions/domain/types/privacy/queries with focused habit contracts. Salvage tested date helpers rather than preserving general scoring/calculation code. Replace HabitLogger and create/update/archive/delete controls. Remove challenge-switcher, metric-logger, score-panel, organization forms/actions/queries, and general definition-kind dispatch. Audit shared Panel/StatSummary/ChartFrame/coverage/destination helpers and remove unconsumed exports after rewiring retained views.

WorkspaceLayout must stop importing/querying PersistentTimerBar/focus_timers before the DB reset. No retained route may call the old broad loadTrackingSnapshot, a retired RPC, or a source-type union involving metrics/workouts/study.

## Packages, styles, assets, and configuration

Remove recharts/react-is with old charts. Remove shadcn package and components.json after replacing @import shadcn/tailwind.css. Remove tw-animate-css and its import after checking used utilities; Tailwind animate-spin/pulse can stay without that package.

Keep working local primitives, radix-ui, cva/clsx/tailwind-merge, current stack/auth/type/test tools, fonts and icons. No library replacement or dependency upgrade is implied. Verify imports/transitive requirements, refresh npm lockfile, run npm ci.

Remove timer/chart/old hub styles and inset tokens only after retained responsive layout is wired. Keep keyboard viewport, focus, safe areas, theme/feedback semantics, public offline/PWA cache protections. Public offline assets remain; update cache version if changed. No unreferenced asset deletion by filename guess.

The older output/imagegen/today-ui-concept-v1.png and habits-ui-concept-v1.png are superseded proposals, retained with status metadata. The new review set is under output/imagegen/simple-habits. Generated board values never become user fixture data.

## Tests and helpers

Remove retired-only E2E Career/Fitness/Insights/Planning/Reflection suites and corresponding SQL/unit suites/hosted fixtures. Rewrite mixed foundation/tracking/settings/data-controls/UI-refinement suites. Preserve auth validation, accessible field association checks, real session/redirect tests, two-account ownership, private export/deletion and public offline checks.

scripts/database.mjs still replays historical migrations plus the forward migration. Don't delete old migrations to make tests pass. Keep test-only bootstrap Auth/roles; update fixtures to name/schedule/binary logs, avoiding old starter RPCs.

Catalog assertions require five public application tables and absence of retired callable routines. Test new export >1000-log completeness and user-isolated data/account deletion, natural-key completion retry and revision conflicts. Remove imported old fixtures/helpers only after mixed tests stop depending on them.

## Cutover and verification

1. Close image approval, then build migration/replacement code/test changes on a feature branch.
2. Validate locally before hosted application; inspect current project URL/catalog/ledger and affected data without printing credentials.
3. Review explicit destructive scope (all product history in this development project; no Auth/profile/preference deletion). Stop incompatible running processes.
4. Apply the forward migration, generate complete matching types, run hosted rollback-only fixtures/advisors, start compatible app.
5. Deliver Today, Habits, Settings sequentially; retain truthful gate status and finish full checks.

The reviewed hosted reset and forward conflict repair were applied after local validation; full database types, rollback security tests and the final browser suite pass. Preserve unrelated untracked env and graphify-out/2026-10-02 content. No Git push/merge or deployment is included.

## Reviewed hosted reset scope — October 3, 2026

Explicit CLI project `trdizdsjivorkffjjywe` matches configured `.env.local` hostname. Live catalog has all 36 expected public tables and the same 14 applied migration versions/signatures as local files. Exact preflight: one Auth account, one profile, one preferences row. Product rows to discard: habits 1, schedules 1, logs 1, metric definitions 6, metric targets 3, metric logs 1, frequency targets/rules 2 each, sleep 1, workout 1, operation receipts 70; remaining retired tables empty (89 product rows total). This is the user's approved development fresh-start boundary. Migration transaction checks retained identities/profile/essential-preference fingerprints before committing; no broad CASCADE or remote reset. No app listeners found on 3000/3100 before cutover. SQL and app validation precede application.
