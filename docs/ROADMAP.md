# Winter Arc OS — simple habit delivery

## Active direction

Accepted October 3, 2026. Replace the broader performance product with Today, Habits, Settings. The old phases 0–8 and UI refinement history are [archived](history/2026-10-03-pre-simplification/docs/ROADMAP.md); their completed gates do not describe progress on this replacement.

Overall implementation is authorized. The user's plan explicitly puts **“Create and approve new section images”** before **“Simplify the foundation.”** That checkpoint closed October 3, 2026; all implementation steps are now delivered. Do not ask repeatedly within authorized implementation work.

Current status: **Steps 1–6 delivered and verified in development**. Designs approved October 3, 2026; development reset and forward conflict repair are applied. Local and hosted checks pass; all 26 authenticated desktop/mobile browser checks pass. Physical-device/screen-reader and SMTP release gates remain unverified.

## Step 1 — Product decision and cleanup inventory

- [x] Record accepted simple-habit contract in PRODUCT.
- [x] Record target architecture, binary history rules, and design direction.
- [x] Preserve original specification and historical canonical documents/QA.
- [x] Inventory the five retained/rebuilt tables and 31 retirement candidates, routines, feature routes/modules, tests, and packages.
- [x] Update operating memory so future work doesn't resume the broader feature phases.

Validation: inspect canonical links, manifest paths/counts, historical snapshot equality, image metadata, and the Git diff. Local baseline commands verify that documentation-only work hasn't broken the existing app; they do not close replacement behavior gates.

## Step 2 — New UI proposals and approval

- [x] Generate desktop/phone boards for Today, Habits, its History and Editor states, and Settings.
- [x] Mark old Today/Habits concepts as superseded, preserve them, and save the new prompt set.
- [x] Inspect new boards for three-section navigation, small routine setup, no removed tracking concepts, and truthful proposal status.
- [x] Obtain explicit user approval or requested corrections.
- [x] Record approved filenames/date in DESIGN_REVIEW and DESIGN.

Hand off concrete boards for review. No DB reset, deletion, dependency removal, or replacement UI code before this gate closes. Dark concepts define direction; light-theme and edge states require implementation verification.

## Step 3 — Simplified foundation and coordinated cleanup

Dependency: approved image set.

- [x] On a feature/* branch, prepare replacement schema migration, focused reads/actions/types, shell, privacy, data routines, dependency cleanup, and necessary tests together.
- [x] Replay historical migrations plus the forward migration in disposable local PostgreSQL. Do not delete or rewrite applied SQL.
- [x] Validate the five-table catalog, retired routine absence, constraints/RLS, same-owner children, archive/history dates, desired-state saves, conflicts, and privacy boundary.
- [x] Remove retired routes/modules, timer shell queries, broad tracking snapshot, score/configuration helpers, old stylesheet imports, and unused assets/configuration.
- [x] Remove Recharts, direct react-is, shadcn CLI package, and tw-animate-css with corresponding consumer/style changes; refresh lockfile and verify npm ci.
- [x] Verify hosted project/local configuration match, live migration/catalog/affected records, and the reviewed development reset scope.
- [x] Stop incompatible running processes, apply the development migration, preserve Auth/profile/preferences, regenerate full matching types, and run rollback-only hosted security/advisor checks.
- [x] Run required local checks and foundation/authenticated browser checks. No production deployment.

Today/Habits/Settings remain valid destinations during sequential implementation; don't expose inert buttons or claim unfinished feature behavior. Avoid starting any app build that queries retired tables after schema application.

## Step 4 — Today

- [x] Deliver approved checklist/date/count layout and one-tap complete/undo.
- [x] Handle first habit, no due habits, all done, history dates, pending/error/conflict/offline states, privacy, and keyboard use.
- [x] Verify desktop/mobile/both themes, real authenticated persistence/retries, relevant unit/DB checks, lint/typecheck/build.
- [x] Record results before moving on.

## Step 5 — Habits

- [x] Deliver creation/editing, daily/selected weekdays, Active/Archived routines, archive, confirmed permanent deletion.
- [x] Deliver one-habit calendar/history correction and all-habit closed-week consistency.
- [x] Verify prospective schedule changes, repeated tomorrow edits, past corrections, archived history, unscheduled/future date denial, calendar keyboard/touch behavior, privacy, and modal focus.
- [x] Run required checks and record results before moving on.

## Step 6 — Settings and final cleanup

- [x] Deliver profile/theme/timezone/week-start/privacy, private format-v2 export, data clearing and verified account deletion.
- [x] Verify two-account isolation, catalog allowlists, complete exports, transactional deletion, retained preferences, and offline settings preservation.
- [x] Finish dead-reference/asset/style/test cleanup and graphify update after code changes.
- [x] Run npm ci, lint, typecheck, unit/DB tests, production build, and the complete real-auth desktop/mobile suite.
- [x] Review light/dark, keyboard/accessibility, privacy, reduced motion, responsive editors, and public offline-cache boundaries.
- [x] Record physical-device and screen-reader checks as unverified; emulation and automated accessibility passed.
- [ ] Restore signup/recovery email delivery gates once SMTP is configured before production.

## Final product acceptance

Only Today/Habits/Settings navigation; new daily habit requires only name; completion is one tap; no quantities/scores/quotas/timers/challenges; truthful dated history and errors; five public tables and no retired callable routines; cross-owner security; complete private data controls; passing recorded local/hosted/browser checks.

No push, merge, or deployment is included. Any release work requires separate authorization; this product does not resume old Phase 9.
