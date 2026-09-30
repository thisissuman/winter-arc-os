# Winter Arc OS

A personal operating system for habits, fitness, interview preparation, planning, and reflection. It is built around fast daily logging, reusable challenges, and explainable performance measurements.

## Current delivery

**Phase 0: project documentation.** This repository is not runnable yet. The application, database migrations, dependencies, `.env.example`, and automated test tooling will be created in Phase 1. No user performance data has been generated.

Start with the [phase checklist](docs/ROADMAP.md). For implementation rules, read [AGENTS.md](AGENTS.md).

## Documentation

| Source of truth | Contents |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Requirements, terminology, editable defaults, exclusions |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture, schema, routes, components, security, decisions |
| [SCORING.md](docs/SCORING.md) | Date/schedule rules, formulas, streaks, examples |
| [DESIGN.md](DESIGN.md) | Approved UI direction and implementation recording rules |
| [ROADMAP.md](docs/ROADMAP.md) | Bounded phases and acceptance gates |
| [QA.md](docs/QA.md) | Test strategy, release checklist, verified results |
| [MASTER_SPEC.md](docs/MASTER_SPEC.md) | Original specification, preserved as historical input |

## Planned stack and architecture

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL, Recharts, Lucide, Zod, React Hook Form, and npm. Vitest covers domain calculations; database tests cover ownership and constraints; Playwright covers user flows.

The application is one Next.js service with authenticated server reads/actions and Supabase RLS. Browser state is limited to interaction, presentation preferences, and timer display. Daily and weekly scores are separate. Challenge associations reuse the same tracker history. See [architecture](docs/ARCHITECTURE.md) and [scoring](docs/SCORING.md).

## Local setup — available after Phase 1

Phase 0 inspection found Node.js 22.15.0, npm 10.9.2, and a Docker CLI on the implementation machine. Docker daemon availability was not tested. Supabase CLI was not installed. These observations are not dependency requirements or installation guarantees.

Phase 1 will record the supported Node version, install compatible stable dependencies, commit `package-lock.json`, and install the Supabase CLI as a project development dependency. Use a running Docker-compatible runtime for local Supabase. No cloud account is required for local development.

After Phase 1 is implemented:

1. Install the documented Node runtime and run `npm ci` to reproduce locked dependencies.
2. Start the local Supabase stack using the project command below.
3. Populate `.env.local` from the future `.env.example` using local project details; keep it out of Git.
4. Apply local migrations, then start the development server.
5. Exercise email confirmation/recovery using the local email inbox identified by Supabase status.

The steps above are planned, not a claim that they work in this documentation-only checkout.

## Environment variables — planned contract

| Name | Purpose | First needed |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of the local or hosted Supabase project | Phase 1 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public project key; RLS provides data protection | Phase 1 |
| `APP_ORIGIN` | Trusted application origin for email redirects and server URLs | Phase 1 |
| `SUPABASE_SECRET_KEY` | Server-only administrative key for account deletion | Phase 8 |

Use only example placeholders in `.env.example`. Local CLI authentication and hosted migration credentials are operational secrets, not browser environment variables. Never expose an administrative key with a `NEXT_PUBLIC_` prefix.

## Planned application commands

These scripts do not exist yet. Phase 1 must implement and verify the applicable scripts; feature phases add tests as their behavior arrives.

| Command | Meaning |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run lint` | Check code with ESLint without rewriting files |
| `npm run typecheck` | Check TypeScript types without emitting application files |
| `npm run test` | Run domain unit tests once |
| `npm run test:db` | Run local database ownership/constraint tests |
| `npm run test:e2e` | Run Playwright user-flow tests |
| `npm run build` | Build the production application |
| `npm run start` | Serve the previously built production application |

The lint script runs ESLint directly, following [Next.js guidance](https://nextjs.org/docs/app/getting-started/installation).

## Supabase setup and migrations — future workflow

Use the project-installed CLI through `npx supabase`; once installed, `npx` should resolve the locked local dependency. These commands have been checked against official documentation but have not been run in this repository.

| Command | Meaning |
| --- | --- |
| `npx supabase init` | Create local configuration once during Phase 1 |
| `npx supabase start` | Start the local database/auth stack in containers |
| `npx supabase status` | Inspect local services, URLs, and keys; do not publish secret output |
| `npx supabase migration new foundation` | Create a timestamped SQL migration for the foundation |
| `npx supabase db reset --local` | Rebuild the disposable local database from migrations; erases local data |
| `npx supabase gen types typescript --local` | Generate TypeScript definitions from the local schema |
| `npx supabase test db` | Run SQL/database tests against the local stack |

Phase 1 will provide a project script that writes generated types to their actual source file. Commit migrations and generated types together. Add an incremental migration for each schema change; do not rewrite already deployed history. Do not manually create production tables through the dashboard.

The [Supabase migration guide](https://supabase.com/docs/guides/local-development/database-migrations) describes this workflow. The archived specification's `supabase db commit` example is superseded.

## Hosted Supabase and Vercel deployment — Phase 9 runbook

No remote, hosted project, or deployment is configured in Phase 0.

Before an authorized release, create separate local/staging/production configurations; configure email delivery, application origin, allowed redirects, and confirmation/recovery templates. Link the CLI to the explicitly chosen hosted project and apply tested migrations with `npx supabase db push`. This changes the remote database: verify the target and backup/recovery requirements first. Never use a remote reset as a deployment shortcut.

Deploy the Next.js project to Vercel with the corresponding environment values. Keep previews isolated from production personal data. Verify auth cookies, redirects, private caching behavior, and release gates in [QA](docs/QA.md). Actual deployment identifiers and recovery steps must be recorded once configured.

## Database overview

Foundation tables are profiles, preferences, life areas, and categories. Later migrations add shared challenge trackers, habit schedules/logs, raw numerical metrics, frequency targets, versioned scoring configuration, workouts, sleep, study/timers, planning, and reflection. Every owned table and child relationship enforces user isolation. The complete proposed model and migration order live in [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## PWA and offline limitations

Phase 8 adds a manifest, installable icons, theme metadata, and a public offline fallback. It will cache public assets only. Private pages, exports, auth responses, and API responses must not enter the service-worker cache. Offline tracking writes and full database synchronization are outside V1. A running timer may continue displaying elapsed time offline, but saving requires connectivity.

## Verification

Phase 0 verification covers document links, requirement coverage, calculation examples, status consistency, and whitespace. Application lint, typecheck, tests, build, and database checks are not available yet. See the dated [QA verification record](docs/QA.md) for actual results.
