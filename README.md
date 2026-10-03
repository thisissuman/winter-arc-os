# Winter Arc OS

A private habit app you can use in under a minute: open Today, check off your habits, and leave. Three sections: Today, Habits, Settings. Built with Next.js, React, Tailwind, Supabase, Zod, Geist, Lucide, and small local primitives.

The user approved the simple product and all five [desktop/phone design boards](docs/DESIGN_REVIEW.md) October 3, 2026. The replacement is implemented and verified in development; [QA](docs/QA.md) records actual outcomes. No deployment, push, or merge is included. The old roadmap/specification and verification history remain [archived](docs/history/2026-10-03-pre-simplification/README.md).

## Documentation

- [PRODUCT](PRODUCT.md): accepted behavior and exclusions.
- [Architecture](docs/ARCHITECTURE.md): routes, five tables, authentication and security.
- [History rules](docs/SCORING.md): dated schedules, corrections, closed-week counts.
- [DESIGN](DESIGN.md): approved compositions and implemented conventions.
- [Roadmap](docs/ROADMAP.md) and [QA](docs/QA.md): delivery gates and evidence.
- [Cleanup/reset](docs/SIMPLIFICATION.md): retirement inventory and verified development scope.
- [AGENTS](AGENTS.md): durable operating instructions.
- [Original specification](docs/MASTER_SPEC.md): unchanged historical reference.

## Install and run

Use Node.js 22.15 or newer within version 22 (`.nvmrc`) and npm. The lockfile pins the actual versions.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set the project's public Supabase URL/key and `APP_ORIGIN=http://localhost:3000`. Apply the full migration chain to that same project first. New accounts begin empty; no onboarding or starter package. Daily habit creation requires only a name. Selected days are optional. History and the editor live inside Habits; data controls live inside Settings.

| Variable | Meaning |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Supabase API URL |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Public key, never an administrative key |
| APP_ORIGIN | Trusted origin for Auth callbacks and account deletion |
| SUPABASE_SECRET_KEY | Server-only same-project key, used for verified self-account deletion and disposable development test accounts |
| SUPABASE_URL | Optional server URL; must equal the public URL |
| E2E_AUTH_EMAIL / E2E_AUTH_PASSWORD | Dedicated confirmed account for login/refresh regression tests |

Keep `.env.local`, exports, credentials and browser traces out of Git. No secret uses a NEXT_PUBLIC prefix. Ordinary product queries and mutations use the caller's identity. Account deletion visibly remains unavailable without the server key.

## Commands

| Command | Meaning |
| --- | --- |
| npm ci | Reproduce the locked clean installation |
| npm run dev | Development server on port 3000 |
| npm run lint | ESLint checks |
| npm run typecheck | Generate route declarations and check TypeScript |
| npm run test | Auth validation, habit/history/calendar and accessible field unit tests |
| npm run test:db | Replay all historical SQL plus the forward migrations in isolated PGlite PostgreSQL; verify catalog, RLS, constraints, conflicts, export and deletion |
| npm run test:e2e | Build production and run actual Auth desktop/mobile browser checks on port 3100 |
| npm run build | Production compilation |
| npm run start | Serve the existing production build |
| npm run db:start | Full local Supabase stack; requires Docker-compatible runtime |
| npm run db:reset | Reset disposable local Supabase from migrations; destroys local data only |

Run typecheck and build sequentially; both write `.next/types`. After route retirement, remove stale generated `.next` files once before typecheck. Local fonts and explicit Webpack keep builds reproducible. ESLint uses `@eslint/compat`; the bundled plugins report older peer ranges, while the standard locked installation/lint pass. Vite 8.3.1, formerly supplied indirectly through shadcn, is now an explicit Vitest development dependency. No legacy-peer flag is needed for npm ci.

## Database workflow

There are exactly five public application tables: profiles, user_preferences, habits, habit_schedules, habit_logs. Writes to the habit tables use owned RPCs; ordinary clients cannot directly overwrite dates, revisions or history. Definition edits and archive cutoffs begin tomorrow; past scheduled corrections remain available. Completion sends a desired boolean and expected revision; false undo rows retain the revision.

Preserve all 14 historical migration files. The replacement is `20261003090000_simple_habits.sql`; `20261003103000_habit_conflict_response.sql` repairs business-conflict responses without rewriting the applied reset. The reviewed development project is `trdizdsjivorkffjjywe`; its configured URL/catalog/ledger and exact affected counts are recorded in SIMPLIFICATION. The fresh start deliberately discards all product history and retains Auth/profile/essential preferences. Never use a remote reset. Schema deployment requires an explicitly matching authorized target, local validation, stopped incompatible builds, and complete type regeneration afterward.

Use the project CLI for read-only preflight, SQL application, type generation and advisors. When executing a migration through `db query`, record its version/name/statements in the migration ledger **in the same transaction**; do not leave an unrecorded application for a later push to repeat. CLI queries can use `--linked --project-ref` even without a local link file; type generation uses `--project-id`. Keep application/cutover commands in repository scripts where repeated.

`supabase/tests/hosted-tracking.sql` is the consolidated rollback-only ownership/export/deletion fixture. `test:db` validates it locally before the authorized development SQL run. PGlite supplies test-only Auth roles and tables; it does not verify GoTrue, email, PostgREST or a full container stack. No fixture setup belongs in deployed migrations.

## Browser verification

Install Chromium once with `npx playwright install chromium`. Supply dedicated confirmed-account credentials for the foundation refresh test and the same development server key for disposable habit/settings/privacy/PWA tests. Fixtures are pinned to the development hostname, create real confirmed accounts, and delete them in finally. Never use a personal account for deletion. For an interrupted run, `node scripts/cleanup-browser-fixtures.mjs <ISO-timestamp>` inspects only marked disposable accounts created since that time in the pinned development project; append `--apply` to remove them through Auth. Run only after the test runner stops. Password-verification traces are disabled; other traces stay ignored. Foundation restores profile/theme through owner-scoped requests.

The refresh test expires cookie metadata while preserving real issued credentials, then checks actual refresh-token rotation. It does not fabricate a JWT or claim signed-JWT expiration coverage. Emulation/axe do not establish physical-device or actual screen-reader checks.

## Auth and email setup

Keep `src/proxy.ts` cookie refresh, independent page/action identity checks, private/no-store headers, validated APP_ORIGIN and local redirect allowlists. Callback no-referrer is configured globally as well as in its handler. Auth confirmation supports token hashes and provider-default PKCE codes; PKCE links must open in the browser that initiated the request.

Hosted Auth configuration is separate from migrations/local config. The verified development Site URL is `http://localhost:3000` with exact confirmation/recovery callbacks and default provider templates. Before production, configure [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) and test signup/confirmation/recovery against a real inbox. Current email delivery remains **explicitly unverified**. Manual confirmation of a disposable account verifies login, not SMTP. The free dashboard restricts custom templates without SMTP; repository confirmation/recovery templates can be applied after SMTP setup. Do not print passwords or email links.

## Data and offline controls

Settings exports private format-version-2 JSON containing the five complete owned tables, including original names while Privacy Mode is enabled. Export aggregation has no REST page limit. There is no import/restore interface. Clearing habit data verifies the current password and DELETE MY DATA; Auth/profile/preferences survive. Account deletion verifies the current password and DELETE MY ACCOUNT in the same-origin request, deletes only the caller, runs transactional database cleanup, and clears session cookies. Arbitrary target IDs are rejected.

The manifest/icons support installation on HTTPS/localhost. Offer the install button only when the browser supplies a real prompt. The service worker caches only the public offline document and three icons; never cache private routes, Auth, API, RSC, export or mutations. Offline saves are not queued. Controlled fields retain unsaved Settings input on failure. Bump the worker cache version when public offline assets change.

## Git and release

Use feature/* branches and reviewed pull requests into master; preserve unrelated work. Origin is [winter-arc-os](https://github.com/thisissuman/winter-arc-os). No push, merge, Vercel configuration or deployment is included. Production requires separate environment/project settings, SMTP testing, remaining device/accessibility checks and provider backup/recovery rehearsal. The development fresh start has no old-history import.
