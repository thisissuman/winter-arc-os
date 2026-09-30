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

Phase 0 is complete. Phase 1 foundation code, SQL, tooling, and browser tests are implemented; hosted authentication verification is pending. Read ROADMAP and QA for current gates and evidence. Do not start Phase 2 until the foundation handoff is complete. The active Supabase MCP now matches `.env.local`, and read-only SQL succeeds. Its configuration includes `read_only=true`, so `apply_migration` is unavailable. No hosted migration has been applied; enable write access on the authorized development project before deployment. Never bypass a read-only connection through another tool.

## Phase workflow

1. Select the earliest incomplete phase unless the user names another phase whose dependencies are complete. Read its acceptance criteria.
2. Implement one requested phase at a time. Finish required validation and its handoff before proceeding to another phase.
3. Keep changes within that phase. Do not implement future tables or expose inactive routes as working features.
4. Update canonical documentation in the same change as implementation. Record repeated workflows and verified best practices here or in a linked document.
5. Report delivered behavior, commands and outcomes, configuration still needed, known limitations, and the next phase. Do not repeatedly ask whether to continue within an authorized phase.
6. If a required check cannot run, record it as unverified and leave the corresponding gate incomplete. Fix runnable failures instead of calling them complete with caveats.

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

Keep project-specific commands in the repository. README lists actual scripts and their meaning. Before a handoff, run `npm run lint`, `npm run typecheck`, relevant Vitest checks, and a production build. `npm run test:db` uses migrated PGlite PostgreSQL and test-only auth infrastructure; it cannot establish that hosted Auth/email or a full Supabase stack works. `npm run test:e2e` builds and tests production on port 3100; dedicated test credentials enable authenticated checks. Never silently substitute mocked authentication.

Next.js uses `src/proxy.ts` for cookie refresh; pages/actions independently verify identity with `getClaims()`/`getUser()`. Preserve the proxy's response cookies and private/no-store headers. Redirects use validated `APP_ORIGIN` and a local allowlist. Local fonts and Webpack make this environment's production builds reproducible. ESLint uses the official compatibility adapter; revisit old bundled plugin peer ranges when upgrading.

Before a hosted schema mutation, compare the MCP/CLI project URL with local configuration, inspect existing tables/history, and verify authorization targets that project. Never resolve a mismatch by silently changing credentials or applying to another project. If MCP creates a migration version, rename the local SQL file to that recorded timestamp before a subsequent CLI push. Hosted Auth/email settings are separate from migrations and local config. Never print privileged keys or test passwords.

## Git and handoffs

Use a feature branch; default prefix is `codex/`. Never push directly to the production branch. Use focused Conventional Commits, e.g. `docs: establish phased build documentation` or `feat(auth): add cookie-based sign-in`. Preserve unrelated work. Do not push, merge, or deploy unless authorized.

The repository began with an unborn `master` branch and no remote. Document the chosen production branch and remote when configured; do not assume an existing `main` or invent a repository URL. Review the diff before committing. Attach any created pull request to this chat.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
