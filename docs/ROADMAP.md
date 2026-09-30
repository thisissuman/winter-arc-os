# Implementation roadmap and phase gates

## Status

**Phases 0 and 1 are complete as of October 1, 2026. The user explicitly deferred signup-confirmation/recovery email tests until SMTP setup before production.** Phases 2–9 are not started. The foundation and category-index migrations are applied to the matching hosted development project, and generated types/hosted ownership checks are verified. Dedicated-account browser checks and real refresh-token rotation pass; signup/confirmation/recovery email verification remains an unmet release gate under the user-approved deferral. Phase 2 is next, when requested.

The accepted plan calls for one phase at a time. Start with the earliest incomplete phase unless the user names a phase whose dependencies are already complete. Finish the phase's validation/documentation and stop with a handoff. Do not expand a phase into the entire application.

Read [AGENTS](../AGENTS.md), [PRODUCT](../PRODUCT.md), and the relevant [architecture](ARCHITECTURE.md), [scoring](SCORING.md), [design](../DESIGN.md), and [QA](QA.md) sections before implementation.

## Dependencies and definition of done

| Phase | Dependencies | State |
| --- | --- | --- |
| 0 — Documentation | None | Complete; documentation checks passed |
| 1 — Foundation | 0 | Complete; email tests deferred by user until before production |
| 2 — Core tracking | 1 | Not started |
| 3 — Fitness | 2 | Not started |
| 4 — Career | 2 | Not started |
| 5 — Planning | 2 | Not started |
| 6 — Insights | 2, 3, 4 | Not started |
| 7 — Reflection | 6 | Not started |
| 8 — Settings and polish | 1–7 | Not started |
| 9 — Final QA and release | 1–8 | Not started |

Default delivery order is 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9. Dependencies allow an explicitly requested alternate order for fitness/career/planning; they do not authorize parallel agents or unchecked skipping.

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

Remaining configuration: a deliverable email inbox and appropriate email service for signup/confirmation/recovery verification. The supplied confirmed fixture uses an example-domain address. Hosted Site URL and exact callbacks are configured for localhost:3000. Custom templates remain locked by the current free-plan dashboard without SMTP; secure default-template PKCE callbacks and token-hash callbacks are both implemented. Applied migration versions are `20260930180649_foundation` and `20260930181434_categories_parent_index`; local filenames match the hosted ledger. Generated hosted types compile, and temporary SQL security fixtures were rolled back. Phase 1 closes under the user-approved email-test deferral recorded in PRODUCT. Phase 2 is not started; production release still requires the deferred email checks.

## Phase 2 — Core tracking

Boundary: reusable challenges/habits/metrics/targets, numerical logging, real Today, and scoring. Do not create fitness/study source tables early.

### 2A — Challenges and optional starter setup

- [ ] Add owned challenge CRUD, selection, valid statuses/dates, associations, and timing calculations.
- [ ] Add onboarding timezone/week-start confirmation and optional idempotent starter definitions.
- [ ] Keep starter dates editable, tracker eligibility starting on setup day, and all performance history empty.

### 2B — Habits and grid

- [ ] Add habit CRUD/archive/permanent deletion, effective-dated recurrence, counts, and status logging.
- [ ] Add monthly grid, month navigation, accessible status changes, scheduled-opportunity streaks, and quota progress.

### 2C — Metrics and frequency

- [ ] Add manual metric definitions/raw values, effective targets, source-aware frequency rules, and source-availability states.
- [ ] Add atomic retry-safe quick additions and stale replacement-edit handling.

### 2D — Today and scoring

- [ ] Implement shared calculations and versioned configurable scoring categories/policies.
- [ ] Deliver fast Today logging, private-item handling, explainable daily score, weekly progress, and separate monthly quotas.
- [ ] Keep future workout/study/sleep sources explicitly unavailable and excluded until their phases.

### Acceptance gate

- [ ] Challenge and no-challenge tracking work; shared associations never duplicate source logs.
- [ ] All recurrence/grid states, missing versus zero, skips, history edits, proration, streaks, and scoring examples pass tests.
- [ ] New tables/relationships pass RLS and constraint tests; retries/concurrent writes preserve counts.
- [ ] Lint, typecheck, tests, build, mobile/keyboard logging, and source-to-UI persistence checks pass.

Result: a useful daily habit/measurement application. Handoff identifies unavailable future sources truthfully.

## Phase 3 — Fitness

- [ ] First deliver weight/protein/water/creatine/sleep/steps setup and logging, using existing raw metric/habit sources.
- [ ] Add sleep storage/derivation, seven-day and weekly weight averages, protein adherence, and bounded charts with text summaries.
- [ ] Add workouts, reusable exercise IDs, ordered sets, optional RPE, transactional copying, and progression history.
- [ ] Activate workout/sleep metric and quota sources without copying measurements into duplicate logs.

Acceptance: Today/Fitness totals agree; concurrent water additions and stale manual edits behave correctly; sleep timestamps/durations and missing-date averages are accurate; copied workouts are independent/retry-safe; gym quotas count completed sessions; ownership/domain/UI checks and lint/typecheck/build pass.

## Phase 4 — Career

- [ ] Deliver editable study categories, manual sessions, topics/notes, optional challenge, and daily/weekly targets.
- [ ] Add persisted stopwatch, one-active-timer constraint, navigation/refresh recovery, tab reconciliation, discard, and idempotent finish.
- [ ] Add split-day duration aggregation, category distribution, daily/weekly/30-day summaries, and source activation.

Acceptance: raw durations/totals agree; timestamped overnight sessions split correctly; manual sessions retain selected dates; timer survives refresh/navigation and two-tab races; retries finish one session only; offline finish reports unsaved state; archived categories preserve history; ownership/domain/e2e checks and lint/typecheck/build pass.

## Phase 5 — Planning

- [ ] Deliver seven-day tasks, CRUD, priority/category/duration, keyboard reorder, and date selection.
- [ ] Add atomic/retry-safe move/copy unfinished actions with explicit distinction between move and copy.
- [ ] Add goals, all three progress modes, metric intervals/baselines/targets, milestones, and owned challenge relationships.

Acceptance: completed tasks are not carried forward; copied retries do not duplicate tasks; estimates and actual duration remain separate; manual/milestone/metric progress and empty milestones work; tasks do not inflate scores; ownership, keyboard/mobile flows, domain tests, and lint/typecheck/build pass.

## Phase 6 — Insights

- [ ] Reuse shared calculations for score/consistency, protein/sleep/weight/gym/study summaries, and category breakdown.
- [ ] Add bounded date/challenge/category filters, overall/fitness/career/habit heatmaps, rankings, and comparable-period changes.
- [ ] Show missing-data coverage, historical expectations, units, text alternatives, and in-progress status.
- [ ] Add only justified query indexes/routines; preserve caller ownership and private caching rules.

Acceptance: chart totals match source fixtures; missing and zero remain distinct; open weeks use comparable elapsed coverage; historical rules survive later edits; no fake charts or future scores; RLS/query/domain tests and lint/typecheck/build pass.

## Phase 7 — Reflection

- [ ] Add owned weekly reviews with wins/difficulties/lessons/changes and optional ratings.
- [ ] Add monthly reflections with all requested prompts and notes.
- [ ] Display adjacent period statistics via shared analytics and preserve period anchors across preference changes.

Acceptance: one review per user/period; saving/reopening/editing works; ratings/date boundaries validate; statistics agree with Insights; privacy and ownership tests and lint/typecheck/build pass.

## Phase 8 — Settings and polish

- [ ] Complete profile/appearance/timezone/week-start/target/organization/challenge/habit settings.
- [ ] Finish Privacy Mode across notes/labels/tooltips/search/accessibility and the separate hide-private-Today preference.
- [ ] Add private versioned JSON export, tracking-data deletion, recently verified account deletion, and isolated administrative client.
- [ ] Add installable manifest/icons/theme metadata and public offline shell; explicitly exclude personal/auth/API responses from service-worker caches.
- [ ] Finish light-theme, mobile, keyboard, contrast, reduced-motion, empty/error, chart-loading, and performance review.

Acceptance: export is complete and owner-scoped; account/data deletion matches its stated scope; administrative credentials are absent from browser assets; privacy has no secondary-label leaks; PWA installs and offline shell works without private caching; feature/security/e2e checks and lint/typecheck/build pass.

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

Add an entry only after its gate passes. Keep later phases uncompleted until actual verification.
