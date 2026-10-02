# Verification strategy and results

## Truthful status

Phases 0–8 are implemented in the configured development project. UI/UX refinement Phases A–E are complete; F/G implementations have automated evidence, with physical-device and actual screen-reader acceptance gates open. Component adoption was cancelled and reverted. Phase 7 Reflection has an applied owned migration, regenerated types, and passing isolated/hosted security checks. Reflection and Settings desktop/mobile checks, private data controls, and public offline behavior pass the complete 48-case regression suite; exact outcomes are recorded below. Signup/confirmation/recovery email verification remains deferred until SMTP setup before production. Full local Supabase container replay and staging/production release checks remain open.

Git `origin` is the user-provided `https://github.com/thisissuman/winter-arc-os.git`. The remote was empty initially, so the first Phase 3 push became GitHub's default branch. The subsequent user-requested organization established `master` at the verified Phase 4 tip, set it as default, and published all five phase checkpoints under `feature/`. Old `codex/` remote branch names were removed after the new refs were verified. The branch structure does not establish a deployment or completion of later product phases.

Read [ROADMAP](ROADMAP.md) for phase gates, [SCORING](SCORING.md) for expected math, and [ARCHITECTURE](ARCHITECTURE.md) for ownership/source contracts.

## Tools and check meanings

Actual npm scripts are described in [README](../README.md). ESLint checks code conventions; TypeScript checks types; Vitest checks pure calculation behavior; foundation Vitest tests execute SQL in isolated PGlite PostgreSQL to check constraints and ownership; Playwright checks real browser flows; the production build checks deployable compilation.

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
- [ ] Production-like confirmation/recovery/session cookies and allowed redirects work, including the signup-confirmation and password-recovery email tests explicitly deferred at the Phase 1 handoff.
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


### Phase 1 — September 30, 2026

Implemented scope: Next.js/TypeScript/Tailwind/shadcn foundation, four-table migration, Supabase cookie clients/proxy, real auth Server Actions, protected empty Today, profile/theme settings, generated public types, and responsive delivered-only navigation. No personal tracking history or future tables were created.

| Check | Outcome |
| --- | --- |
| `npm ci` | Passed; 713 installed packages, zero audit vulnerabilities |
| `npm run lint` | Passed using ESLint compatibility adapter |
| `npm run typecheck` | Passed, including generated Next.js route declarations |
| `npm run test` | 11 auth validation/redirect tests passed, including optional profile-name clearing |
| `npm run test:db` | 66 checks passed: existing SQL cases plus local validation/rollback of the hosted security script |
| Production build | Passed using Webpack; local Geist requires no font network fetch |
| Production Playwright | All 16 checks passed across desktop/mobile; no authenticated checks skipped |
| Automated accessibility | Auth screens, dark Today, and light Settings passed WCAG 2 A/AA and 2.1 AA axe checks in both projects |
| Keyboard | Auth skip-to-form/input focus and workspace skip-to-main/CTA focus passed in both projects |
| Visual review | Dark login/Today and light Settings inspected on desktop/mobile; Today also inspected at 768×1024 tablet; reduced-motion rendering verified |
| Impeccable detector | No reported source matches |
| Hosted project probe | Auth settings HTTP 200: email enabled, signup enabled, email confirmation required; all four anonymous table reads denied with HTTP 401 / SQL `42501` |
| Hosted MCP target | Matches `.env.local`; write access and both migrations succeeded |
| Hosted ownership SQL | Passed on the actual project; all temporary fixtures rolled back |
| Hosted generated types | Regenerated through MCP; typecheck/build passed |
| Supabase advisors | Security and performance return no findings |
| Full local Supabase | Not run: Docker CLI exists but no running daemon |

SQL checks cover all four tables under anonymous and two distinct authenticated identities, owned CRUD, forged ownership inserts, owner-transfer updates, cross-owner parent links, timezone/theme/week-start/name constraints, update triggers, cascades, initializer idempotence, rollback on initializer failure, and revoked private helper execution. Test-only auth infrastructure is isolated and is not committed as a deployable migration.

Public browser tests cover form navigation, meaningful server validation, field/alert association, unauthorized route protection, unsafe confirmation redirects, no-store response headers, horizontal overflow, accessibility, and keyboard navigation. They run against the actual production Next.js server. They do not fake successful Auth HTTP responses.

Reviewed artifacts are regenerated in ignored `test-results/`: `login-desktop.png`, `login-mobile.png`, `today-desktop.png`, `today-mobile.png`, `today-tablet.png`, and `settings-light-desktop.png` / `settings-light-mobile.png`. Mobile screenshots reflect device scale and full-page captures. All named private-screen artifacts came from real authenticated sessions. Never publish browser traces, which can contain test credentials.

Known environment/tooling details: Next.js Turbopack initialization failed under the current process/port restrictions, so Webpack is explicit. npm warns that bundled import/React/accessibility plugins advertise older ESLint peer ranges; the official compatibility adapter, clean locked install, and lint execution were verified. Full-stack Docker/auth checks are not replaced by the isolated SQL results.

Deferred release gate, by explicit user instruction on October 1, 2026: signup/confirmation/recovery through a real deliverable inbox, including a successful email callback and password update. Hosted Site URL/callbacks are configured; login, persistence, real refresh, settings/themes, private-shell accessibility, and logout pass. Hosted custom SMTP is not configured, and the current free dashboard locks custom templates; the app now also supports default-template PKCE codes. Staging/production deployment and a full local Supabase container replay remain unverified. Phase 1 is complete under this approved verification deferral; production release is not approved or verified.


Earlier connection recheck — September 30, 2026: `get_project_url` returned the configured development project. `select 1 as connection_ok, current_database() as database_name;` returned `connection_ok = 1` and `database_name = postgres`. Public-table and migration inspection returned empty lists. The saved MCP URL has `read_only=true`; the available tool inventory omits `apply_migration`. No hosted SQL mutation, migration, or credential change was performed.


Write-access verification — September 30, 2026: the project URL matched `.env.local`, and pre-migration inspection found no public tables or migration history. Authorized MCP deployment applied `20260930180649_foundation` and `20260930181434_categories_parent_index`; local SQL filenames match those recorded versions. All four tables have RLS enabled. A [missing foreign-key covering index advisory](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys) was resolved by the second incremental migration; security and performance advisors then returned no findings.

The hosted rollback-only script verifies actual anonymous read/write denial on all four tables, A/B read isolation, cross-owner update/delete denial, forged owner insert/transfer denial, owned CRUD, category parent ownership, initializer defaults, private initializer privileges, and auth-user cascades. Its fixtures are generated UUIDs in a rolled-back transaction and never become personal tracking data. Separately, real PostgREST anonymous reads return HTTP 401 / `42501` for every foundation table. SQL role tests do not establish that Auth-issued JWTs, email delivery, or browser sessions work.

Latest execution after dedicated-account setup: lint, typecheck, 11 auth unit tests, 66 database tests, production build, and all 16 desktop/mobile browser checks pass. No successful Auth responses are mocked. The user-created confirmed account signs in through the app; profile updates (including clearing an empty initial name), theme updates, reloading, keyboard access, and logout/protected redirects pass. Fixture values are restored through caller-scoped API requests in `finally`. A navigation race in the mobile test was fixed by waiting for Settings before reloading.

The refresh check expires only the persisted `expires_at` cookie metadata while keeping real Auth-issued credentials, then reloads through the proxy and verifies future expiry plus actual refresh-token rotation. It does not manufacture a signed JWT or verify waiting until its real expiry. No credential values appear in test output or documentation.

Browser checks found the global Next.js `Referrer-Policy` overriding the callback handler. A route-specific configuration now ensures callbacks return `no-referrer`, verified alongside `private, no-store`. Both missing/invalid token parameters and invalid PKCE codes reject unsafe redirect destinations.

Hosted dashboard verification: Site URL is localhost:3000; exact confirmation and recovery redirect URLs are saved without wildcards. Default confirmation template uses `.ConfirmationURL`; template editing is disabled without SMTP on this free project. The application adds cookie-bound [PKCE code exchange](https://supabase.com/docs/guides/auth/sessions/pkce-flow) while retaining direct token-hash verification. The default service sends only to [authorized organization team addresses](https://supabase.com/docs/guides/auth/auth-smtp). The configured example-domain fixture has no deliverable inbox, so email gates remain explicitly unverified. The user explicitly instructed skipping signup-confirmation and password-recovery email delivery tests for now and configuring SMTP before production. No email tests were performed after that instruction. Phase 1 closes with this deferral; repeat the email/callback/password-update checks before release. Passwords and email links must remain out of chat.


Phase 1 closeout — October 1, 2026: documented the explicit user-approved email-test deferral in PRODUCT, ARCHITECTURE, ROADMAP, README, and AGENTS. All nine Markdown documents pass title/fence checks and 47 local link destinations exist. Diff whitespace checks pass. Phase 2 remains unstarted; no push, merge, or application deployment was performed.

### Phase 2 validation and hosted migration — October 1, 2026

The first source pass made no test or database changes, as requested at that time. The user's later request authorized validation and migration. The Supabase MCP URL matched `.env.local`; hosted inspection found only the two foundation versions and four foundation tables before deployment. `20261001004511_core_tracking` was applied after local PostgreSQL replay, then `20261001004734_score_items_policy_category_index` resolved a missing composite foreign-key covering-index advisory. Both local filenames match the hosted ledger. The 17 tracking tables have RLS enabled. Hosted types were regenerated from the matching public schema, and the temporary authored type bridge and incomplete foundation-only generator were removed.

| Check | Phase 2 outcome |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed with hosted generated types |
| `npm run test` | 20 passed, including calendar, recurrence, missing/zero, quota, streak, score, duplicate-source, and policy-version cases |
| `npm run test:db` | 75 passed after fresh incremental migration replay; includes Phase 2 grants/RLS, same-owner FKs, overlap constraints, shared challenge log, stale revisions, idempotent increments, starter idempotence, and local replay of both hosted rollback scripts |
| `npm run build` | Passed with all Phase 2 routes in the production output |
| Hosted `hosted-tracking.sql` | Passed on the authorized project; all synthetic Auth/tracking fixtures rolled back |
| Production browser | 16 foundation and 2 tracking checks passed across desktop and mobile, run against real hosted Auth and data; no authenticated checks skipped |
| Accessibility and input | Today, Habits, and Metrics passed WCAG 2 A/AA and 2.1 AA axe scans in both browser projects; keyboard habit toggling and horizontal-overflow checks passed |
| Fixture cleanup | Tracking E2E definitions deleted through owned actions; hosted query confirmed zero `E2E practice %` habits and `E2E water %` metrics afterward |

The browser tracking checks create a habit and manual water metric, log them from Today, reload to verify persistence, inspect the habit grid and metric page, and remove their definitions/history. SQL checks cover two-user isolation and shared source records; the browser checks use one dedicated confirmed account. The starter is verified through transactional SQL, not an email or public signup flow.

Supabase's security advisor reports 13 authenticated `security definer` RPC warnings; these are intentional because direct table writes are revoked and each function rechecks `auth.uid()`, fixes its search path, and enforces owner relationships. The hosted Auth advisor also reports leaked-password protection disabled; review and enable it before production if available in the chosen plan. The performance advisor's unindexed-FK finding was fixed; remaining unused-index notices are expected on newly empty tables. Full local Supabase Docker replay, actual concurrent multi-client increment stress, and signup/recovery email delivery are still release-level checks. No fabricated performance records or test fixtures were left in analytics.

### Phase 3 fitness validation and hosted migration — October 1, 2026

The Supabase MCP URL matched `.env.local`, and inspection confirmed the four expected prior migrations and no fitness tables before deployment. The reviewed fitness SQL was replayed locally, applied to the same development project as `20261001044053_fitness`, and followed by `20261001044323_fitness_owner_indexes` after the advisor found two uncovered auth-user FKs. A focused edit test found an ambiguous workout identifier; `20261001044532_workout_edit_fix` corrected it without editing the deployed migration. `20261001050228_workout_payload_guard` rejects absent child arrays from direct authenticated RPC calls. Local filenames match all hosted versions. Full public TypeScript types were regenerated from the matching project. All six fitness tables have RLS enabled; the advisor reports no unindexed foreign keys after the follow-up migration.

| Check | Phase 3 outcome |
| --- | --- |
| `npm run lint` and `npm run typecheck` | Passed with generated Phase 3 types |
| `npm run test` | 23 passed, including derived sleep hours, completed-only gym quotas, and missing-day weight averages |
| `npm run test:db` | 82 passed after fresh incremental replay; includes fitness grants/RLS, overnight sleep, setup idempotence, revision conflicts, malformed payload rejection, independent/retry-safe workout copies and edits, and rollback-script replay |
| `npm run build` | Passed with `/fitness` and workout routes in production output |
| Hosted `hosted-fitness.sql` | Passed against the authorized development project; synthetic users and rows rolled back |
| `npm run test:e2e` | 22 passed across desktop/mobile, including earlier auth/tracking regressions and four fitness browser checks |
| Fitness browser checks | Sleep value matched Today/Metrics, completed workout counted while copy remained draft, two-tab +250 ml additions both persisted, and Fitness passed WCAG 2 A/AA + 2.1 AA axe and horizontal-overflow checks |
| Fixture cleanup | E2E workouts and sleep entries removed through owned UI actions; remaining archived E2E exercise definitions removed by a narrowly targeted development-project cleanup query. Zero E2E workout/exercise rows remained. |

The fitness source is opt-in and creates definitions only. Sleep stores one wake-date record; workout sets remain children of one reusable exercise identity. Missing dates are excluded from averages and shown as coverage. Concurrent water additions were exercised with two authenticated browser tabs; stale manual replacement was verified at the SQL routine boundary. A failed exploratory browser check initially timed out during fixture cleanup and left one copied draft; it was identified by its synthetic E2E name and removed with a targeted cleanup query before the passing full run. No fabricated fitness analytics remain in the test account.

The hosted security advisor now reports 19 authenticated `security definer` RPC warnings, including the six new fitness routines. Their exposure is intentional: direct table mutations are revoked, each routine checks `auth.uid()`, fixes `search_path`, and validates owned references. Unused-index notices reflect mostly empty development tables. The browser server occasionally logs Next.js “destination stream closed early” while navigation aborts an in-flight response; the 22 browser assertions pass, but investigate if this appears during ordinary user navigation in Phase 9. Full local Docker-stack replay and signup/recovery email delivery remain unverified release checks. SMTP setup is still required before production.

### Phase 4 Career validation and hosted migration — October 1, 2026

The Supabase MCP URL matched `.env.local`; inspection found all eight expected prior migrations and no Career tables. The locally replayed `20261001052104_career` migration was applied to that same development project. Hosted public types were regenerated from the matching schema. The three new tables have RLS, read-only direct grants for authenticated users, same-owner foreign keys, a one-active-timer partial index, and checked transactional RPCs. The hosted performance advisor reports no unindexed foreign keys.

| Check | Phase 4 outcome |
| --- | --- |
| `npm run lint` and `npm run typecheck` | Passed after the final Career/privacy changes |
| `npm run test` | 28 passed, including local-midnight/DST splits, pause-gap exclusion, and derived study source/quota evaluation |
| `npm run test:db` | 90 passed after fresh incremental replay; includes three new tables' grants/RLS, owned relationships, archive history, manual timestamp validation, one-active constraint, discard, and finish retry returning one session |
| `npm run build` | Passed with `/career` and `/career/sessions` in the production output after final UI changes |
| Hosted `hosted-career.sql` | Passed against the authorized development project; synthetic Auth/study rows rolled back |
| `npm run test:e2e` | Full 24-case desktop/mobile regression suite passed, including two Career flows; no authenticated checks skipped |
| Focused Career browser recheck | Four desktop/mobile Career cases passed across focused runs after offline failure handling and privacy hardening; category names/editor controls stayed masked |
| Fixture cleanup | Manual E2E sessions deleted and categories archived through owner-scoped UI; only narrowly matched, archived synthetic categories and discarded timers were removed from the development project. Zero `E2E career %` rows remained. |

Career setup creates definitions and optional targets, never time records. Daily/weekly/30-day totals and Today/Metrics derive minutes from saved sessions; timestamped intervals split using the retained timezone, while session frequency counts the completion date once. The browser flow verifies manual totals, persistent timer after refresh/navigation, and a second tab observing pause/resume; SQL tests verify finish idempotence. An actual offline finish attempt was checked on desktop/mobile: the action reported an unsaved connection failure, kept the confirmed timer visible, and recovered when the connection returned. A browser finish lasting at least one minute was not run; local transaction checks cover the save and retry behavior.

The hosted security advisor reports 24 authenticated `security definer` routine warnings (the previous 19 plus five Career RPCs). These routines revoke direct writes, check `auth.uid()` through the private owner helper, fix `search_path`, and validate owned references. The Auth advisor still reports leaked-password protection disabled; review it before production. Performance shows unused-index information on a mostly empty development schema. The full local Docker stack and deliverable signup/recovery email remain release checks. During verification, running typecheck and build simultaneously caused a transient missing `.next/types` file report; each passed when run sequentially, and this command-order rule is now in AGENTS/README. Browser navigation still occasionally logs Next.js “destination stream closed early”; the passing browser checks did not see a failed user flow.


### Phase 5 Planning validation and hosted migration — October 1, 2026

The Supabase MCP URL matched `.env.local`; inspection found all nine expected previous migration versions before deployment. The locally replayed Planning schema applied to the same development project as `20261001104654_planning`. The advisor identified one uncovered milestone owner FK; `20261001104905_planning_goal_owner_index` added its covering index. A focused copy check found carried copies should start as fresh work; `20261001105141_planning_copy_reset` resets their status and actual duration without changing the earlier applied migration. All local filenames match the hosted ledger. Full public database types were regenerated from the matching project. All four new tables have owner RLS, read-only direct authenticated grants, owner-matching relationships, revision checks, and checked transactional RPC writes. The rollback-only hosted Planning security script passed and left no rows.

| Check | Phase 5 outcome |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed with generated Phase 5 types |
| `npm run test` | 33 passed, including five Planning domain cases for manual/milestone/metric progress, direction, missing versus zero, and task ordering |
| `npm run test:db` | 96 passed after fresh incremental migration replay; includes Planning grants/RLS, owned references, stale revisions, task reorder, completed exclusions, retry-safe carry, copy reset, milestones, and rollback-script replay |
| `npm run build` | Passed with `/plan`, `/tasks`, `/goals`, and `/goals/[id]` in production output |
| Hosted `hosted-planning.sql` | Passed against the configured development project; all synthetic owner/task/goal fixtures rolled back |
| `npm run test:e2e` | All 30 production browser checks passed across desktop/mobile; no authenticated checks skipped |
| Planning browser checks | Focused four-case desktop/mobile run passed task reorder/copy/move, goal mode transitions, WCAG 2 A/AA + 2.1 AA axe, and horizontal-overflow checks |
| Fixture cleanup | Focused and full-suite Planning fixtures removed by exact-name development-project queries; hosted check found zero matching task/goal rows afterward |

Tasks stay outside scoring. The seven-day view uses the user's week-start preference, selected-day editing, and distinct estimated/actual seconds. Move retains recorded work; copy starts as new `todo` work and keeps only the estimate. Retry receipts return the same copied IDs. Goal summaries distinguish empty milestones and absent metric measurements from a measured zero, and support latest/sum/count over an explicit interval and downward baseline-to-target progress. The Planning browser flow uses a real confirmed account and does not mock Auth. Private task and goal content is masked in Privacy Mode; a complete cross-application privacy audit remains a Phase 8 gate.

The hosted performance advisor has no unindexed-FK finding; unused-index notices reflect mostly empty development tables. The security advisor reports authenticated `security definer` routines (the existing 24 plus six Planning RPCs). They are intentional because direct table writes are revoked and each function checks the caller, fixes `search_path`, and validates owned references. The Auth advisor still reports leaked-password protection disabled; review before production. Full local Supabase container replay, signup/recovery email delivery, and staging/release checks remain open. Browser navigation occasionally logs Next.js “destination stream closed early”; passing assertions have not shown a failed user flow.

### Phase 6 Insights validation — October 1, 2026

Insights adds no table or RPC. It reuses owner-scoped, paginated reads and the existing owner/date indexes for habit logs, metric logs, sleep, workouts, and study sessions. The compact reader bounds event records to the selected window plus comparison/session-spill dates and omits unrelated workout set/timer detail. The authenticated route rejects future or more than 180 calendar days, as well as challenge/category IDs absent from the caller's owned snapshot. No hosted schema mutation or generated-type change was needed.

| Check | Phase 6 outcome |
| --- | --- |
| `npm run lint` | Passed after Phase 6 source changes |
| `npm run typecheck` | Passed; final production build also checks TypeScript |
| `npm run test` | 40 passed, including seven Insights cases for bounds, missing versus zero, equal-coverage weeks, week-start changes, historical targets, source totals, and category-specific habit ranks |
| `npm run test:db` | 96 passed on a standalone rerun of all existing migration/RLS checks; no Phase 6 migration |
| `npm run build` | Passed with `/insights` as a protected dynamic route |
| Focused Insights browser | Four desktop/mobile checks passed for source/score panels, bounded filters, unknown owned-filter IDs, WCAG 2 A/AA + 2.1 AA axe, and horizontal overflow |
| `npm run test:e2e` | 34 passed across desktop/mobile on the final production build; authenticated checks used the confirmed development account |

An earlier `test:db` run overlapped the browser and lint processes: two rollback-script cases hit the runner's 15-second timeout, while 94 database checks passed. A standalone rerun passed all 96 without a source or timeout change. The first focused browser attempts exposed ambiguous test locators for Next.js route-announcer/transition markup; assertions now target the workspace's error panel. The first full browser run passed 33/34, with the remaining mobile Fitness assertion hitting the same transient duplicate summary text. Narrowing it to the active workspace made the final 34/34 run pass. These locator failures did not expose an application validation failure. The passing suite uses real hosted Auth and creates no Insights analytics fixtures. After the run, a narrowly matched development-project cleanup removed the Planning test's 12 tasks and four goals, plus five archived exercise definitions, twelve archived study categories, and six discarded timers left by older browser flows. The query verified no such fixture definitions remain; it did not touch personal records.

Daily score points and the numeric heatmaps call the same historical scoring evaluator used on Today. Missing eligible logs contribute zero with reduced coverage; no eligible score stays null. The comparison trims each week to the same elapsed number of calendar days and uses that week's own policy version. Raw metric summaries use recorded-day denominators, only completed workouts count, and saved study time uses local-midnight splits. The organizational category filter narrows habit, metric, and study-source sections; score-policy categories and their weights stay whole-context, which the UI explains. No artificial records or cached personal analytics were introduced. The cross-application Privacy Mode audit, deliverable signup/recovery email, full local Supabase container replay, and staging/release checks remain later gates.

### Phase 7 Reflection validation — October 2, 2026

The local migration was replayed in isolated PostgreSQL before the MCP URL was compared with `.env.local`, existing tables, and migration history. The reviewed migration was applied to that same development project as `20261001160428_reflection`; the local filename matches the hosted ledger. Hosted public types were regenerated. Both new review tables have RLS and read-only direct grants; writes use authenticated, owner-checked RPCs with expected revisions. The hosted rollback-only `hosted-reflection.sql` script passed, leaving no synthetic Auth or review rows. The performance advisor found no unindexed foreign keys; unused-index notices reflect mostly empty development tables.

| Check | Phase 7 outcome |
| --- | --- |
| `npm run lint` | Passed after Phase 7 source and browser-test changes |
| `npm run typecheck` | Passed with hosted generated Reflection types; production build also checks TypeScript |
| `npm run test` | 40 existing domain cases passed; Reflection statistics call the same tested Insights report |
| `npm run test:db` | 101 passed after fresh incremental replay, including five new Reflection security/period checks and rollback-script replay |
| `npm run build` | Passed with `/reflection`, weekly/monthly editors, and `/more` in the production route output |
| Hosted `hosted-reflection.sql` | Passed on the authorized project; synthetic users and review rows rolled back |
| Focused Reflection browser | Six desktop/mobile cases passed for save/reopen/edit, statistics parity with Insights, protected/invalid routes, Privacy Mode, WCAG 2 A/AA + 2.1 AA axe, and horizontal overflow |
| `npm run test:e2e` | Final full run: 39/40 passed; the remaining desktop Career flow hit its five-second real-login assertion. After allowing 20 seconds for hosted Auth, the focused desktop Career checks passed 2/2. Every regression case has a passing result; no authenticated cases were skipped. |

Weekly rows retain their original weekday and timezone when week-start preferences change; month rows require a first-of-month date. Rating and text constraints are enforced in SQL and Zod. A stale editor receives a conflict rather than overwriting another version. Current periods show statistics only through today. Written responses are not rendered in Privacy Mode, while aggregate context remains visible. Browser tests use the real confirmed development account. The first focused run exposed a save-feedback remount and an invalid-route locator; both were corrected. A later privacy check exposed a transient duplicate settings control during navigation; the selector was scoped and the dedicated test account's original Privacy Mode value restored. The first full run passed 39/40, with the mobile foundation check unable to locate the new More card by an exact accessible name. The More links now have explicit accessible names and that focused mobile check passes. A subsequent run was interrupted by long host/browser pauses and passed 35/40. The fresh run completed normally in 3.7 minutes and passed 39/40; its single failure was an Auth request still pending after five seconds. The Career login assertion now allows 20 seconds, and both focused desktop Career cases passed. No application timeout or Auth behavior was changed. Marked browser fixtures are removed using the matching development project and dedicated owner; cleanup counts are recorded below.

Phase 7 fixture cleanup used the verified matching development URL and configured server-only key while MCP OAuth refresh was unavailable. It scoped every operation to the dedicated test owner and exact synthetic markers. It removed two weekly and two monthly reviews, ten carry receipts, seventeen tasks, six milestones, six goals, six archived exercises, six discarded timers, and thirteen archived study categories. Referenced or unmarked records were preserved. Credentials and traces stay ignored.

### Phase 8 Settings/data/PWA validation — October 2, 2026

The matching development MCP recovered after reconnection. Its project URL and prior migration history were checked before applying `20261002004151_data_controls`; the local filename matches the hosted ledger, and full public types were regenerated. No new table is added. The export/deletion routines deny anonymous execution, enforce the caller's identity, and fix their search path. Private cleanup routines are inaccessible to authenticated callers. The rollback-only hosted data-controls script passed and left no Auth or workspace fixture rows.

| Check | Phase 8 outcome |
| --- | --- |
| `npm run lint` | Passed after settings, privacy, loading semantics, and offline input fixes |
| `npm run typecheck` | Passed with full hosted types and typed action wrappers |
| `npm run test` | 41 domain cases passed; includes masking serialized source text without changing scores or mutating original records |
| `npm run test:db` | 106 passed across 14 files after fresh incremental replay; includes export completeness beyond 1,000 rows, two-owner isolation, allowlist/catalog coverage, deletion confirmation/scope, restricted helpers, and Auth deletion with restrictive child records |
| Hosted `hosted-data-controls.sql` | Passed against the matched development project; synthetic owners and rows rolled back |
| `npm run build` | Passed with private HTTP endpoints, settings editors, and static manifest |
| `npm run test:e2e` | 48/48 passed in 5.4 minutes across desktop/mobile; real Auth, no authenticated checks skipped |
| Phase 8 privacy/accessibility | 24 protected routes per browser pass private-text/client-payload checks, light-theme WCAG 2 A/AA + 2.1 AA scans, and horizontal overflow checks. Dark Settings/Data, keyboard deletion fields, and 768 px tablet layout checks pass. |
| Phase 8 PWA | Chromium reports no manifest/installability errors; offline navigation uses the public document; the cache contains exactly four allowed public files. Offline save feedback preserves entered text and does not persist it. |
| Browser credentials review | Scanned 82 production browser JavaScript files: no configured administrative key or test-password values found |
| Design detector | One scoped Impeccable detector run returned no findings |

The first focused browser run passed data controls and PWA checks on desktop/mobile, then found prohibited ARIA labels on older loading screens. Those containers now use status roles, and privacy assertions wait for real page content so an empty loading screen cannot establish a false pass. The next run passed both route privacy scans but a newly added offline-save assertion exposed React's reset of uncontrolled input after an action returned an error. Settings inputs are now controlled and action wrappers preserve unsaved state. The final 48/48 regression run verifies those corrections alongside existing features. Desktop/mobile Settings, light Data controls, and offline documents were inspected in bounded visual batches. All Markdown local links resolve and the whitespace diff check passes.

The hosted security advisor reports 34 intentionally authenticated security-definer routines and the existing leaked-password-protection warning. The two added public routines scope every table read/delete to the authenticated owner. The performance advisor found no unindexed foreign keys; 20 unused-index informational findings reflect mostly empty development tables. SMTP delivery/positive email callbacks, full local Supabase container replay, actual operating-system installation (including Safari), staging, backup restoration, and deployment remain Phase 9 release checks. No production deployment or email delivery success is claimed.

Phase 8 cleanup scoped all operations to the dedicated confirmed account and exact synthetic markers. It removed two weekly and two monthly reviews, four carry receipts, six tasks, two milestones, two goals, two archived exercises, two discarded timers, and four archived study categories. Referenced or unmarked records were preserved. The Phase 8 browser fixtures delete their disposable accounts in `finally`; a hosted query confirmed zero matching disposable identities remain. Personal data was not deleted or exported by the destructive validation flows.

Occasional Next.js “destination stream closed early” logs recur when browser navigation aborts in-flight responses. The complete 48-case suite passes; review ordinary staging navigation and console/network behavior in Phase 9 before release. No private service-worker cache, queued offline write, or leaked administrative browser credential was found.

### UI/UX refinement Phase A — design tokens, October 2, 2026

Phase A changes presentation tokens and their shared consumers only. The Button/Input consumer audit covered direct primitive callers and native form controls before their defaults changed; explicit 44 px actions remain intact. No dependency, route, action, database, Auth/privacy, score, or feature-behavior change was made. `npm run test:db` and hosted mutation checks were not rerun because those contracts were untouched.

| Check | Phase A outcome |
| --- | --- |
| `npm run lint` | Passed after the final source and browser-test changes. |
| `npm run typecheck` | Passed before the production build; route types generated. |
| `npm run test` | 41/41 domain cases passed across five files. |
| `npm run build` | Passed with every existing route in the production output. |
| Focused foundation browser | `npx playwright test tests/e2e/foundation.spec.ts --grep 'authenticated account persists'` passed 2/2 desktop/mobile. It checks real Auth, theme save/restore, keyboard skip link, reduced motion, axe WCAG 2 A/AA and 2.1 AA, and horizontal overflow. |
| Focused Insights browser | `npx playwright test tests/e2e/insights.spec.ts --grep 'Insights shows bounded'` passed 2/2 desktop/mobile, including source/score panels, heatmaps, axe, and overflow. |
| Computed token review | Light/dark control-border contrast against the background was 3.23:1/4.05:1 and against the card 3.45:1/3.73:1. Body, muted, selected, feedback, and chart-label text were at least 4.5:1 on the reviewed solid surfaces. Theme focus colors were 5.21:1 light and 7.71:1 dark against page backgrounds. |
| Rendered phone audit | At 390 px, dark/light Today date inputs measured 44 px high with 16 px text; the previous-day target measured 44 px. Career's three rendered shared buttons all measured at least 44 px on phone, including a formerly compact default button; that default measured 32 px on desktop. Theme-specific focus and control-border values matched the CSS, and neither theme or Career overflowed horizontally. Insights heatmap values measured 12 px; its browser checks passed. |
| Visual inspection | Inspected `test-results/today-desktop.png`, `today-mobile.png`, `settings-light-desktop.png`, `settings-light-mobile.png`, and `phase-a-today-light-persisted-mobile.png`. The last used the saved light preference rather than a temporary class toggle. Generated images remain ignored. |
| Graph | `graphify update .` completed after source changes; generated graph output was refreshed. |

The initial focused foundation phone runs twice stopped at a five-second Today-heading assertion while authenticated data was still loading. A separate observed phone load completed in about 7.3 seconds. The test now allows 20 seconds for the initial and reload headings; the final desktop/mobile focused run passed without changing Auth or application behavior. The earlier manually toggled light screenshot was captured during a theme transition; a persisted-light screenshot and computed-style check confirmed the actual light controls. Insights produced no populated Recharts line for the dedicated account, so a populated series/tooltip visual check is deferred to the later feature/accessibility passes. The series, grid, axis, and tooltip roles are present in the chart components, and missing-data semantics were unchanged. The full 48-case browser suite was not rerun at the Phase A handoff; the later B–D full run passed all 54 cases, including the added checks. No Phase A acceptance item remains open. Occasional Next.js “destination stream closed early” output appeared during navigations, with no failed browser assertions.

### UI/UX refinement Phases B–D — shared components, shell, and Today, October 2, 2026

The code changes for B, C, and D were finished before any validation command. A commentary checkpoint then announced that checks were starting. No routes, database objects, auth/ownership code, scoring rules, queries, or Server Actions changed. `npm run test:db` and hosted schema checks were not rerun because these contracts were untouched.

| Check | Final outcome |
| --- | --- |
| `npm run lint` | Passed after implementation; final rerun after the focused test additions passed. |
| `npm run typecheck` | Passed after implementation; final rerun generated route types successfully. It ran sequentially before build. |
| `npm test` | 42/42 across six files, including the new FormField label/hint/error association case. |
| `npm run build` | Production build passed with every existing route. |
| `npx playwright test tests/e2e/foundation.spec.ts tests/e2e/career.spec.ts --grep 'authenticated account persists|study totals, timer recovery'` | 4/4 desktop/mobile. Real Auth, theme restore, keyboard/reduced motion/axe, timer start/pause/resume/discard, offline failure and two-tab recovery passed. |
| `npx playwright test tests/e2e/insights.spec.ts tests/e2e/tracking.spec.ts --grep 'Insights shows bounded|owned habit and metric'` | 4/4 desktop/mobile. Shared ScorePanel and habit/metric logging retained values, privacy behavior, keyboard access, axe, and cleanup. |
| `npx playwright test tests/e2e/ui-refinement.spec.ts` | 6/6 desktop/mobile in its focused run. Dark/light Today and hub pages fit 360, 390, 768, 1024, and 1440 px; 1024 px used a 500 px desktop height. Running/paused timer states cleared mobile navigation and last Today content at every width. Keyboard Escape returned editor focus to its trigger. |
| `npx playwright test` | Full production browser regression passed 54/54 in 7.3 minutes across desktop/mobile, including the six new B–D cases and all existing feature, Auth, privacy, PWA, and data-control cases. No authenticated checks skipped. |
| Manual screenshot review | Inspected viewport captures for dark/light 360 px Today, dark 768 px Today, dark Track, light More, and running/paused 360 px plus running 1440 px timer. Generated captures remain ignored in `test-results/`. |
| `graphify update .` | Completed after implementation; the graph was refreshed again after the new tests. |
| `git diff --check` | Passed; no whitespace errors. |

The first browser run in the sandbox could not bind local port 3100 (`EPERM`); the authorized local-port retry succeeded. Early new UI test attempts used an ambiguous date/category selector during navigation and failed before layout assertions. The selectors were narrowed and the final full new test run passed 6/6; those failures did not identify an application regression. Next.js still logs occasional “destination stream closed early” when browser navigation aborts an in-flight response, with passing assertions.

The width/short-height checks emulate a compressed viewport and inspect safe-area-aware CSS; they do not prove behavior with a real software keyboard, device safe-area inset, landscape rotation, pinch zoom, or a screen reader. Those physical-device and assistive-technology checks remain for F/G and final QA. The dedicated account had scheduled habit/metric content but incomplete onboarding; setup stayed visible. The configured-phone first-action position is inferred from the rendered layout by omitting that setup card; a separate configured-account visual fixture remains useful in Phase F. A populated Recharts tooltip remains a Phase E/G visual check. The complete 54-case browser suite passed. After the full run, the matching development project and dedicated account were verified. Narrowly scoped cleanup removed two weekly and two monthly marked reviews, four carry receipts, six marked tasks, two goal milestones, two marked goals, fifteen discarded timers, eighteen archived synthetic study categories (including earlier focused runs), and two archived synthetic exercises. Subsequent owner-scoped queries found zero matching marked reviews, planning records, study categories/timers/sessions, exercises/workouts, or carry receipts; zero disposable Phase 8 test accounts remain. No unmarked personal records were targeted.

### UI/UX refinement Phases E–G — deferred validation, October 2, 2026

The user explicitly requested validation after the E/F/G code-only handoffs. All application source edits preceded this check run. During validation, browser assertions were updated to follow the refined labels/disclosures and reliable saved-state confirmation; no further application behavior, route, auth, query, action, scoring, dependency, or database-schema change was made. The source diff confirms domain, mutation, query, proxy, migration, and package files are untouched. Database/RLS and hosted advisor checks were not rerun for these presentation-only changes.

| Check | Actual result |
| --- | --- |
| `npm run lint` | Passed initially and after the final browser-test edits. |
| `npm run typecheck` | Passed initially and after the final browser-test edits. Type generation succeeded; typecheck and build ran sequentially. |
| `npm run test` | 42/42 cases across six files passed initially and on the final rerun. Includes scoring/source calculations and FormField associations. |
| `npm run build` | Passed; all existing production routes remain. Application source did not change after this build. |
| `npx playwright test tests/e2e/ui-refinement.spec.ts` | Initial expanded run: 8/10 passed; two new chart tests used ambiguous selectors during streamed navigation. Visible chart-region selectors corrected that. |
| `npx playwright test tests/e2e/ui-refinement.spec.ts --grep 'chart details\|populated weight\|phone keyboard'` | 4/6 passed: populated charts and keyboard contraction passed on desktop/mobile; the focus assertion needed to allow native Tab traversal through browser chrome before returning to the modal. The corrected keyboard/chart cases subsequently passed in the full run. |
| `npx playwright test` | Complete production regression: 59/62 passed in 10.9 minutes; no credential-dependent cases skipped. Two signup cases matched both a hint and identical error copy. One chart cleanup assertion waited for transient feedback after an RSC remount, although the first restored value had persisted. These were test-assertion failures, corrected below. |
| `npx playwright test tests/e2e/foundation.spec.ts tests/e2e/ui-refinement.spec.ts --grep 'server validation rejects\|populated weight\|running and paused\|phone keyboard'` | Final 8/8 desktop/mobile cases passed in 54.8 seconds. Includes every failed full-run case, persisted chart cleanup, 740×360 running/paused timer landscape, simulated keyboard response, and keyboard horizontal calendar scrolling. All 62 browser cases have passing evidence across the complete run and this rerun; a single 62/62 full run is not claimed. |
| Feature responsive/accessibility matrix | Passed on both browser projects: Fitness, workout library, Career, session history, Habits, Metrics, Tasks, Goals, Insights, Reflection, Settings, organization, tracking/privacy, and data controls at 360/390/768/1024/1440 px in dark/light themes. Desktop widths use 500 px height. No page-wide horizontal overflow; axe WCAG 2 A/AA and 2.1 AA scans pass at 390 px in both themes for all 14 routes. Visible phone inputs/selects/textareas measure at least 16 px text. |
| Keyboard/motion/editor checks | Exact dated score/weight lists open with Enter; focus outline is present; reduced-motion Button transitions compute to `0s`; the open habit editor passes axe, native focus wrapping and Escape/trigger return. Habit-grid arrow-key scrolling passes. The timer is a named non-live region; action feedback stays separate from ticking elapsed values. |
| Simulated keyboard viewport | At 390×844, an editing control plus visualViewport height contraction to 440 px hides the dock; the scrolling editor's Save action fits within the contracted viewport. Restoring the viewport clears the keyboard state. A long unsaved input remains editable. This models our resize response, not a real OS keyboard. |
| Populated chart verification | Two temporary body-weight values (71.25/72.5 kg) were entered through existing UI actions. Both-theme Recharts curves/tooltips and keyboard/touch date lists match those values on desktop/mobile. Originals are restored and confirmed after reload. The observation-only trend retains gaps and recorded-day averaging. Populated daily-score and workout-progression visuals were not separately seeded. |
| Computed final token contrast | Light/dark main text: 14.98:1/16.17:1; primary-button text: 5.58:1/7.43:1; selected text: 13.01:1/12.80:1. Reviewed success/warning/error surface text exceeds 4.5:1; chart labels on raised surfaces: 5.59:1/6.81:1. Control borders against page backgrounds: 3.23:1/4.05:1; focus rings: 5.21:1/7.71:1. These solid-token ratios supplement axe rather than establishing full accessibility conformance. |
| Visual review | Inspected dark 360 px Today, light 390 px Fitness/Insights, dark 390 px Habits, dark short 1440 px Career/Reflection, paused 360 px and running/paused 740×360 landscape timers, desktop dark/light populated chart/tooltips, mobile light populated chart, and contracted phone editors during the runs. Generated captures remain ignored under `test-results/`; later Playwright runs replace earlier run artifacts. |
| Graph refresh | `graphify update .` passed after source/test edits: 1,495 nodes, 3,761 edges, 82 communities. This is the required AST code refresh; the command explicitly does not refresh semantic document extraction. |
| Documentation/diff review | 80 local links across DESIGN, QA, ROADMAP, and UI_REFINEMENT_PLAN resolve; code fences are balanced. `git diff --check` passes. |

The first sandbox browser attempt failed to bind port 3100 (`EPERM`). The authorized local-port retry ran the real production server and configured confirmed test account. Existing Next.js “destination stream closed early” messages still occur when navigation aborts responses; passing browser assertions do not establish a clean staging console/network audit. Foundation assertions now target the specific password error, Fitness's water test uses its single visible input label, Career tests follow the timer's named region, and Reflection opens the optional ratings disclosure before editing. These preserve the original workflow assertions.

Fixture restoration and cleanup verified the same Supabase project URL and dedicated account. The transient chart-cleanup failure left one exact temporary 72.5 kg value; it was restored to its original empty state using the dedicated user's authenticated, revision-checked RPC before later tests. The final chart tests restore both dates through the UI and confirm them after reload. Post-run queries find zero chart measurements on those two originally empty dates. Narrow cleanup removed four matching carry receipts, six marked tasks, two milestones, two marked goals, two weekly and two monthly marked reviews, eight discarded timers, ten archived synthetic study categories, and two archived synthetic exercises. Final owner-scoped queries find zero matching planning/review/study/workout/exercise fixtures, and zero disposable Phase 8 accounts remain. Unmarked personal records were preserved.

**Gate result:** E is complete. F/G implementations and automated checks pass, but their full acceptance gates remain incomplete: physical iOS/Android keyboards, nonzero OS safe-area/rotation, browser/device zoom and configured/long-content device review, plus actual VoiceOver/TalkBack (or equivalent) traversal and timer announcements are unverified. Emulated viewport contraction, axe, ARIA inspection, and scripted keyboard tests do not establish those results. SMTP delivery, OS installation, staging, backup recovery, and deployment remain the separate Phase 9 release work.

### Component adoption rollback — October 2, 2026

At the user’s request, CA1–CA2 primitives, adapted compositions, and consuming-screen changes were removed. CA3–CA5 were never implemented; their proposal was withdrawn. Earlier A–G work and its historical verification records are preserved. No npm dependency was added by adoption, so no package uninstall is needed. No tests, lint, typecheck, build, or browser validation were run for this rollback.

Rollback recovery: after removing CA components, the still-running Webpack dev server reported a missing `patterns/disclosure.tsx` module despite no remaining source imports of removed components. Stopped that local dev process, removed only the generated `.next/dev` directory, and restarted `npm run dev` on port 3000; Next.js reported Ready. No production build, test suite, typecheck, or browser verification was run. If a component removal leaves stale module references during development, restart the dev server and clear its generated development cache before changing source to restore a removed component.

### Final QA for UI/UX refinement A–G after component-adoption rollback — October 2, 2026

The user explicitly requested final QA, superseding earlier check deferrals. CA1–CA2 remain reverted and CA3–CA5 remain cancelled. Existing uncommitted A–G changes were preserved. The Supabase MCP project reference was compared with the configured URL, and real dedicated-account sign-in succeeded; credentials were not printed. No application source, route, query, Server Action, scoring, schema, dependency, or auth behavior changed in this QA task.

| Command/review | Actual outcome |
| --- | --- |
| `npm run lint` | Passed before browser testing and after the Fitness test correction. |
| `npm run typecheck` | Passed before build and after the test correction. Typecheck/build were sequential. |
| `npm run test` | 42/42 tests in six files passed, including domain calculations and FormField associations. |
| `npm run build` | Passed with all existing production routes. No application source changed after this build. |
| `npx playwright test` | 60/62 passed in 11.3 minutes; no skipped cases. Both failures were desktop Fitness cleanup assertions; details below. |
| `npx playwright test tests/e2e/fitness.spec.ts` | Corrected focused rerun passed 4/4 desktop/mobile cases in 59.9 seconds. All 62 cases now have passing evidence across these runs; a single 62/62 full run is not claimed. |
| Responsive/themes | Today, Track/Plan/More, and 14 feature routes passed dark/light checks at 360/390/768/1024/1440 px on both projects. Short desktops use 500 px height; timers also cover 740×360 landscape. No accidental document overflow. |
| Keyboard/accessibility/motion | Feature-route axe WCAG 2 A/AA and 2.1 AA checks passed in both themes at 390 px. Phone control text measures at least 16 px. Keyboard chart disclosures, exact dated values, focus visibility, native modal wrapping/Escape/trigger return, habit-grid keyboard scrolling, and reduced-motion transitions passed. Persistent timer has no continuous live-region announcement semantics. |
| Timer and keyboard emulation | Running/paused timer docks clear navigation and last-page content. Simulated visualViewport contraction hides the phone dock and keeps editor Save reachable; restoring it clears keyboard state. These checks do not establish real OS keyboard/safe-area or screen-reader behavior. |
| Regressions | Real auth/session refresh, optimistic logging, shared source parity, concurrent water additions, workout copy/status, planning carry/reorder, Reflection/Insights parity, offline unsaved forms, privacy across client payloads/secondary UI, export/deletion on disposable accounts, and public-only PWA caching passed. |
| Visual review | Inspected current dark/light 360 px Today; running 360 px timer; dark/light feature phone layouts; short desktop Career/Reflection; desktop dark/light populated weight tooltips; mobile light populated weight tooltip; contracted keyboard editors on both projects; mobile 768 px Today; landscape paused timer; and light mobile Settings. Captures remain ignored under `test-results/`. |
| `graphify update .` | AST source-index refresh succeeded after test changes; no topology changes, outputs left untouched. This is source maintenance, not a test. |

The exercise archive failure snapshot showed its action still pending at the original five-second assertion limit. Subsequent narrowly scoped cleanup confirmed the synthetic exercise was archived. The assertion now allows 20 seconds, then reloads and confirms removal. The water cleanup snapshot already showed the restored blank value and “Saved: Not logged”; transient feedback had disappeared after revalidation. Its cleanup assertion now checks saved-state text and the original input value after reload. Both corrections are limited to `tests/e2e/fitness.spec.ts`; they retain concurrency/workout/source checks and strengthen persistence confirmation. Intermediate progress messages overstated passing counts because the log scan missed two earlier failures; the final command results above are authoritative.

The previously documented Next.js “destination stream closed early” messages recur during browser navigation. Passing assertions do not establish a clean staging console/network audit. SQL/RLS/advisor checks were not rerun: this task changes presentation-test assertions and documentation only, without database or authorization changes.

**Remaining gates:** Actual iOS/Android keyboards, nonzero OS safe areas, rotation/device zoom and configured/long-content device review, plus actual VoiceOver/TalkBack traversal and timer announcement cadence remain unverified. F/G remain open. No physical-device or screen-reader result is inferred from Chromium emulation or axe. Product Phase 9, SMTP delivery, staging/deployment, OS installation, and backup recovery remain separate work.

Fixture cleanup after both browser runs used the verified development project and exact dedicated owner, current-run creation bounds, fixed review periods/marker text, UUID-shaped synthetic names, archived/discarded state, and child-first relationships. Removed four carry receipts, six marked tasks, two milestones, two marked goals, two weekly/two monthly marked reviews (pre-run snapshot confirmed those periods empty), four discarded timers, six archived synthetic study categories, and four archived synthetic exercises across the full run and focused rerun. Each deleted ID was queried to confirm absence. UI tests restored weight values and confirmed persistence; the corrected water test confirms its original value after reload. Zero disposable Phase 8 accounts remain. Unmarked personal records were not targeted. `git diff --check` passed; documentation fences and local links passed after decoding URL-escaped route-group paths in the link checker.
