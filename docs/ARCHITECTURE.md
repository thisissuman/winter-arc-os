# Architecture, data model, and interface contract

## Status and ownership

Phases 1–7 implement foundation, core tracking, fitness, Career, Planning, Insights, and Reflection in the configured development project. Planning lives in `supabase/migrations/20261001104654_planning.sql` plus two follow-up migrations. Insights uses existing owned tables and indexes without a new migration; Reflection lives in `supabase/migrations/20261001160428_reflection.sql`. Phase 1 signup/confirmation/recovery email verification is deferred until SMTP setup before production; see PRODUCT and QA. Product requirements are in [PRODUCT](../PRODUCT.md), calculations in [SCORING](SCORING.md), and visual conventions in [DESIGN](../DESIGN.md).

## Application boundaries

Use one Next.js App Router application deployed to Vercel, with Supabase Auth and PostgreSQL. No separate backend, Redux, job queue, billing system, or AI provider is needed for V1.

| Boundary | Responsibilities |
| --- | --- |
| `src/app` | Thin page composition, route groups, layouts, loading/error boundaries, necessary HTTP handlers |
| `src/features` | Feature components, queries/actions, schemas, and feature-specific rules |
| `src/components/ui` | shadcn/ui primitives and reusable accessible controls |
| `src/components` | Shared shell, navigation, date controls, privacy presentation, feedback |
| `src/lib/supabase` | Cookie-aware server/browser clients and session refresh |
| `src/features/tracking/domain.ts`, `dates.ts` | Shared scheduling, source evaluation, score, and calendar calculations |
| `src/features/fitness` | Fitness-domain summaries, server actions, and focused UI; trend charts load only on fitness routes |
| `src/features/planning` | Owned task and goal reads, checked actions, forms, and pure goal-progress calculations |
| `src/features/insights` | Bounded filter validation, historical report calculations, accessible heatmaps, and route-local score chart |
| `src/features/reflection` | Owned period reads, validated save actions, writing forms, and adjacent Insights-derived statistics |
| `src/lib` | Shared validation and authenticated server helpers |
| `src/types` | Generated database types and shared domain interfaces |
| `supabase/migrations`, `supabase/tests` | Incremental schema/security changes and SQL tests |

Keep a feature's components under its feature rather than maintaining a duplicate component tree. Create directories when needed; do not scaffold empty future layers.

### Data flow

Reads: validated authenticated identity → feature server query → owned records → pure domain calculations → server-rendered page with small interactive components.

Writes: client interaction → shared Zod schema → independently authenticated Server Action → ownership-safe mutation/transaction → typed result → revalidate affected reads. Client validation is convenience, not trust.

Use URL state for dates, periods, tabs, and challenge filters. Use local React state for forms and optimistic feedback. Use lightweight context for global presentation preferences and timer display. Do not add a general client query/state library without a demonstrated need.

Do not share-cache personal reads. Server-render authenticated pages dynamically and configure auth-refresh responses to prevent private caching. Bound analytics date ranges and aggregate data on the server/database where appropriate. Use caller-scoped, security-invoker database routines for aggregates and transactions whenever possible.

### Mutation and concurrency rules

- Ordinary replacements such as a daily metric entry validate a revision/`updated_at` value to report stale edits rather than silently overwrite another tab.
- Water additions use an atomic database increment and a per-operation UUID retained across retries. Apply the identifier and increment in one transaction; never read/add/write in the browser.
- Retry-sensitive multi-record operations use an owner-scoped operation record/result. Add the small operation table with the first dependent feature, not during foundation.
- Habit/task optimistic state is rolled back on failure and reconciled against the saved record.
- Workout copying, task batch move/copy, and timer finalization are atomic and retry-safe. Include the owner in operation uniqueness keys.

## Authentication and security

Use `@supabase/supabase-js` plus `@supabase/ssr`, with separate clients and the current Next.js session-refresh convention. Verify identity using the currently recommended verified claims/user API rather than an unverified session object. Recheck at page/data/action boundaries; proxy redirects alone are not authorization. Follow the [official SSR guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

Phase 1 creates profiles/preferences with a small transactional new-user initializer; test its failure behavior and idempotence. Optional starter tracking data is a later authenticated operation, never an auth trigger with fabricated records.

Email confirmation/recovery supports direct token hashes with explicit signup/recovery types, and PKCE `code` exchange for default hosted templates. PKCE requires the initiating browser’s verifier cookie; no raw session object is trusted for authorization. The configured free project cannot edit email templates without custom SMTP, so both callback formats are retained. Positive email callback verification still requires an inbox; negative code/hash handling is covered by browser checks. Recovery leads to password update only after successful verification. Redirect destinations are an allowlisted local path, using trusted `APP_ORIGIN`; reject external, protocol-relative, and malformed redirects. Configure local/staging/production email templates and allowed URLs independently.

Every owned table has RLS for SELECT, INSERT, UPDATE, and DELETE with authenticated ownership checks. UPDATE must validate both the old row and the replacement owner. Child rows also carry `user_id` and use owner-matching foreign keys, such as `(parent_id, user_id)` referencing `(id, user_id)`. RLS alone does not make cross-owner foreign keys safe. Join tables enforce ownership on both parents.

Ordinary actions use the publishable key and user's cookies, never a privileged client. Phase 8 adds an isolated server-only administrative client for deleting the authenticated account after recent password verification. Never accept an arbitrary user ID for deletion. Root-owned data cascades on deletion of the auth identity. Deleting tracking data while retaining the account is a separate transactional operation. See [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Database conventions

- Public owned entities use `id uuid`, `user_id uuid`, `created_at timestamptz`, `updated_at timestamptz`. Profiles/preferences use `user_id` as their PK; join tables may additionally enforce unique parent pairs.
- Required ownership fields reference `auth.users`; enforce same-owner relationships. Add `(id, user_id)` uniqueness where composite relationships need it.
- Dates are `date`, timestamps `timestamptz`, measurements `numeric`, durations integer seconds, flags boolean, labels/notes text. Status values use CHECK-constrained text by default.
- Effective rules use `effective_from` inclusive and optional `effective_until` exclusive. Prevent overlapping versions for the same owner/source/period in database constraints, not only application validation.
- Retain period timezone/week-start context on weekly rules and scoring policies; new preferences must not rebucket historical periods. Logs retain their capture business date/timezone where timestamps need later interpretation.
- Add indexed owner/date paths for logs/sessions/tasks/reviews and indexed owner/parent paths for child collections. Avoid indexes with no query justification.
- Constraints include nonnegative measurements/counts/load, positive duration where required, bounded ratings/progress, valid date ranges, and conditional fields for each schedule/source/progress kind.
- Routine tracker removal archives; an effective archive cutoff excludes later expectations but retains earlier history. An archive flag alone must not exclude all historical calculations.
- Foreign-key deletion policies preserve history during routine management; default archive avoids deletions. Hard deletion explicitly removes dependent history. Deleting an auth identity cascades its owned records.

### Account and organization — Phase 1

| Table | Specific fields and relationships |
| --- | --- |
| `profiles` | `user_id` PK, display name; no duplicate stored password or auth email |
| `user_preferences` | `user_id` PK, timezone, week start (ISO 1–7), theme, privacy mode, hide-private-Today flag, onboarding state |
| `life_areas` | Name, optional icon/color, order, archive cutoff |
| `categories` | Name, optional life-area relationship, order, archive cutoff |

Add selected-challenge ownership FK only when challenges exist in Phase 2. Preserve empty-account operation; starter life areas are optional onboarding data.

### Implemented foundation details

The foundation migration is `supabase/migrations/20260930180649_foundation.sql`, applied to the configured development project through MCP. Its filename matches the hosted migration ledger. It initializes existing/new auth users transactionally and idempotently without starter areas, tracker definitions, or measurements. All four public tables use owned CRUD policies; anonymous table grants are revoked. Private trigger helpers have empty search paths and no public/anon/authenticated execution grant.

- Profiles: display name defaults empty and is bounded to 80 characters. Profile settings allow clearing it to use the default greeting; signup still requires a name. Auth owns email/password; no duplicated account credentials.
- Preferences: timezone is validated against PostgreSQL's timezone catalog; ISO week start is 1–7; theme is dark/light/system. Defaults are Asia/Kolkata, Monday, dark, privacy off, hide-private off, onboarding incomplete. Challenge selection arrives with Phase 2.
- Areas/categories: generated UUID, name length 1–80 after trimming, nonnegative order, optional archive timestamp. Area icon/color are optional. Categories may omit an area.
- Category ownership is enforced by `(life_area_id, user_id)` → `(id, user_id)`, with a deferred NO ACTION relationship. Archive is the ordinary removal mechanism; auth-user deletion cascades all owned foundation data without a nullable-owner workaround.
- Owner/order and owner/area indexes support account-scoped lists. Migration `20260930181434_categories_parent_index.sql` adds a parent-first `(life_area_id, user_id)` category index matching the composite foreign key, following the hosted performance advisor. Each table has created/updated timestamps and an update trigger.

`requireAccount()` caches the verified identity and owned profile/preferences only within a request. Missing initialized rows produce a retryable application error rather than fabricated account data. Server Actions use the caller's cookie client, Zod validation, ownership filters, and revalidation. Theme settings persist to PostgreSQL and an HttpOnly presentation cookie; server rendering and the theme provider use that cookie to avoid another account's stale local theme overriding the saved choice.

The proxy refreshes cookies using `getClaims()` and private/no-store response headers. Email links verify supported token hashes via `/auth/confirm`; trusted origin and local redirect allowlist prevent external redirects. Recovery requires a verified identity, changes the password, and revokes other sessions. Dynamic protected pages and independent action authorization remain necessary even with the proxy.

Testing replays migrations against isolated PGlite PostgreSQL with minimal test-only auth roles/catalog. This verifies database behavior but is not a Supabase HTTP/auth emulator. Committed public types are generated from the matching hosted schema using Supabase MCP; the incomplete foundation-only generator was removed. Rollback-only hosted scripts verify PostgreSQL roles, RLS, ownership relationships, and transactional RPC behavior. Authenticated browser and email verification require the dedicated test account and hosted email setup; SQL scripts do not replace them.

### Challenges and core tracking — Phase 2

The applied migration adds selected challenge and starter-applied metadata to preferences; 17 owned tracking tables including `tracking_operations` for retry receipts; same-owner composite references, indexes, update triggers, explicit RLS policies, and authenticated transaction functions. Direct authenticated access to the new tables is read-only; Server Actions use narrowly named `security definer` functions that verify `auth.uid()` again and fix `search_path`. Business dates and original capture timezone are stored on logs. Revisions prevent stale replacement writes, and operation UUIDs make water-style increments retry-safe. The follow-up migration covers the composite score-item policy/category foreign key.

`src/features/tracking/queries.ts` pages owner-filtered rows in batches rather than relying on the PostgREST default limit. `src/types/database.ts` is generated from the hosted Phase 5 public schema. Supabase widens CHECK-constrained text columns to `string`; the domain boundary narrows them to the literals enforced by verified SQL constraints. Challenge associations share tracker definitions and logs; the optional starter is a single idempotent function guarded by `starter_applied_on`. It inserts no completion, measurement, or study-session records.

| Table | Specific fields and relationships |
| --- | --- |
| `challenges` | Title, description, start/end dates, status (`upcoming`, `active`, `completed`, `archived`), optional theme/icon |
| `challenge_habits`, `challenge_metrics`, `challenge_targets` | Challenge and tracker references; unique pair, ownership enforced on both sides |
| `habits` | Name, description, icon, category, time-of-day group, optional dosage metadata, private flag, active dates, archive cutoff |
| `habit_schedules` | Habit reference, effective range, frequency kind, target count, optional ISO weekdays, custom day interval/anchor |
| `habit_logs` | Habit reference, business date, status (`completed`, `missed`, `skipped`), completion count, optional notes; unique habit/date |
| `metric_definitions` | Name, category, canonical unit, manual/derived source, source filter, aggregation, private flag, active dates/archive cutoff |
| `metric_targets` | Metric reference, effective range, daily/weekly/monthly period, minimum/maximum direction, positive threshold |
| `metric_logs` | Manual metric reference, business date, raw numeric value, optional notes; unique metric/date |
| `frequency_targets` | Name, category, source kind, optional source reference/filter, count mode (`sessions`, `distinct_days`), active dates/archive cutoff |
| `frequency_target_rules` | Target reference, effective range, week/month period, positive quota, optional qualifying metric threshold |
| `score_categories` | Editable names independent of life areas, display order, archive state |
| `score_policies` | Daily/weekly/monthly scope, effective range, name/version |
| `score_category_weights` | Policy/category references, nonnegative weight; unique policy/category |
| `score_items` | Policy/category references, positive item weight, exactly one habit/metric/frequency-target reference; unique source per policy |

Validate habit statuses against counts: a completed occurrence has a positive count; missed/skipped have zero. For a per-day count requirement, partial counts retain progress even before the requirement is met; the evaluator supplies the display state. “Not required,” “future,” and “pending today” are derived states, not synthetic log records.

Habit schedule frequency is `DAILY`, `WEEKDAYS`, `SPECIFIC_DAYS`, `TIMES_PER_WEEK`, `TIMES_PER_MONTH`, or `CUSTOM`. Custom means every N days from an anchor in V1. Quota habits store their expectation once in the schedule and reuse the period evaluator; do not create a parallel frequency target for the same habit.

Source filters are narrowly typed and Zod-validated. Real entity references, such as a habit, metric, or study category, use FKs with ownership rather than arbitrary JSON IDs. Small metadata/configuration may use validated JSONB; primary relationships and measurements do not.

Manual sources operate from Phase 2. Phase 3 activates sleep/workouts; Phase 4 activates study duration/session-count sources when the user explicitly runs Career setup. Source activation dates prevent prior unavailable periods from turning into historical misses. First saved source records can also activate an existing definition on their business date. The UI offers only editable source types currently supported.

### Fitness — Phase 3

| Table | Specific fields and relationships |
| --- | --- |
| `workouts` | Business date, timezone at capture, name, duration seconds, notes, completion status; optional challenge |
| `exercises` | Stable editable exercise name, muscle group, archive state |
| `workout_exercises` | Workout/exercise references, position; stable exercise identity enables comparison across sessions |
| `workout_sets` | Workout-exercise reference, set number, numeric load, positive repetitions, optional bounded RPE |
| `sleep_logs` | Wake business date, timezone at capture, optional sleep/wake timestamps, duration seconds, optional quality 1–5; unique date |
| `workout_operations` | Owned operation UUID, source/date/result receipt for retry-safe copying |

Weight/protein/water/steps remain metric logs. Creatine remains a habit with editable dose metadata. Water stores millilitres canonically and displays litres. Weight uses kilograms; protein grams; steps integers. Unit conversion belongs at input/display boundaries.

Sleep accepts either duration-only or valid timestamp pairs. When timestamps exist, derive elapsed duration from them instead of storing contradictory user-entered totals. Weight averages use available observations within calendar windows and show coverage; no zero filling.

Gym frequency counts completed workouts, not unfinished drafts. Copying creates a new workout with its own child records and date; the old session is unchanged. Progression charts compare stable exercise IDs, sets, repetitions, and load, without claiming a medical outcome.

`setup_fitness` adds only missing canonical definitions and activates existing starter sleep/gym sources prospectively; repeating it cannot add duplicate definitions, logs, or scores. `save_fitness_sleep` uses a revision check and stores an elapsed duration consistent with timestamp pairs. `save_fitness_workout` replaces one workout's ordered children in a single transaction after ownership and revision checks. `copy_fitness_workout` takes a stable operation UUID and returns its prior result on retry; the copy starts as a draft. Direct authenticated table writes are revoked, while every new table has owner RLS policies and same-owner composite relationships. Read queries load the five source tables through the same authenticated snapshot used by Today, Metrics, and Fitness. Fitness's gym quota uses the selected Today challenge context; historical measurement charts show shared personal source history.

### Career — Phase 4 (implemented)

| Table | Specific fields and relationships |
| --- | --- |
| `study_categories` | Editable name, optional owned general category, order, archive state; old sessions retain the category ID |
| `study_sessions` | Owned study category/challenge/timer references, topic/notes, completion business date and retained timezone, duration seconds, optional start/end timestamps, running segments, source (`manual`, `timer`), optimistic revision |
| `focus_timers` | Owned category/challenge, retained timezone, running timestamp, accumulated seconds and segments, status/revision; partial uniqueness for one running or paused timer per user |

Manual duration-only sessions are attributed to the chosen date. Timestamped sessions split duration across local-day boundaries for analytics. Count a completed session once on its completion business date for frequency targets. A category archive prevents new selection without deleting its prior study history.

Start a timer only after the server creates its record. Render elapsed time from timestamps plus saved accumulated duration, not tick counts. Navigation/refresh resumes from server state through the workspace timer bar. Focus/visibility changes, a periodic read, and BroadcastChannel reconcile tabs; SQL revisions and the one-active partial index settle races. Finish locks the timer, creates one session, and marks the timer terminal in one transaction; repeated finish returns that session. Discard is an explicit terminal action. A browser confirmation reviews elapsed time above four hours before finishing; the database retains the complete value up to seven days. Running segments preserve pause gaps for split-day analytics. No second-by-second database writes or background worker is needed.

### Planning — Phase 5 (implemented)

| Table | Specific fields and relationships |
| --- | --- |
| `tasks` | Title, notes, date, status (`todo`, `in_progress`, `completed`), priority, category, position, estimated/actual seconds, optional goal/challenge |
| `goals` | Title, description, category, target date, optional challenge, status, progress kind, manual percentage or metric reference/aggregation/baseline/target |
| `goal_milestones` | Goal reference, title, position, completion timestamp |
| `task_carry_operations` | Owner, operation UUID, source/target date, move/copy kind, result IDs; transactional result for retries |

Manual progress is 0–100. Milestone progress is completed/total; no milestones means unconfigured, not 100%. Metric progress is clamped advancement from baseline toward target; reject equal baseline/target and support downward goals. Latest/sum/count aggregations are explicit and use the goal's configured interval. Milestones may exist on any goal, but only milestone mode derives its percentage from them.

Reordering has keyboard/button controls. Carry-forward actions select unfinished tasks only; a move changes the existing date, a copy makes new IDs. Batch retries cannot duplicate copies. Tasks are not score inputs by default.

`/tasks` shows a seven-day board anchored to the user’s week-start preference and selected-day editor; `/plan` is the mobile planning entry. Task records retain separate estimated and actual integer seconds, completion time, position, and optimistic revision. `save_planning_task`, `set_planning_task_status`, and `move_planning_task` validate ownership and revisions. A per-user advisory transaction lock serializes task ordering and carry operations. `carry_planning_tasks` writes an owner-scoped receipt in the same transaction as its changes. A copy starts as `todo`, keeps its estimate, and clears recorded actual time; a move retains status and work. Completed tasks are excluded from both operations.

`/goals` and `/goals/[id]` expose creation, editing, milestones, and all three progress modes. `save_planning_goal` and `save_goal_milestone` validate revision and owned category/challenge/metric relationships. Goal calculations use raw metric logs, study sessions, or sleep logs over the configured interval, distinguish missing from a measured zero, and support latest/sum/count aggregation and downward targets. Milestones remain attached when the progress mode changes. Private goal/task text is masked before passing it to interactive client components in Privacy Mode. The four tables have owner RLS and authenticated direct writes revoked; only checked RPCs mutate them. The hosted index follow-up covers the milestone owner FK. The copy-reset follow-up preserves earlier applied SQL and ensures copied work starts fresh.

### Insights — Phase 6 (implemented)

`/insights` accepts an inclusive range of 1–180 past or current business dates plus an owned challenge and an owned organizational tracker category. Invalid/future ranges and unknown filter IDs display an error without an analytics report. The server verifies the caller and uses the existing owner-scoped, paginated tracking query. In compact mode it bounds log, sleep, workout, and study-session reads by business date, includes a short preceding comparison window, and skips exercise/set/timer detail unrelated to Insights. Sessions may finish after a displayed day; the reader includes seven later completion dates so split-day study time is not lost. Existing `(user_id, business_date)` indexes cover the source reads. No schema migration or new RLS surface is required.

The report calls the same effective-dated `scoreForPeriod`, `evaluateHabit`, and `metricDailyValue` functions used by Today. The `through` option evaluates a selected part of a weekly period without changing the historical policy; the latest non-overlapping prior week is cut to the same elapsed number of calendar days, including across week-start changes. Daily score trends and overall/Fitness/Career heatmaps retain null for no eligible score, zero for an eligible zero, coverage counts, and an in-progress label. Habit heatmaps/rankings use due daily opportunities, exclude today's pending opportunity, and count skipped dates as zero. Source summaries retain raw units and recorded-day denominators; drafts do not count as completed workouts. Study time uses retained session timezones and splits at local midnight. The organizational category filter narrows habits, metrics, and study summaries; score policy categories remain independent and whole-context, clearly labelled in the UI. Chart data loads only on the Insights route and has adjacent text, numeric heatmap cells, and accessible date/value labels. Private tracker and study-category labels are masked in Privacy Mode.

### Reflection — Phase 7 (implemented)

| Table | Specific fields and relationships |
| --- | --- |
| `weekly_reviews` | Week-start date, wins, difficulties, lessons, next-week changes; optional energy/focus/motivation/stress/mood ratings 1–5; unique user/week |
| `monthly_reflections` | First-of-month date, wins/failures, improved/slipped habits, fitness/career progress, changes, notes; unique user/month |

Store the actual selected period anchor; changing a week-start preference must not relabel prior reviews. Adjacent statistics are computed from shared analytics, not copied invented snapshots.

The weekly row stores its week-start ISO weekday and timezone at creation. A new week must begin on the user's current preferred weekday; an existing row can be edited after that preference changes. The monthly anchor is the first day of its month. Both tables enforce one row per owner/period, 4,000-character response limits, and 1–5 nullable weekly ratings. Direct writes are revoked; owner-checked `save_weekly_review` and `save_monthly_reflection` RPCs validate current/past periods and expected revisions before inserting or editing. Authenticated reads use RLS and explicit owner filters. A stale editor reports a conflict instead of overwriting a later version.

`/reflection` lists the current periods and saved history. `/reflection/weekly/[weekStart]` and `/reflection/monthly/[month]` validate URL anchors, show saved forms, and truncate current-period statistics at today. Their context panel calls `buildInsightReport` with the same source query and historical scoring rules as Insights. It stores no calculated snapshots. Privacy Mode omits written responses and the editor from the rendered page while leaving aggregate numbers visible. Mobile's More hub exposes Reflection, Challenges, and Settings.

### Migration sequence

Phase 1: account/organization and auth initializer. Phase 2: challenges, habits, metrics, frequency targets, scoring, associations, and preference FK. Phase 3: fitness/sleep and source relationships. Phase 4: study/timer and source relationships. Phase 5: planning. Phase 6: query indexes/routines only when needed. Phase 7: reflection. Phase 8: data-control routines and any justified operational metadata.

Every migration includes its indexes, constraints, RLS, and tests. Generate database types after changes and confirm a fresh local reset can replay the history. Do not install all future tables in foundation.

## Shared interfaces

| Contract | Required information |
| --- | --- |
| Scheduled evaluation | Date, source, scheduled/pending/completed/missed/skipped/future state, expected/completed count, reason, effective rule |
| Metric evaluation | Raw or absent value, canonical/display unit, target, direction, adherence or exclusion, coverage |
| Frequency progress | Period boundaries, count mode, actual count, prorated quota, capped contribution, in-progress state |
| Score result | Nullable 0–100 total, categories/items, weights, exclusions/reasons, policy version, period/computation time |
| Analytics filter | Owner from auth context, bounded date range, optional owned challenge/category, timezone |
| Mutation result | Success with saved record/revision or validation/conflict/authentication/storage failure; no secret details |

Implement interfaces when their feature arrives. Keep a missing raw value distinct from zero and an unavailable source distinct from a supported source with no logs.

## Routes and HTTP endpoints

Desktop/mobile use identical routes. Use `(auth)` and protected route groups for organization without including group names in URLs. `/` redirects to `/today` or `/login`. Add routes only in their delivery phase; filter navigation to delivered routes.

| Phase | Routes | Purpose |
| --- | --- | --- |
| 1 | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/confirm` | Auth forms, safe verification, recovery |
| 1 | `/today`, `/settings` | Protected real-empty dashboard; account/profile and session controls |
| 2 | `/onboarding`, `/habits`, `/metrics`, `/challenges`, `/challenges/[id]`, `/track`, `/settings/tracking` | Optional starter setup, habit grid, manual metrics, challenge management, frequency/scoring/privacy settings |
| 3 | `/fitness`, `/fitness/workouts`, `/fitness/workouts/[id]` | Measurements, trends, workout history/editor |
| 4 | `/career`, `/career/sessions` | Targets, stopwatch, category/session management |
| 5 | `/plan`, `/tasks`, `/goals`, `/goals/[id]` | Weekly planner, outcomes, milestones |
| 6 | `/insights` | Bounded analytics, heatmaps, comparisons |
| 7 | `/reflection`, `/reflection/weekly/[weekStart]`, `/reflection/monthly/[month]` | Period history, review editors, statistics |
| 8 | `/settings/[section]`, `/more` | Complete settings and mobile secondary navigation |
| 8 | `GET /api/export`, `POST /api/account/delete` | Private versioned JSON download; recently verified account deletion |

`/more` may be introduced when there are actual secondary destinations. Phase 2 navigation uses desktop feature links and a mobile Track hub. Date/month/week/challenge/tab selection belongs in URL parameters with validated formats. Edit/create actions primarily use dialogs/sheets. Invalid IDs return safe not-found states, never another user's data. A setup notice remains as a safe fallback for an environment missing the migration.

Export includes a format version, generated timestamp, preferences, definitions, associations, logs, sessions, planning, and reviews for the caller. Exclude credentials, auth tokens, internal retry/timer secrets, and other owners. Private records are included with a clear download notice. The account deletion endpoint accepts no arbitrary target account and returns only operational outcome.

## Component responsibilities

| Group | Components/behavior |
| --- | --- |
| Shell | Sidebar, mobile bottom navigation, header/date controls, challenge switcher, privacy/theme controls, persistent timer bar |
| Today | Challenge timing, explainable daily score, due habit rows, raw metric inputs, separate weekly/monthly quota rows |
| Habits | Editor, schedule editor, accessible monthly matrix and status cells, streak/consistency summary |
| Fitness | Measurement controls, atomic water buttons, weight/sleep charts/forms, workout/exercise/set editors |
| Career | Category manager, duration form, timer controls, session list, category distribution |
| Planning | Weekly day/board views, task editor/carry-forward/reorder, goal editor, milestone list |
| Insights | Validated filters, chart frame/text alternative, heatmap, comparable-period summary, habit rankings |
| Reflection | Weekly/monthly forms, optional ratings, adjacent statistics |
| Shared | Skeleton, empty/configuration state, error/retry, toast, confirmation, privacy-aware label/notes |

Every feature handles actual loading, absence, errors, long labels, archived sources, and private presentation. See DESIGN for layout constraints and QA for verification.

## Decisions and risks

| ID | Accepted decision | Reason/verification |
| --- | --- | --- |
| D01 | Separate daily/weekly score | Confirmed by user; flexible quotas do not impose daily completion |
| D02 | Shared trackers across challenges | Confirmed by user; log once with date-scoped associations |
| D03 | One Next.js/Supabase application | Required stack, minimal operational burden |
| D04 | Effective-dated expectations | Preserve historical scoring after configuration changes |
| D05 | Same-owner child/join relationships | Prevent cross-account links as well as cross-account reads |
| D06 | Incremental migrations by phase | Keep foundation bounded and verify each feature's security |
| D07 | No private offline caching/sync in V1 | Keep local/private data handling explicit and manageable |
| D08 | Canonical documents plus unchanged source | Durable operating memory without conflicting duplicated contracts |
| D09 | Webpack build and packaged Geist | Turbopack initialization is restricted here; production compilation works without remote font fetches |
| D10 | Isolated PostgreSQL foundation checks plus real browser integration | Verify RLS without Docker; keep hosted Auth/email gates explicit and unmocked |
| D11 | Database theme plus server presentation cookie | Apply saved appearance during server rendering; avoid stale account-local overrides |
| D12 | Token-hash and default-template PKCE callback support | Current hosted free plan locks custom templates without SMTP; retain secure cookie-bound code exchange and same-browser instructions |
| D13 | Defer email delivery/callback verification before production | Explicit user instruction on October 1, 2026; Phase 1 closes with confirmed-account flows verified, email tests remain a release gate |

Primary risks are ownership leaks, stale/duplicate writes, historical score drift, timer recovery, timezone errors, misleading coverage, and premature scope expansion. Their tests and release gates are in [QA](QA.md). Future verified decisions extend this log; do not mark draft behavior as implemented.
