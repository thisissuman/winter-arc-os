# Winter Arc OS — project operating instructions

## Start here

For repository work, read this file and the canonical documentation before editing; read nearer AGENTS.md files if present.

- [README](README.md): actual setup/commands and current implementation status.
- [PRODUCT](PRODUCT.md): accepted simple-habit requirements.
- [Architecture](docs/ARCHITECTURE.md): target routes/schema/auth/data contracts.
- [History calculations](docs/SCORING.md): binary scheduling, eligibility, corrections, weekly consistency; no scores.
- [Design](DESIGN.md): inherited tokens and proposals versus approved/implemented layouts.
- [Roadmap](docs/ROADMAP.md): six sequential replacement gates.
- [QA](docs/QA.md): required checks and actual evidence.
- [Cleanup](docs/SIMPLIFICATION.md): exact removal inventory and reset/cutover.
- [Design review](docs/DESIGN_REVIEW.md): artifact filenames and approval status.

The [original specification](docs/MASTER_SPEC.md) stays unchanged. The broader product and verified workflows are preserved in [the historical snapshot](docs/history/2026-10-03-pre-simplification/README.md). Accepted current PRODUCT/ARCHITECTURE/SCORING supersede their retired requirements; direct user instructions take precedence.

## Current state and authorization

October 3, 2026: the user authorized implementing the simple-habit replacement plan. Target: Today/Habits/Settings only, binary check-ins, daily/selected weekdays, no seasons, numerical logging, scores, quotas, timers, fitness/career/planning/reflection/organization feature systems.

Steps 1–2 documentation/inventory and all five design boards are delivered; the user **approved the designs October 3, 2026**. The user's plan requires “Create and approve new section images” before “Simplify the foundation.” That checkpoint is closed. The six implementation steps are delivered; retain the approved artifacts and proceed without repeated approval questions for already authorized work.

The source and configured development schema now use five public tables, six habit/data RPCs, and exactly three navigation sections. Full types are regenerated; lint/typecheck/build, 22 unit cases, 23 database cases, hosted security checks, and all 26 real-auth desktop/mobile browser checks pass. Old QA remains historical evidence. SMTP email delivery is deferred before production; no deployment/push/merge is authorized.

The same development project is the accepted fresh-start target: discard all existing product history, retain Auth identities/profiles/essential preferences. No old-history import is planned. Verify project/local URL, actual catalog/ledger and affected records before applying the destructive forward migration. Do not use a remote database reset or substitute another project.

## Phase workflow

1. Select the earliest open gate in the current six-step roadmap, respecting explicit image approval.
2. Implement one gate/section at a time and finish validation/handoff before the next.
3. Keep product scope to the accepted contract; never restore retired features behind hidden configuration.
4. Update canonical documentation, inventory, operating memory, and QA in the same change as verified workflow/implementation changes.
5. Report delivered behavior, checks/results, configuration still needed, limitations, and the next gate.
6. An unavailable/deferred required check stays unverified and the corresponding gate open. Historical old-product success never closes replacement gates.

## Engineering invariants

- Use npm and the retained stack; pin compatible dependencies in the lockfile and verify official docs before adopting new framework/auth patterns.
- Prefer Server Components, small interactive components and authenticated Server Actions; keep date/domain logic outside UI.
- Zod-validate mutations and independently verify caller identity/ownership.
- RLS on all five owned tables; same-owner child FKs and covering indexes.
- Never expose privileged keys or commit environment files, secrets, personal exports, credentials, build artifacts, or traces.
- Completion is desired boolean plus revision, not blind toggle; preserve uniqueness and visibly handle conflicting/failed writes.
- Store UTC timestamps and retained business dates; schedules edit tomorrow, archive cutoff tomorrow, no future/unscheduled writes.
- Archive retains history; permanent deletion is separate and confirmed. No restore flow in the initial simplified product.
- Weekly consistency covers closed dates only, excluding all today/future records. No synthetic logs or scores.
- Global Privacy Mode masks every habit name before rendering/serialization and disables name editing; no per-habit privacy state.
- Keyboard/mobile/accessibility, both themes, reduced motion, loading/empty/error states, and truthful save feedback remain required.
- No fabricated analytics, inert completed-looking features, broad any types, or unfinished pages claimed as delivered.

## Database and command discipline

Keep historical applied SQL unchanged under supabase/migrations. Add a forward simplification migration, owned constraints/indexes/triggers/RLS and replacement policy tests together. Drop retired dependencies explicitly child-first; don't use broad CASCADE that can remove shared Auth infrastructure. Replay the whole migration chain locally.

README owns project commands. Don't use the old supabase db commit example. db reset is local/disposable only; hosted migration application is an explicitly targeted separate operation. Never apply the simplified schema while a running build still queries retired tables.

Before application handoff run lint, typecheck, relevant unit tests, database tests and a production build. Run typecheck and build sequentially: both write .next/types. Design-only gates use artifact/document verification plus old-app baseline checks, never target behavior claims. PGlite test:db supplies test-only Auth/roles; it does not verify hosted Auth/email or a full local Supabase stack.

test:e2e builds production on port 3100. Use real confirmed/disposable development accounts, never mocked Auth or fabricated JWTs. Browser tests may require local port permission. Restore existing fixture profile/theme state in finally, narrowly clean synthetic fixtures, keep credentials/traces ignored, and use disposable accounts for deletion tests.

Compare the MCP/CLI project URL to local configuration and inspect live catalog/history before hosted changes. Never resolve mismatches by silently changing credentials. If MCP creates a migration timestamp, align the local filename before later CLI push.

Regenerate complete database types from the matching Supabase project after schema changes. Do not recreate the deleted partial PGlite type generator. CHECK-constrained text needs domain narrowing only while matching SQL constraints remain verified. Run hosted security/performance advisors; add follow-up indexes for verified unindexed FKs.

Keep cookie refresh in src/proxy.ts and private/no-store response cookies/headers. Pages/actions independently verify getClaims()/getUser(). Redirects use validated APP_ORIGIN/local allowlists. Auth confirmation supports token hashes and same-browser PKCE; callback no-referrer belongs in configured headers as well as route handlers. Custom SMTP/email setup is separate from SQL.

Rewrite export/delete allowlists against the five-table catalog. Export format_version becomes 2. Data clearing retains Auth/profile/preferences. Keep transactional Auth before-delete cleanup; never bypass it with independent admin REST table deletes. SUPABASE_SECRET_KEY is server-only/same-project and used only for immediately verified self-deletion.

Keep controlled Settings fields across offline failures. Service-worker cache contains only public offline document/icons; bump version if those assets change and never cache workspace/Auth/API/RSC/mutations/exports. Only offer installation when the browser has a real prompt.

## Git and handoffs

Use feature/* branches. master is the GitHub default integration branch, origin https://github.com/thisissuman/winter-arc-os.git. Preserve unrelated changes, use focused Conventional Commits, review diffs before commits. Do not push/merge/deploy without authorization. Attach any created PR to this chat.

Keep old migration/spec/QA evidence, but do not keep retired runtime modules/tests as speculative future code. Mark old concept images superseded. Refresh graphify after code changes, with portable outputs versioned and machine-local caches ignored.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.
Version the portable graph, report, manifest, and analysis output; leave the machine-local root, interpreter path, and regenerable cache ignored.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Verified simplified workflows — October 3, 2026

- Current schema migrations: original 14, 20261003090000_simple_habits, and 20261003103000_habit_conflict_response. Keep applied files immutable. The conflict fix preserves signatures/grants and returns PT409; never use SQLSTATE 40001 for business revision conflicts because PostgREST retries serialization failures.
- Use a single controlled Preferences form for theme/timezone/week start/privacy. Hide the previous result while pending, and wait for the new response before navigation in browser tests.
- Native dialog opening explicitly focuses its first input: React autoFocus alone does not cover editors mounted by client navigation. Use unique field IDs. Weekday checkbox inputs cover the whole 44px visible label; visually clipped one-pixel inputs are unsuitable as pointer targets.
- Browser fixture cleanup must run even if resetting offline state fails after context shutdown. scripts/cleanup-browser-fixtures.mjs inspects only marked disposable accounts in the pinned development project after a supplied ISO timestamp; --apply deletes those test identities through Auth admin, never personal accounts. Never run it concurrently with active tests.
- Vite 8.3.1 is an explicit dev dependency for retained Vitest after shadcn removal. Standard npm ci works; keep compatibility warnings separate from actual check results.
