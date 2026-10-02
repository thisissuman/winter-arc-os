# Implementation roadmap and phase gates

## Status

**Phases 0–8 are complete in the configured development project as of October 2, 2026.** Phase 7 adds owned period-anchored reviews and Insights-derived adjacent statistics; its migration, security checks, and browser flows are recorded in QA. Phase 1's signup-confirmation/recovery email checks remain deferred until SMTP before production. Phase 8 adds verified private data controls, organization/calendar settings, and public offline behavior. The [UI/UX refinement plan](UI_REFINEMENT_PLAN.md) is in progress before Phase 9; Phases A–E are complete. F/G code and automated validation are delivered, with physical-device and actual screen-reader gates open. Phase 9 has not started.

The accepted plan calls for one phase at a time. Start with the earliest incomplete phase unless the user names a phase whose dependencies are already complete. Finish the phase's validation/documentation and stop with a handoff. Do not expand a phase into the entire application.

Read [AGENTS](../AGENTS.md), [PRODUCT](../PRODUCT.md), and the relevant [architecture](ARCHITECTURE.md), [scoring](SCORING.md), [design](../DESIGN.md), and [QA](QA.md) sections before implementation.

## Dependencies and definition of done

| Phase | Dependencies | State |
| --- | --- | --- |
| 0 — Documentation | None | Complete; documentation checks passed |
| 1 — Foundation | 0 | Complete; email tests deferred by user until before production |
| 2 — Core tracking | 1 | Complete in development project; release gates remain in QA |
| 3 — Fitness | 2 | Complete in development project; release gates remain in QA |
| 4 — Career | 2 | Complete in development project; release gates remain in QA |
| 5 — Planning | 2 | Complete in development project |
| 6 — Insights | 2, 3, 4 | Complete in development project |
| 7 — Reflection | 6 | Complete in development project |
| 8 — Settings and polish | 1–7 | Complete in development project |
| UI/UX refinement — A–G | 8 | In progress; A–E complete, F/G device and assistive-technology gates open |
| 9 — Final QA and release | 1–8, UI/UX refinement | Not started |

Default delivery order is 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → UI/UX refinement A–G → 9. Dependencies allow an explicitly requested alternate order for fitness/career/planning; they do not authorize parallel agents or unchecked skipping.

A phase is complete only when its delivery and verification gates are checked with evidence. Missing credentials/tooling may prevent verification; record the unmet gate and actual blocker rather than claiming completion. Include loading/empty/error handling, relevant accessibility, mobile behavior, privacy, and ownership from the first feature delivery.

## Phase 0 — Project documentation

Boundary: documentation and local Git organization only. No application scaffold, packages, environment files, SQL, or cloud changes.

- [x] Capture accepted requirements, defaults, exclusions, and confirmed scoring/challenge decisions in PRODUCT.
- [x] Establish operating memory, architecture/schema/routes/components, scoring contract, design direction, roadmap, and QA.
- [x] Keep the original specification as an unchanged historical reference with explicit precedence.
- [x] Identify setup prerequisites and label future commands/design as unimplemented.
- [x] Verify local documentation links, source preservation, calculation fixtures, phase/status consistency, and whitespace.
- [x] Record verification in QA and mark this phase complete only after checks pass.

Handoff: documentation index, actual check outcomes, no application-test claims, and next phase.

## Phase 1 — Foundation

Boundary: application/tooling, authentication, minimal account/organization schema, design primitives, responsive shell, real empty dashboard. No tracking migrations or unfinished feature pages.

### 1A — Scaffold and shared system

- [x] Scaffold Next.js App Router with TypeScript, `src`, Tailwind, ESLint, npm, and compatible stable versions.
- [x] Set up shadcn/ui, Lucide, Geist, semantic dark/light tokens, shared controls, and responsive shell.
- [x] Add `.gitignore`, placeholder-only `.env.example`, lockfile, supported runtime declaration, lint/typecheck/build/test scripts, and project-managed Supabase CLI.
- [x] Establish Vitest, local database test setup, and Playwright configuration for meaningful auth tests.

### 1B — Database and authentication

- [x] Create foundation SQL for profiles, preferences, life areas, categories, update triggers, same-owner relationships, indexes, and RLS.
- [x] Add tested idempotent auth-user initialization and generate database types.
- [x] Add SSR clients/session refresh, authenticated data boundaries, signup/confirmation/login/logout/recovery, and safe redirects.
- [x] Add protected Today/account pages, working responsive navigation, and honest empty/loading/error states.
- [x] Update README with actual installation, environment, local email, migration, generated-type, and validation commands; record actual UI tokens in DESIGN.

### Acceptance gate

- [x] Locked dependency installation, lint, typecheck, relevant tests, and production build succeed.
- [x] Fresh isolated PostgreSQL replays foundation migrations; full Supabase container reset is separately unverified.
- [x] Dedicated-account login/logout, persistent sessions, real refresh-token rotation after expiring cookie metadata, and safe redirect/header checks pass on desktop/mobile.
- [x] User-approved gate adjustment: signup/confirmation/recovery email delivery and positive email callbacks are deferred until custom SMTP setup before production; see PRODUCT and the unmet QA release gate. No passing email result is claimed.
- [x] Isolated and hosted anonymous/two-user ownership tests pass for all four foundation tables, including category-to-area relationships.
- [x] Desktop/mobile/keyboard shell and light-theme review pass; tablet Today is readable without horizontal overflow and navigation exposes delivered routes only.

Handoff: created foundation, architectural decisions, exact checks, configuration still needed, remaining verification limitations, and Phase 2.

Current handoff evidence: lint, typecheck, 11 auth unit tests, 66 isolated SQL checks, rollback-only hosted ownership checks, four anonymous API denial checks, all 16 production browser checks, locked installation, and production build pass. Authenticated checks use actual Supabase-issued sessions, verify rotation after expiring only persisted metadata, and restore fixture name/theme even on test failure. Dark Today was inspected on desktop/tablet/mobile; light Settings was inspected on desktop/mobile, with accessibility and keyboard checks. Hosted ownership and both security/performance advisors pass.

Remaining configuration: a deliverable email inbox and appropriate email service for signup/confirmation/recovery verification. The supplied confirmed fixture uses an example-domain address. Hosted Site URL and exact callbacks are configured for localhost:3000. Custom templates remain locked by the current free-plan dashboard without SMTP; secure default-template PKCE callbacks and token-hash callbacks are both implemented. Foundation migration versions are `20260930180649_foundation` and `20260930181434_categories_parent_index`; Phase 2 versions are recorded in its section. Local filenames match the hosted ledger. Generated hosted types compile, and temporary SQL security fixtures were rolled back. Phase 1 closes under the user-approved email-test deferral recorded in PRODUCT; production release still requires those email checks.

## Phase 2 — Core tracking

Boundary: reusable challenges/habits/metrics/targets, numerical logging, real Today, and scoring. Do not create fitness/study source tables early.

Source and validation pass, October 1, 2026: the Phase 2 SQL, Server Actions, optional starter setup, challenge/habit/metric routes, frequency/scoring settings, shared domain functions, and Today are implemented. After the user's later validation request, both Phase 2 migrations were applied to the verified development project; generated types, rollback-only hosted ownership checks, local tests, build, and browser flows passed. Exact evidence and remaining release gates are in QA.

### 2A — Challenges and optional starter setup

- [x] Add owned challenge CRUD, selection, valid statuses/dates, associations, and timing calculations.
- [x] Add onboarding timezone/week-start confirmation and optional idempotent starter definitions.
- [x] Keep starter dates editable, tracker eligibility starting on setup day, and all performance history empty.

### 2B — Habits and grid

- [x] Add habit CRUD/archive/permanent deletion, effective-dated recurrence, counts, and status logging.
- [x] Add monthly grid, month navigation, accessible status changes, scheduled-opportunity streaks, and quota progress.

### 2C — Metrics and frequency

- [x] Add manual metric definitions/raw values, effective targets, source-aware frequency rules, and source-availability states.
- [x] Add atomic retry-safe quick additions and stale replacement-edit handling.

### 2D — Today and scoring

- [x] Implement shared calculations and versioned configurable scoring categories/policies.
- [x] Deliver fast Today logging, private-item handling, explainable daily score, weekly progress, and separate monthly quotas.
- [x] Keep future workout/study/sleep sources explicitly unavailable and excluded until their phases.

### Acceptance gate

- [x] Challenge and no-challenge tracking work; shared associations never duplicate source logs.
- [x] Recurrence/grid states, missing versus zero, skips, history versions, proration, streaks, and scoring examples pass focused tests.
- [x] New tables/relationships pass RLS and constraint tests; atomic increments and retry receipts preserve counts.
- [x] Lint, typecheck, tests, build, mobile/keyboard logging, accessibility, and source-to-UI persistence checks pass.

Result: a useful daily habit/measurement application. Handoff identifies unavailable future sources truthfully.

## Phase 3 — Fitness

- [x] Deliver opt-in weight/protein/water/creatine/sleep/steps setup and logging, using existing raw metric/habit sources.
- [x] Add sleep storage/derivation, seven-day and weekly weight averages, protein adherence, and bounded charts with text summaries.
- [x] Add workouts, reusable exercise IDs, ordered sets, optional RPE, transactional copying, and progression history.
- [x] Activate workout/sleep metric and quota sources without copying measurements into duplicate logs.

Acceptance: Today/Fitness totals agree; concurrent water additions and stale manual edits behave correctly; sleep timestamps/durations and missing-date averages are accurate; copied workouts are independent/retry-safe; gym quotas count completed sessions; ownership/domain/UI checks and lint/typecheck/build pass.

Verified: all acceptance cases pass focused domain/database tests, a hosted rollback-only security check, and production desktop/mobile browser flows. Two-tab browser additions preserve both water increments; a database revision test rejects stale replacement. The complete 22-case browser regression suite passes. See [QA](QA.md) for outcomes, limits, and release-only checks.

## Phase 4 — Career

- [x] Deliver editable study categories, manual sessions, topics/notes, optional challenge, and daily/weekly targets.
- [x] Add persisted stopwatch, one-active-timer constraint, navigation/refresh recovery, tab reconciliation, discard, and idempotent finish.
- [x] Add split-day duration aggregation, category distribution, daily/weekly/30-day summaries, and source activation.

Acceptance: raw durations/totals agree; timestamped overnight sessions split correctly; manual sessions retain selected dates; timer survives refresh/navigation and two-tab races; retries finish one session only; offline finish reports unsaved state; archived categories preserve history; ownership/domain/e2e checks and lint/typecheck/build pass.

Verified: the local SQL suite exercises category/session ownership, retained manual dates, archiving, one-active timers, discard, and idempotent finish; pure tests cover midnight/DST splits and score-source integration. The hosted rollback script passed with fixtures rolled back. All 24 desktop/mobile production browser regressions passed; focused Career desktop/mobile reruns then covered offline finish feedback, recovery, and Privacy Mode after the final UI hardening. See [QA](QA.md) for exact outcomes and remaining release-only checks.

## Phase 5 — Planning

- [x] Deliver seven-day tasks, CRUD, priority/category/duration, keyboard reorder, and date selection.
- [x] Add atomic/retry-safe move/copy unfinished actions with explicit distinction between move and copy.
- [x] Add goals, all three progress modes, metric intervals/baselines/targets, milestones, and owned challenge relationships.

Acceptance: completed tasks are not carried forward; copied retries do not duplicate tasks; estimates and actual duration remain separate; manual/milestone/metric progress and empty milestones work; tasks do not inflate scores; ownership, keyboard/mobile flows, domain tests, and lint/typecheck/build pass.

Verified: the three Planning migrations are applied to the matching development project, full public types regenerated, and hosted rollback-only ownership checks passed. Local SQL checks cover RLS, relationships, revisions, carry retries and completed exclusions. Domain checks cover all three progress modes and missing/zero behavior. Desktop/mobile browser flows cover task creation, reorder/copy/move, all goal modes, accessibility, and horizontal overflow. The complete check counts are recorded in [QA](QA.md); SMTP and full-container replay remain release gates.

## Phase 6 — Insights

- [x] Reuse shared calculations for score/consistency, protein/sleep/weight/gym/study summaries, and category breakdown.
- [x] Add bounded date/challenge/category filters, overall/fitness/career/habit heatmaps, rankings, and comparable-period changes.
- [x] Show missing-data coverage, historical expectations, units, text alternatives, and in-progress status.
- [x] Reuse existing owner/date indexes; preserve caller ownership and private caching rules without a new migration.

Acceptance: chart totals match source fixtures; missing and zero remain distinct; open weeks use comparable elapsed coverage; historical rules survive later edits; no fake charts or future scores; RLS/query/domain tests and lint/typecheck/build pass.

Verified: seven pure Insights tests cover filter bounds, source totals, no-score versus zero, historical target versions, equivalent open-week portions, historical week-start changes, and category-scoped habits. Existing RLS/migration checks pass unchanged; the route reuses existing owner/date indexes and needs no new migration. Desktop/mobile browser checks cover filters, protected IDs, four heatmaps, accessibility, and overflow. Exact command outcomes are recorded in [QA](QA.md).

## Phase 7 — Reflection

- [x] Add owned weekly reviews with wins/difficulties/lessons/changes and optional ratings.
- [x] Add monthly reflections with all requested prompts and notes.
- [x] Display adjacent period statistics via shared analytics and preserve period anchors across preference changes.

Acceptance: one review per user/period; saving/reopening/editing works; ratings/date boundaries validate; statistics agree with Insights; privacy and ownership tests and lint/typecheck/build pass.

Verified: the Phase 7 migration and rollback-only hosted script pass on the matching development project. Isolated PostgreSQL tests cover one-per-period, revisions, retained week anchors, ratings/date constraints, direct-write restrictions, and cross-owner reads. Reflection browser checks exercise saved edits, statistics parity with Insights, invalid routes, Privacy Mode, accessibility, and mobile layout. See [QA](QA.md) for exact command outcomes and remaining release gates.

## Phase 8 — Settings and polish

- [x] Complete profile/appearance/timezone/week-start/target/organization/challenge/habit settings.
- [x] Finish Privacy Mode across notes/labels/tooltips/search/accessibility and the separate hide-private-Today preference.
- [x] Add private versioned JSON export, tracking-data deletion, recently verified account deletion, and isolated administrative client.
- [x] Add installable manifest/icons/theme metadata and public offline shell; explicitly exclude personal/auth/API responses from service-worker caches.
- [x] Finish light-theme, mobile, keyboard, contrast, reduced-motion, empty/error, chart-loading, and performance review.

Acceptance: export is complete and owner-scoped; account/data deletion matches its stated scope; administrative credentials are absent from browser assets; privacy has no secondary-label leaks; PWA installs and offline shell works without private caching; feature/security/e2e checks and lint/typecheck/build pass.

Verified: all 48 desktop/mobile production browser checks pass. Phase 8 covers 24 protected routes per browser for private client payloads, light-theme accessibility, and horizontal overflow; data controls pass keyboard and tablet checks. Export/deletion SQL and hosted fixtures pass, the private credential scan finds no leaks, and Chromium installation eligibility/offline caches are verified. Real operating-system installation and staging/email checks remain Phase 9 gates. See [QA](QA.md).

## UI/UX refinement — before final QA

The approved [UI/UX refinement plan](UI_REFINEMENT_PLAN.md) defines seven sequential design and interface phases with their own acceptance gates. Phases A–E passed their recorded gates on October 2, 2026. F/G code and automated checks are delivered; finish physical-device and actual screen-reader verification before beginning Phase 9; keep business logic, database logic, routes, auth/privacy boundaries, and responsive behavior intact.

## Phase 9 — Final QA and release

- [ ] Run locked install, lint, typecheck, domain tests, SQL/RLS tests, end-to-end tests, and production build.
- [ ] Replay every migration in a fresh disposable local database; verify generated types and production-like auth flows.
- [ ] Review mobile/tablet/desktop, keyboard, privacy, console/network errors, export/deletion, and PWA behavior.
- [ ] Fix material failures; document actual deployment targets, environment setup, auth redirects/templates, backups, recovery, and release verification.
- [ ] Deploy only when release is authorized, then verify the real hosted flows and record results.

Acceptance: the complete [QA release checklist](QA.md) passes with evidence. Pending hosted configuration or a missing authorization remains an unmet release item, not a fabricated deployment.

## Completion log

| Phase | Date | Evidence/handoff |
| --- | --- | --- |
| 0 | September 30, 2026 | Nine Markdown files, 50 local links, preserved original source, balanced fences, phase/status review, illustrative math, and staged whitespace checks passed; see QA |
| 1 | October 1, 2026 | Foundation code/migrations/types delivered; lint/typecheck/build, 11 unit tests, 66 database checks, 16 real browser checks, hosted ownership/advisors, and responsive/accessibility review passed. Email tests explicitly deferred by the user until SMTP setup before production; see QA |
| 2 | October 1, 2026 | Shared trackers, historical scheduling/scoring, migrations/types, hosted security, and production tracking gates verified; see QA |
| 3 | October 1, 2026 | Fitness source/workout migrations, concurrent water, ownership, and 22 production browser checks verified; see QA |
| 4 | October 1, 2026 | Career source/timer migration, recovery/retry security, and 24 production browser regressions verified; see QA |
| 5 | October 1, 2026 | Planning migrations, all goal modes, carry/reorder ownership, and 30 production browser checks verified; see QA |
| 6 | October 1, 2026 | Shared bounded analytics, 40 domain/96 SQL cases and 34 production browser checks verified; see QA |
| 7 | October 2, 2026 | Owned reviews, shared period statistics, hosted migration/security checks, and focused browser gates verified; all regressions subsequently pass in Phase 8 |
| 8 | October 2, 2026 | 41 domain, 106 database, 48 real browser checks; hosted data controls, types, lint/typecheck/build, privacy, exports/deletion, and public offline shell verified; see QA |
| UI A | October 2, 2026 | Dark/light design tokens, mobile controls, contrast, focused desktop/mobile browser checks, 41 domain cases, lint/typecheck/build, and rendered review passed; see UI plan, DESIGN, and QA |
| UI E | October 2, 2026 | Feature-page refinement, 42 Vitest cases, lint/typecheck/build, both-theme layout/axe scans, populated chart review, and passing evidence for all 62 browser cases across full run and corrected rerun; see QA. F/G device/assistive-technology gates remain open |

Add an entry only after its gate passes. Keep later phases uncompleted until actual verification.

October 2, 2026 — post-rollback A–G QA: lint/typecheck, 42 unit cases, production build, and all 62 browser cases have passing evidence across the 60/62 full run and corrected 4/4 Fitness rerun. No application changes were required. Component adoption is cancelled. F/G physical-device and actual screen-reader gates remain open; Phase 9 has not started. See QA for fixture cleanup, command results, and remaining limits.
