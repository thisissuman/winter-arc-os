# Verification strategy and results

## Truthful status

Phases 0–3 are complete in the configured development project. Phase 3 fitness migrations, local and hosted database checks, domain tests, production build, and dedicated-account desktop/mobile browser checks pass; exact evidence is below. Signup/confirmation/recovery email verification remains deferred until SMTP setup before production. Full local Supabase container replay and staging/production release checks remain open.

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
