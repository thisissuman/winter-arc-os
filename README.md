# Winter Arc OS

A personal performance application for habits, fitness, career preparation, planning, and reflection. Built incrementally with Next.js and Supabase.

## Current delivery

**Phases 1–4 are implemented in the configured development project.** Phase 4 adds study categories, manual sessions, a recoverable single-active focus timer, split-day study totals, and career summaries. Earlier challenges, habits, metrics, scores, and fitness remain available. The Career migration is applied and hosted types are regenerated. See [ROADMAP](docs/ROADMAP.md) and [QA](docs/QA.md) for exact verification and release gates.

The MCP URL matches `.env.local`. The confirmed test account supports real login, session refresh, and browser checks. Hosted RLS scripts use rollback-only fixtures; Career browser flows cover manual sessions and timer recovery across pages/tabs. The user deferred signup/confirmation/recovery email delivery tests until custom SMTP is configured before production. The supplied confirmed test account uses an example-domain address.

## Documentation

| Source of truth | Contents |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Operating rules and phase workflow |
| [PRODUCT.md](PRODUCT.md) | Requirements, terminology, defaults, exclusions |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Boundaries, schema, routes, security, decisions |
| [SCORING.md](docs/SCORING.md) | Schedules, formulas, streaks, examples |
| [DESIGN.md](DESIGN.md) | Implemented tokens and interface conventions |
| [ROADMAP.md](docs/ROADMAP.md) | Phase checklists and acceptance gates |
| [QA.md](docs/QA.md) | Test strategy and verified results |
| [MASTER_SPEC.md](docs/MASTER_SPEC.md) | Unchanged historical specification |

## Install and run

Use Node.js 22.15 or newer within version 22 (`.nvmrc`) and npm. The committed lockfile fixes the actual dependency versions.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Before starting, replace the example Supabase URL/public key and set `APP_ORIGIN` to `http://localhost:3000`. Open that address after starting the server. Apply the foundation migration to the same project first; auth alone cannot supply the missing application tables. Missing credentials disable submission with a setup notice.

Apply all migrations in `supabase/migrations` to the same project before using tracking pages. The hosted development project has the Phase 2–4 versions listed below; local filenames match its ledger. An empty account can use personal tracking immediately, opt into full starters during onboarding, or set up fitness/Career definitions from their pages.

| Environment variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Local or hosted project's API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (or legacy anon key); never an administrative key |
| `APP_ORIGIN` | Trusted application origin for confirmation/recovery links |
| `E2E_AUTH_EMAIL`, `E2E_AUTH_PASSWORD` | Optional dedicated confirmed test-account credentials; enable hosted browser tests |

Keep `.env.local` out of Git. Never paste credentials into documentation or chat. Account deletion and its server-only administrative key arrive in Phase 8.

## Commands

| Command | Meaning |
| --- | --- |
| `npm ci` | Reproduce the locked dependency installation |
| `npm run dev` | Start Next.js development on port 3000 |
| `npm run lint` | Check code with ESLint |
| `npm run typecheck` | Generate route declarations and check TypeScript |
| `npm run test` | Run auth, tracking, fitness, and study-domain unit tests |
| `npm run test:db` | Replay migrations in isolated PostgreSQL and verify RLS/constraints; no Docker or remote changes |
| `npm run test:e2e` | Build production, start port 3100, and run desktop/mobile browser tests |
| `npm run build` | Compile a production application |
| `npm run start` | Serve an existing production build |
| `npm run db:start` | Start the local Supabase stack; requires a running Docker-compatible runtime |
| `npm run db:reset` | Rebuild the disposable local Supabase database from migrations; erases local data |

Run `npm run typecheck` and `npm run build` one after the other; both write generated files under `.next/types`, so running them at the same time can cause a false missing-file error.

Install Playwright's browser once with `npx playwright install chromium`. Browser tests skip authenticated flows unless dedicated test credentials are supplied. They do not mock Supabase or manufacture successful authentication.

The application uses Next.js 16.3.8, React 19.2.8, Tailwind 4, shadcn/ui, Lucide, Geist, Zod, Supabase SSR, and Recharts 3.10.1 for bounded fitness charts. React Hook Form remains optional for later complex forms. Fonts ship locally, so builds do not fetch Google Fonts.

Webpack is selected explicitly for development/build because the available environment rejected Turbopack's process/port initialization. ESLint 10 uses the official `@eslint/compat` adapter for bundled Next.js plugins. npm reports their older peer ranges; the locked installation and actual lint checks succeed without legacy-peer installation flags. Re-evaluate this compatibility bridge when updating Next.js/plugins.

## Local Supabase

Configuration already exists in `supabase/config.toml`; do not reinitialize it. The CLI is a locked project development dependency.

```sh
npm run db:start
npx supabase status
npm run db:reset
```

Copy the local API URL and **public** key into `.env.local`; do not publish the full status output. Inspect the local inbox URL reported by the CLI to test confirmation/recovery emails. Local config enables email confirmation, minimum 12-character passwords, and the committed email templates. Starter definitions are applied only when a user opts in during onboarding.

The isolated `test:db` runner executes real PostgreSQL through PGlite and supplies minimal test-only `auth.users`, roles, and `auth.uid()`. It verifies SQL/RLS without a container, but it does not run GoTrue, PostgREST, email delivery, or a full Supabase reset. Full local-stack checks remain unverified on this machine because no Docker daemon is running.

## Migrations and generated types

Add incremental SQL under `supabase/migrations`, using `npx supabase migration new <name>`. Never edit a migration after deploying it. The foundation creates account/organization tables; Phase 2 adds core tracking; Phase 3 adds fitness; Phase 4 adds study sessions and the persisted timer. Applied versions are `20260930180649_foundation`, `20260930181434_categories_parent_index`, `20261001004511_core_tracking`, `20261001004734_score_items_policy_category_index`, `20261001044053_fitness`, `20261001044323_fitness_owner_indexes`, `20261001044532_workout_edit_fix`, `20261001050228_workout_payload_guard`, and `20261001052104_career`. Local filenames match the hosted ledger.

Regenerate complete public database types after schema changes with Supabase's generator. With a full local stack:

```sh
npx supabase gen types typescript --local --schema public > src/types/database.ts
```

`src/types/database.ts` was regenerated through the matching hosted MCP after Phase 4 deployment. The old isolated generator was removed because it could overwrite complete types with an incomplete schema. Review generated types with every migration. Hosted MCP regeneration is the verified path when a local Docker-compatible runtime is unavailable.

## Hosted configuration

1. Choose a development/test project. Ensure its URL matches `.env.local` and any connected MCP before inspecting or changing schema. A connection configured with `read_only=true` supports inspection but cannot apply migrations; enable write access only for the intended development project before deployment.
2. Inspect existing tables and migration history. Apply the tested foundation SQL using the authorized MCP migration tool, or link the CLI with `npx supabase link --project-ref <reference>` and deploy using `npx supabase db push`.
3. When MCP assigns a migration timestamp, align the local migration filename with its recorded version to prevent a later CLI push from replaying it.
4. Configure Supabase Auth Site URL to `APP_ORIGIN`, enable email confirmations, and add the application confirmation URL to allowed redirects. Configure production-like email delivery independently.
5. With custom SMTP configured, copy `supabase/templates/confirmation.html` and `recovery.html` into hosted Auth email templates for direct token-hash verification. The current free dashboard locks template editing without SMTP. Default templates can instead use the existing SSR PKCE flow: `/auth/confirm` exchanges the returned `code` using the verifier cookie. Open the email link in the same browser/device that requested it; another browser cannot supply that verifier. See the [PKCE flow guide](https://supabase.com/docs/guides/auth/sessions/pkce-flow).
6. Create a dedicated account in Supabase Auth → Users and confirm its email. Add `E2E_AUTH_EMAIL` and `E2E_AUTH_PASSWORD` to ignored `.env.local`, then run `npm run test:e2e`. This exercises real login, reload persistence, refresh-token rotation, settings, theme changes, keyboard access, and logout. Use a test account because these checks temporarily change its name/theme; ordinary owner-scoped API cleanup restores both in `finally` even on assertion failure. Traces can contain test credentials and remain ignored; never publish them.
7. Separately exercise signup and confirmation/recovery emails against a real inbox. The default email service sends only to pre-authorized organization team addresses and has restrictive limits; configure [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) for other recipients. A manually confirmed example-domain test account establishes login, not email delivery. After resetting a dedicated fixture password, update its ignored E2E password locally before rerunning tests. Never send passwords or email links in chat.

Hosted PostgreSQL isolation is verified by `supabase/tests/hosted-foundation.sql`, `supabase/tests/hosted-tracking.sql`, and `supabase/tests/hosted-fitness.sql`. Validate them locally with `npm run test:db` before executing through the authorized development-project MCP. All use temporary fixtures in rollback-only transactions. They do not create a usable Auth API test account or send email.

The current hosted Site URL is `http://localhost:3000`. Exact allowed callbacks are `http://localhost:3000/auth/confirm` and `http://localhost:3000/auth/confirm?next=/reset-password`; no wildcard was added. Hosted templates remain the provider defaults. These are development settings, not a deployed release.

The browser refresh test changes only cookie `expires_at` metadata to a past value, preserving server-issued tokens, then verifies a real Auth refresh and rotated refresh token. It does not wait for or manufacture an expired signed JWT.

Local `config.toml` does not automatically configure hosted Auth settings. MCP migration deployment does not change email templates or redirect allowlists. Do not reset a hosted project to test migrations. Follow the [Supabase migration workflow](https://supabase.com/docs/guides/local-development/database-migrations); the historical `supabase db commit` example is superseded.

## Repository branches

[`master`](https://github.com/thisissuman/winter-arc-os/tree/master) is the default integration branch and contains the complete Phase 0–4 commit history. The `feature/phase-0-docs`, `feature/phase-1-foundation`, `feature/phase-2-core-tracking`, `feature/phase-3-fitness`, and `feature/phase-4-career` branches mark the verified phase checkpoints. Each later branch includes earlier commits; they are not separate copies of the app. Create future work on `feature/` branches and merge through a reviewed pull request. This branch organization is not a production release.

## Vercel and recovery

The Git remote is [`origin`](https://github.com/thisissuman/winter-arc-os). No Vercel deployment has been configured. For an authorized release, use separate staging/production projects and environment values, apply tested migrations, configure Auth/email URLs for the deployed origin, then run the [release checklist](docs/QA.md). Preview deployments must not share production personal data.

For a migration failure, stop subsequent deployment, inspect migration history, and correct the schema with an incremental repair migration. Do not rewrite an already-applied file or use remote reset. Confirm provider backup/PITR availability and rehearse restoration on a separate project before release; actual recovery identifiers belong in QA when configured.

## Later features

Fitness, career, planning, insights, and reflection follow their bounded phases. Phase 8 adds an installable PWA with a public offline shell; private pages/API responses will not be cached, and offline writes remain unavailable.
