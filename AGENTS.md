# Winter Arc OS — project operating instructions

## Start here

Read this file and the canonical documents relevant to the requested phase before editing. Read any nearer `AGENTS.md` for a nested directory as well.

- [README](README.md): actual setup and command availability.
- [PRODUCT](PRODUCT.md): accepted product requirements and defaults.
- [Architecture](docs/ARCHITECTURE.md): application boundaries, routes, database design, security, and decisions.
- [Scoring](docs/SCORING.md): scheduling, period evaluation, adherence, streaks, and historical calculations.
- [Design](DESIGN.md): approved direction; implemented conventions once a UI exists.
- [Roadmap](docs/ROADMAP.md): phase boundaries, dependencies, and acceptance criteria.
- [QA](docs/QA.md): required verification and actual results.

The [original specification](docs/MASTER_SPEC.md) is an unchanged historical reference. Accepted decisions in PRODUCT, ARCHITECTURE, and SCORING supersede conflicting examples or process instructions in that reference. Direct user instructions take precedence. Record a new accepted decision in its canonical document rather than silently changing a requirement.

## Current state

Phases 0–4 are complete in the configured development project. Phase 3 fitness was committed as `42d6db1` on `codex/phase-3-fitness`; Phase 4 Career is on `codex/phase-4-career` after the user's explicit request. The active Supabase MCP URL matches `.env.local`. Applied local/hosted versions are `20260930180649_foundation`, `20260930181434_categories_parent_index`, `20261001004511_core_tracking`, `20261001004734_score_items_policy_category_index`, `20261001044053_fitness`, `20261001044323_fitness_owner_indexes`, `20261001044532_workout_edit_fix`, `20261001050228_workout_payload_guard`, and `20261001052104_career`. Hosted database types are regenerated, rollback-only hosted security fixtures pass, and the 24-case production browser suite plus two focused Career privacy cases pass. Read ROADMAP and QA for exact gate status and remaining release checks. Do not start Phase 5 without its own request. Phase 1 signup/confirmation/recovery email delivery remains deferred until SMTP before production. This checkout still has no Git remote; obtain the verified repository URL before any push.

## Phase workflow

1. Select the earliest incomplete phase unless the user names another phase whose dependencies are complete. Read its acceptance criteria.
2. Implement one requested phase at a time. Finish required validation and its handoff before proceeding to another phase.
3. Keep changes within that phase. Do not implement future tables or expose inactive routes as working features.
4. Update canonical documentation in the same change as implementation. Record repeated workflows and verified best practices here or in a linked document.
5. Report delivered behavior, commands and outcomes, configuration still needed, known limitations, and the next phase. Do not repeatedly ask whether to continue within an authorized phase.
6. If a required check is deferred or cannot run, record it as unverified and leave the corresponding gate incomplete. A later explicit testing request supersedes an earlier phase-specific test deferral; run checks and record their exact outcomes before closing the gate.

## Engineering invariants

- Use the required stack and npm. Pin compatible stable dependencies in the lockfile at implementation time; verify current official documentation before adopting framework/auth patterns.
- Prefer Server Components and authenticated Server Actions. Keep interactive components small and calculation logic outside UI components.
- Validate every mutation with Zod and independently verify identity and ownership on the server.
- Enable RLS for every user-owned table and secure every relationship against cross-owner references. Use the caller's identity for normal queries and mutations.
- Never put privileged Supabase keys in client code. Never commit real secrets, environment files, build artifacts, or personal exports.
- Habits, numerical metrics, and frequency targets remain distinct. Preserve raw values; do not synthesize user performance data.
- Daily and weekly scores are separate. Shared trackers are logged once and reused across challenges. Follow SCORING for exclusions and duplicate-source rules.
- Store timestamps in UTC and retain local business dates. Use inclusive challenge dates and effective-dated expectations; timezone or target edits must not silently rewrite history.
- Archive tracking definitions by default to preserve history. Explicit permanent deletion is a separate action.
- Use optimistic updates only with visible failure handling and rollback. Use transactions and retry identifiers where duplicate operations would corrupt data.
- Accessibility, mobile behavior, privacy handling, loading/empty/error states, and truthful analytics are required in every relevant phase.
- No fake APIs, fabricated analytics, inert buttons presented as complete, broad `any` types, or unfinished pages presented as delivered features.

## Database and command discipline

Keep SQL migrations under `supabase/migrations`. Add tables, constraints, indexes, triggers, RLS, and policy tests together. Regenerate database TypeScript types after schema changes. Phase 1 creates foundation tables only; later phases add their own migrations.

Use project-managed Supabase CLI commands documented in README. Do not use the historical `supabase db commit` example. Local `db reset` destroys local development data; never substitute a remote database reset. Remote migration deployment is a separate explicitly targeted operation.

Keep project-specific commands in the repository. README lists actual scripts and their meaning. Before a handoff run `npm run lint`, `npm run typecheck`, relevant Vitest checks, and a production build. `npm run test:db` uses migrated PGlite PostgreSQL and test-only auth infrastructure; it cannot establish hosted Auth/email or a full Supabase stack. `npm run test:e2e` builds and tests production on port 3100; dedicated test credentials enable authenticated checks. Browser tests may need local port permission outside the sandbox. Never silently substitute mocked authentication.

Run `npm run typecheck` and `npm run build` sequentially. Both write `.next/types`; concurrent execution can report missing generated route files even when each command passes alone.

Next.js uses `src/proxy.ts` for cookie refresh; pages/actions independently verify identity with `getClaims()`/`getUser()`. Preserve the proxy's response cookies and private/no-store headers. Redirects use validated `APP_ORIGIN` and a local allowlist. Local fonts and Webpack make this environment's production builds reproducible. ESLint uses the official compatibility adapter; revisit old bundled plugin peer ranges when upgrading.

Before a hosted schema mutation, compare the MCP/CLI project URL with local configuration, inspect existing tables/history, and verify authorization targets that project. Never resolve a mismatch by silently changing credentials or applying to another project. If MCP creates a migration version, rename the local SQL file to that recorded timestamp before a subsequent CLI push. Hosted Auth/email settings are separate from migrations and local config. `/auth/confirm` supports both token-hash templates and default-template PKCE codes; the latter must open in the initiating browser. Custom templates are unavailable on the current free project without custom SMTP; see README for the verified setup path. Keep callback responses `no-referrer` in Next.js header configuration as well as the route, because global configured headers can override handler headers. Never print privileged keys or test passwords.

Supabase MCP generated the Phase 4 `src/types/database.ts` after hosted migration. The former PGlite catalog generator covered only foundation types and was removed; do not recreate a script that can overwrite generated types with an incomplete schema. Apply and validate incremental SQL first, then regenerate full types from the matching project. Postgres CHECK-constrained text appears as `string` in generated types; narrow those fields at the domain boundary only while the matching SQL constraints remain verified. After adding owned child tables, run the hosted performance advisor and add covering indexes in a separate migration if it reports unindexed FKs. Preserve already applied SQL; fix routine defects in follow-up migrations.

`supabase/tests/hosted-foundation.sql`, `hosted-tracking.sql`, `hosted-fitness.sql`, and `hosted-career.sql` verify hosted roles/RLS using temporary UUID fixtures inside rollback-only transactions. Validate them locally with `npm run test:db` before running them through an authorized development-project SQL connection. They do not test Auth HTTP flows or email delivery. Keep fixture setup out of deployed migrations and user analytics. Dedicated confirmed-account credentials in ignored `.env.local` enable actual authenticated Playwright checks; do not silently skip these gates when claiming a phase complete. The suite restores fixture profile/theme values in `finally` through ordinary user-scoped requests. Phase 3/4 browser flows remove test logs through the UI; archived synthetic definitions and discarded test timers are cleaned by narrowly targeted development-project queries after runs. Refresh checks expire persisted session metadata while preserving real issued credentials; never forge a JWT or call that a real JWT-expiration test. Browser traces may contain credentials; keep them ignored and do not publish them.

## Git and handoffs

Use a feature branch; default prefix is `codex/`. Never push directly to the production branch. Use focused Conventional Commits, e.g. `docs: establish phased build documentation` or `feat(auth): add cookie-based sign-in`. Preserve unrelated work. Do not push, merge, or deploy unless authorized.

The repository began with an unborn `master` branch and no remote. Document the chosen production branch and remote when configured; do not assume an existing `main` or invent a repository URL. Review the diff before committing. Attach any created pull request to this chat.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
