# Verification strategy and results

## Truthful status

Phase 0 has documentation only. Application/domain/database/end-to-end tests cannot run because their implementations and runners do not exist yet. The matrices below are required future checks, not passing results. Actual executions belong in the dated record at the end.

Read [ROADMAP](ROADMAP.md) for phase gates, [SCORING](SCORING.md) for expected math, and [ARCHITECTURE](ARCHITECTURE.md) for ownership/source contracts.

## Tools and check meanings

Phase 1 adds npm scripts described in [README](../README.md). ESLint checks code conventions; TypeScript checks types; Vitest checks pure calculation behavior; SQL/pgTAP tests check database constraints and ownership; Playwright checks real browser flows; the production build checks deployable compilation.

Use a disposable local Supabase database and synthetic owner-scoped fixtures for tests. Never run destructive test resets against hosted personal data. Do not seed fixtures into real user analytics. Avoid arbitrary coverage targets and tests that merely mirror implementation.

## Domain cases

| Area | Required scenarios |
| --- | --- |
| Dates/challenges | Inclusive 92-day seed, upcoming/final dates, no selected challenge, overlaps, setup after start, leap/month boundaries |
| Recurrence | Daily, weekdays, selected weekdays, custom intervals/anchor, active ranges, archive cutoff, historical versions |
| Habit states | Completed, partial count, missed, skipped, pending today, future, unscheduled; quota grid does not fabricate daily misses |
| Streaks | Weekend gaps, missed/skipped break, pending today preserved, completion today extends, longest history, frequency instead of daily streak |
| Frequency | Sessions versus distinct days, complete/draft sessions, week/month boundaries, partial creation/end proration, open periods |
| Metrics | Missing versus logged zero, positive target validation, min/max formulas, raw overachievement, canonical units, observation exclusions |
| Score | Weighted item/category means, renormalization, no eligible inputs, all-muted configuration, unavailable source, daily/weekly split, duplicate-source exclusion |
| History | Next-day/next-period edits, old policy preserved, backdated correction, timezone/week-start changes without moving old periods |
| Study | Manual duration, category totals, midnight/DST split, one session-frequency event, overlapping independent sessions clearly represented |
| Fitness | Missing-day weight windows/coverage, sleep overnight/duration consistency, stable exercise history, water concurrent updates/retries |
| Planning | Empty milestones, percentage bounds, metric baseline direction/range, carry-forward completed exclusions, move/copy retry safety |
| Insights | Source totals equal charts, same filters across summaries, comparable open periods, missing/zero heatmap states, no future performance |

## Database security matrix

For every new owned table, run as anonymous, authenticated user A, and authenticated user B:

- A can read and mutate A's valid records; B cannot read, update, or delete them.
- Neither user can insert with another user's owner ID or change ownership during update.
- Child records cannot reference another owner's parent; join rows cannot mix owners on either side.
- Filtered reads, RPCs, views, bulk operations, and exports obey ownership, not only the default page query.
- Constraint tests reject invalid statuses/counts/dates/units/ratings and overlapping effective-rule intervals.
- Archive retains historical records, explicit hard deletion has documented scope, and account deletion removes owned descendants.
- Concurrent increments/finishes/copies meet their atomicity/idempotency guarantees.

Verify grants and routine execution permissions alongside policies. Prefer security-invoker routines. If a narrowly required definer function exists, constrain search path, privileges, and authenticated owner checks, and test it directly.

## Browser flows and presentation

| Phase | Important flows |
| --- | --- |
| 1 | Signup/confirmation, duplicate/error handling, login/logout, recovery, expired sessions, unauthenticated access, unsafe redirects |
| 2 | Optional starter setup twice, challenge selection/no challenge, habit/grid updates, metric corrections, source exclusions, score breakdown |
| 3 | Fast water logging, sleep modes, raw values/charts, workout save/copy, independent workout history |
| 4 | Manual sessions, timer navigation/refresh, two tabs, finish retry, discard, temporary connectivity loss, long elapsed review |
| 5 | Weekly date selection/reorder, unfinished move/copy, all goal modes, milestone editing |
| 6–7 | Consistent analytics filters, truthful empty/partial charts, review save/reopen/statistics |
| 8 | Both themes, privacy across secondary text/accessibility, export, data/account deletion, PWA/offline shell |

Review representative widths around 390 px phone, 768 px tablet, and 1440 px desktop, plus an actual mobile browser where available. Check long labels, focus/keyboard order, sheets/dialogs, grid scrolling, touch controls, reduced motion, contrast, chart alternatives, and loading/error recovery. Do not rely on screenshots alone for auth or security verification.

Review privacy masking before hydration and in tooltips, accessible names, search, notes, and secondary charts. Check browser bundles for privileged credentials. Inspect service-worker behavior to confirm personal/auth/API/export responses never enter its cache.

## Release checklist — Phase 9

- [ ] Locked install, lint, typecheck, unit tests, SQL tests, e2e tests, and production build pass.
- [ ] Fresh local migrations replay; generated types match schema; no real secrets or personal fixture exports are tracked.
- [ ] All ownership matrix rows and retry/concurrency contracts pass.
- [ ] Supported desktop/mobile/keyboard flows pass with no material console/network errors.
- [ ] Production-like confirmation/recovery/session cookies and allowed redirects work.
- [ ] Privacy, export, deletion, themes, PWA installation, and public-only offline behavior pass.
- [ ] Staging/production environment and database targets are explicit and separate.
- [ ] Backup/recovery procedures are documented against actual configured services.
- [ ] Authorized hosted release and post-release checks are recorded; no pending material defects.

## Documentation verification

For documentation-only phases, inspect local Markdown link destinations, balanced code fences, required-document coverage, source preservation, acceptance gates, dates, math examples, and truthful status labels. Use `git diff --check` to catch whitespace errors; after staging it checks newly added documents as well. External documentation was consulted for workflow accuracy; external link availability is not application validation.

Avoid adding application tests or placeholder tooling solely to validate documentation. When a reusable project verification command is introduced later, commit it and its usage instructions alongside the workflow.

## Verification record

### Phase 0 — September 30, 2026

Initial evidence:

- Repository inspection: no tracked application or existing AGENTS/canonical documentation; initial unborn `master`, no remote.
- Environment inspection: Node 22.15.0, npm 10.9.2, Docker CLI present. Docker daemon not checked; Supabase CLI not installed.
- Official Next.js installation and Supabase CLI/migration documentation consulted. Planned commands are not executed application commands.
- Local documentation branch: `codex/docs-phase-0`. No push, remote project, or deployment.

Executed documentation checks:

- A one-off Node integrity check passed for all nine Markdown documents and 50 local link destinations. Every document has a title and balanced code fences.
- Byte comparison passed: MASTER_SPEC is identical to the original attached specification.
- Phase coverage check passed for 0–9, and package-manifest absence confirmed the documentation-only boundary.
- Illustrative fixture math passed: 92 inclusive challenge days, day 30 on September 30, 32.6% time progress, 62 following days, prorated quota 2, protein adherence 96.9%, weighted score 94.1.
- `git diff --cached --check` passed after adding the documents to the index. The staged file inventory contains documentation only.
- Manual contract review covered architecture/schema/routes/components, source availability/activation, date/history/ownership rules, risks, acceptance gates, and unimplemented/verified labels. Roadmap records only Phase 0 as complete.

The integrity check validates document consistency and fixture arithmetic; it is not a test of an application scoring engine. No npm dependencies or test runner were introduced to perform it.

Application lint, typecheck, tests, production build, migrations, authentication, database RLS, and visual checks: **not run; Phase 1 and later implementation required**.
