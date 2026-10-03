# Winter Arc OS — simple habit verification

## Truthful status

October 3, 2026: all five design boards approved. Replacement schema/code/routes/packages/tests are implemented and verified in development; final real-auth desktop/mobile browser and visual review passed. The configured development reset committed and full types were regenerated from that project. No deployment/push/merge.

The old app's full verification record is preserved [here](history/2026-10-03-pre-simplification/docs/QA.md). Its 42 unit cases and 62-case UI evidence describe the old application, not this target. SMTP signup/confirmation/recovery delivery, actual devices/screen readers, full local container replay, and release/deployment checks were not established by that history.

## Step 1–2 verification record — October 3, 2026

- Graphify query scoped current feature dependencies; source inspection confirmed Habits' broad TrackingSnapshot, shell focus-timer query, 33-table product export, 36-table public migration catalog, and dependency/style consumers.
- Inventory is based on committed local migration/source files, not a live hosted catalog audit. It records five retained/rebuilt public tables and 31 retirement candidates.
- Historical documents were copied before replacement; the original MASTER_SPEC and applied migrations remain unchanged.
- Today, Habits, History, Editor, Settings boards use illustrative data and exactly three navigation destinations. They are static raster proposals, not working application screenshots.
- Settings privacy helper was corrected to avoid a device-only scope claim. History and Today illustrate different interaction moments; sample values are not synchronized fixtures.
- Artifact/document checks and baseline local-check outcomes are recorded after execution below. No authenticated browser or hosted mutation check is claimed for the new app.

## Required replacement checks

| Area | Scenarios |
| --- | --- |
| Habit definition | Name-only daily setup, selected days, invalid/empty/duplicate weekdays, long names, no starter data |
| Dates/history | Leap/month/week boundaries, start today, tomorrow-only edits, repeated pending edits, archive cutoff, correction, no timezone re-dating |
| Completion | Desired boolean, undo, no duplicate rows, same-state retry, stale conflict, loading/failure/offline remains unsaved |
| Calendar/counts | Five states, future/unscheduled write denial, no-due/empty/all-done, closed-week numerator/denominator, today excluded, archived history |
| Auth | Existing login/logout/refresh, protected routes, safe redirects, token-hash/PKCE callback security |
| Ownership | Anonymous denial, two real owners, child FK isolation, read/write/update/delete ownership, RPC grants/search paths |
| Catalog | Exactly five public application tables, retired callable routines absent, retained FK indexes, matching full generated types |
| Data controls | Five-table export allowlist/completeness, >1000 logs without REST truncation, private/no-store, data clear retains account/prefs, verified self-deletion, other owner untouched |
| Privacy | No original habit names in server HTML, client payload, attributes, accessibility, errors or editors; editing disabled under masking |
| UI | Three links, responsive layouts, light/dark, long labels, keyboard/focus/dialog return, 44 px targets, reduced motion, loading/errors |
| Public offline | Only public offline document/icons cached; no private/Auth/API/RSC/export data; controlled Settings survives unsaved offline failures |

Don't weaken identity/ownership tests when removing unused feature assertions. Delete retired-only suites after replacement coverage exists; rewrite mixed suites and fixtures for the five-table catalog.

## Commands and evidence

README lists actual scripts. Run npm run lint, npm run typecheck, relevant Vitest checks, npm run test:db, and npm run build before application handoffs. Typecheck and build must be sequential because both write .next/types. npm ci verifies the changed lockfile. npm run test:e2e builds/serves production on port 3100 and must use real dedicated accounts.

PGlite tests replay all historical migrations and the new forward migration with test-only Auth/roles; they do not establish hosted Auth, email, or a full Supabase container stack. Hosted rollback-only fixtures require matching project verification and local validation first. Account-deletion browser checks use disposable development accounts, never a personal account; traces containing passwords remain disabled/ignored.

For the documentation/image gate, baseline local checks can establish only that the untouched old source still compiles/tests. They cannot be recorded as simple-habit acceptance.

## Baseline and artifact results

- Active documentation links and historical preservation: PASS, 56 relative links checked and all ten archived documents byte-identical to their original tracked contents. The original MASTER_SPEC and all applied migrations are unchanged.
- Inventory/artifacts: PASS, 36 local public tables partitioned into five retained/rebuilt tables and 31 retirement candidates; all listed source/test/migration paths exist; five valid 1536 × 1024 PNG boards saved and inspected.
- npm run lint: PASS.
- npm run typecheck: PASS.
- npm run test: PASS, 6 files / 42 cases.
- npm run test:db: PASS, 14 files / 106 cases against the unchanged historical schema.
- npm run build: PASS, optimized production compilation and route generation succeeded. Typecheck completed before the build began.
- No code/schema/package/test removal, hosted schema mutation, or new authenticated browser test was performed. Current-app results above are baseline evidence only; simple-habit implementation gates remain open.

## Gate status

- [x] Explicit image approval.
- [x] Replacement implementation and full local migration replay.
- [x] Matching development project/live catalog/reset inspection.
- [x] Target hosted schema, full generated types, rollback security and advisors.
- [x] Full real-auth desktop/mobile/both-theme browser tests.
- [ ] Actual-device and actual-screen-reader checks where available.
- [ ] SMTP signup/confirmation/recovery delivery before production.
- [ ] Any staging/production configuration or release work separately authorized.

## Replacement foundation evidence — October 3, 2026

- Standard npm ci succeeds after retiring Recharts/direct react-is/shadcn/tw-animate-css; Vite 8.3.1 is explicit for the retained Vitest peer. Existing ESLint plugin peer warnings remain; 5 high audit findings are unchanged release checks, not remediated by this scoped dependency removal.
- Lint, sequential typecheck/production build pass. Production route manifest contains Today, Habits, Settings plus retained Auth/data interfaces; retired modules/routes no longer compile.
- 3 unit files / 22 cases pass; 4 DB files / 23 cases pass after replaying all 14 immutable migrations plus both forward migrations. Owned natural-key retries, stale conflicts, prospective/repeated edits, past archived corrections, cross-owner reads/mutations/FKs, archive/deletion, 1200-log export, retained preferences and transactional account cleanup are covered.
- Explicit development ref trdizdsjivorkffjjywe matches configured hostname; live migration signatures/ledger matched before cutover. Reviewed 89 product rows discarded; account-preservation fingerprints checked in the migration transaction. No listeners on 3000/3100 before reset.
- Hosted forward migration version 20261003090000 recorded transactionally, catalog confirms exactly five tables/six intended public RPCs and ledger 15. One Auth account/profile/preferences row retained; habit history empty after reset. Historical migration files unchanged.
- Full public database types generated by Supabase CLI from the matching project, replacing the provisional preparation contract.
- Hosted rollback-only security fixture passes and leaves accounts/data unchanged. All advisors ran: no unindexed-FK/performance warnings; six intentional signed-in SECURITY DEFINER RPC notices (fixed empty search paths, caller identity and ownership/revision enforcement) and existing disabled leaked-password-protection warning remain documented. No Auth configuration was changed.
- Real-auth browser and screenshot review passed; device/screen-reader and SMTP gates remain unverified.

## Browser findings and fixes

The first 26-case pass had 24 successes and two editor-focus failures. The native-dialog focus fix exposed an RPC integration issue: PostgREST retried business conflicts raised as SQLSTATE 40001. Forward migration 20261003103000 returns PT409 (HTTP409) instead; same-state retries still succeed. See [provider troubleshooting](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b) and [PostgREST custom statuses](https://postgrest.org/en/v14/references/errors.html). Full local migration tests pass after the repair; generated types are byte-identical because signatures did not change.

Finishing review from the approved comps led to a single compact Preferences save, quiet Today add action, 8px controls, a framed calendar with visible habit/month/date labels, Selected week copy for other weeks, and a full-width phone routine-creation action. A later test pass exposed a stale Settings success message and visually clipped checkbox click targets; pending feedback now hides the previous result and weekday inputs cover their 44px labels. Interrupted fixture runs left two marked test accounts when resetting a closed browser context threw; they were removed through the bounded development Auth cleanup script. finally now always reaches account cleanup. These failures are retained as findings, not passed results.

Final Graphify AST update refreshed 1117 nodes/1876 edges/73 communities with no LLM extraction cost. Historical labels remain where community structure permits; automatic hub names replace changed communities. No semantic regeneration of archived docs/design images was claimed.

## Final development verification — October 3, 2026

- Complete production browser suite: **PASS, 26/26 checks** across desktop and iPhone-sized Chromium views, using real authentication. Both themes, keyboard/modal focus, automated accessibility, overflow/touch targets, private preferences/export/data clearing/self-deletion, real session refresh, completion/undo/revision conflicts, offline failure feedback and retired-route 404 checks pass.
- Hosted rollback-only two-owner fixture: **PASS** after both migrations. Conflict response repair is recorded as version 20261003103000; the ledger contains 16 applied versions. Generated full types remained byte-identical after the signature-preserving repair.
- Final disposable-account inspection: **PASS, zero matching accounts** after the suite; cleanup inspection was not run concurrently with tests. Final catalog counts: five public tables, six public routines, 16 migrations, one Auth account/profile/preferences row, zero habits.
- Finishing design review and source-derived design documentation completed against the five approved boards. Browser screenshots live in ignored test-results; password traces are not published.
- No deployment, push or merge. Physical-device/manual screen-reader checks, full local Docker Supabase stack, SMTP signup/recovery email delivery and release configuration remain unverified. Existing dependency audit and Auth advisor findings remain release checks.

Final artifact audit: all ten historical canonical documents are byte-identical to their tracked originals, historical applied migrations and MASTER_SPEC are unchanged, all 52 current canonical relative links resolve, inventory/design JSON validates, and git diff --check passes.
