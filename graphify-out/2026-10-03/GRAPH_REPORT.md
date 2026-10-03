# Graph Report - winter-arc-os  (2026-10-03)

## Corpus Check
- 140 files · ~602,070 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .example 1, .css 1)

## Summary
- 1101 nodes · 1861 edges · 79 communities (58 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c8cf13b1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Button
- 2026-10-03-pre-simplification/docs/MASTER_SPEC.md
- vitest
- 20261003090000_simple_habits.sql
- Verification record
- 20261001004511_core_tracking.sql
- Implementation roadmap and phase gates
- Database conventions
- Winter Arc OS — product requirements
- 20261001104654_planning.sql
- Scheduling, adherence, and scoring
- Winter Arc OS
- 20261001044053_fitness.sql
- 20261001052104_career.sql
- 52. DEVELOPMENT PROCESS
- package.json
- Winter Arc OS — simple habit architecture
- Winter Arc OS — simple habit delivery
- Simple habit cleanup inventory
- Simple habit UI prompt set
- fixtures.ts
- MASTER_SPEC.md
- 13. FITNESS TRACKER
- 20260930180649_foundation.sql
- compilerOptions
- dependencies
- devDependencies
- habits/page.tsx
- Winter Arc OS — UI/UX refinement plan
- What You Must Do When Invoked
- 3. CORE DESIGN PRINCIPLE
- Today and Habits UI concepts
- auth-form.tsx
- 8. TODAY DASHBOARD
- Winter Arc OS — design direction
- app/layout.tsx
- scripts
- settings-forms.tsx
- editor.tsx
- auth/validation.ts
- Winter Arc OS — simple habit product
- Winter Arc OS — UI/UX refinement plan
- 2026-10-03-pre-simplification/README.md
- 20261002004151_data_controls.sql
- public.save_fitness_workout
- public.save_fitness_workout
- 20261001044323_fitness_owner_indexes.sql
- Winter Arc OS — habit history and consistency
- public.carry_planning_tasks
- goal_milestones_goal_owner
- score_items_policy_category
- categories_area_owner
- bootstrap.sql
- postcss.config.mjs
- sw.js
- FormField
- Winter Arc OS — simple habit verification
- Winter Arc OS — project operating instructions
- Winter Arc OS — simple habit design
- Simple habit design review
- Winter Arc OS — project operating instructions
- @supabase/supabase-js
- Winter Arc OS
- This is NOT the Next.js you know
- AGENTS.md
- 52. DEVELOPMENT PROCESS
- graphify reference: extra exports and benchmark
- 13. FITNESS TRACKER
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- 3. CORE DESIGN PRINCIPLE
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- extraction-spec.md
- 8. TODAY DASHBOARD

## God Nodes (most connected - your core abstractions)
1. `Button()` - 29 edges
2. `next` - 24 edges
3. `isSupabaseConfigured()` - 24 edges
4. `requireAccount` - 22 edges
5. `HabitsPage()` - 20 edges
6. `createClient()` - 20 edges
7. `cn()` - 19 edges
8. `Winter Arc OS — product requirements` - 18 edges
9. `react` - 17 edges
10. `FormField()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Interface inconsistencies and hierarchy` --references--> `FormField()`  [INFERRED]
  docs/history/2026-10-03-pre-simplification/docs/UI_REFINEMENT_PLAN.md → src/components/forms/form-field.tsx
- `Interface inconsistencies and hierarchy` --references--> `FormField()`  [INFERRED]
  docs/UI_REFINEMENT_PLAN.md → src/components/forms/form-field.tsx
- `10. Regression risks` --references--> `FormField()`  [INFERRED]
  docs/history/2026-10-03-pre-simplification/docs/UI_REFINEMENT_PLAN.md → src/components/forms/form-field.tsx
- `10. Regression risks` --references--> `FormField()`  [INFERRED]
  docs/UI_REFINEMENT_PLAN.md → src/components/forms/form-field.tsx
- `Feature, mobile, and accessibility refinements (Phases E–G)` --references--> `MobileViewport()`  [INFERRED]
  docs/history/2026-10-03-pre-simplification/DESIGN.md → src/components/shell/mobile-viewport.tsx

## Import Cycles
- None detected.

## Communities (79 total, 21 thin omitted)

### Community 0 - "Button"
Cohesion: 0.19
Nodes (14): ErrorPage(), metadata, SettingsPage(), ResponsiveEditorProps, LogoutButton(), Button(), buttonVariants, logout() (+6 more)

### Community 1 - "2026-10-03-pre-simplification/docs/MASTER_SPEC.md"
Cohesion: 0.04
Nodes (52): 10. HABIT SYSTEM, 11. HABIT GRID, 12. STREAK SYSTEM, 14. WORKOUT LOGGING, 15. CAREER TRACKER, 16. STUDY TIMER, 17. CAREER ANALYTICS, 18. WEEKLY TASK SYSTEM (+44 more)

### Community 2 - "vitest"
Cohesion: 0.27
Nodes (3): @electric-sql/pglite, vitest, foundationDatabase()

### Community 3 - "20261003090000_simple_habits.sql"
Cohesion: 0.14
Nodes (16): habit_logs_owner_date, habit_logs_updated, habit_schedules_owner, habits_owner, habits_updated, private.habit_schedule_guard(), public.archive_habit(), public.delete_habit() (+8 more)

### Community 4 - "Verification record"
Cohesion: 0.09
Nodes (23): Browser flows and presentation, Component adoption rollback — October 2, 2026, Database security matrix, Documentation verification, Domain cases, Final QA for UI/UX refinement A–G after component-adoption rollback — October 2, 2026, Phase 0 — September 30, 2026, Phase 1 — September 30, 2026 (+15 more)

### Community 5 - "20261001004511_core_tracking.sql"
Cohesion: 0.06
Nodes (9): frequency_rules_no_overlap, habit_log_revision, metric_log_revision, metric_targets_no_overlap, preferences_challenge_owner, public.challenges, public.habits, schedules_no_overlap (+1 more)

### Community 6 - "Implementation roadmap and phase gates"
Cohesion: 0.09
Nodes (23): 1A — Scaffold and shared system, 1B — Database and authentication, 2A — Challenges and optional starter setup, 2B — Habits and grid, 2C — Metrics and frequency, 2D — Today and scoring, Acceptance gate, Acceptance gate (+15 more)

### Community 7 - "Database conventions"
Cohesion: 0.10
Nodes (21): Account and organization — Phase 1, Application boundaries, Architecture, data model, and interface contract, Authentication and security, Career — Phase 4 (implemented), Challenges and core tracking — Phase 2, Component responsibilities, Data flow (+13 more)

### Community 8 - "Winter Arc OS — product requirements"
Cohesion: 0.11
Nodes (18): Accessibility and inclusion, Brand commitments, Constraints and later work, Data controls and installation decisions — Phase 8, Date, history, and privacy expectations, Evidence on hand, Operating context, Optional starter definitions (+10 more)

### Community 9 - "20261001104654_planning.sql"
Cohesion: 0.14
Nodes (21): goal_milestones_owner_goal, goals_category_owner, goals_challenge_owner, goals_metric_owner, goals_owner_status, goals_revision, milestones_revision, public.goal_milestones (+13 more)

### Community 10 - "Scheduling, adherence, and scoring"
Cohesion: 0.13
Nodes (15): Calendar and effective rules, Daily score, Duplicate-source exclusion, Frequency and partial periods, Habit schedules and states, Insights comparison semantics, Monthly evaluation, Raw metrics (+7 more)

### Community 11 - "Winter Arc OS"
Cohesion: 0.15
Nodes (13): Commands, Current delivery, Data controls and recovery, Documentation, Hosted configuration, Install and run, Installation and offline behavior, Later features (+5 more)

### Community 12 - "20261001044053_fitness.sql"
Cohesion: 0.08
Nodes (32): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal, exercises_owner_name_active, public.copy_fitness_workout(), public.exercises (+24 more)

### Community 13 - "20261001052104_career.sql"
Cohesion: 0.13
Nodes (17): focus_timers_category_owner, focus_timers_challenge_owner, focus_timers_one_active, focus_timers_revision, public.focus_timers, public.save_study_category(), public.save_study_session(), public.setup_career() (+9 more)

### Community 14 - "52. DEVELOPMENT PROCESS"
Cohesion: 0.20
Nodes (10): 52. DEVELOPMENT PROCESS, PHASE 1 — FOUNDATION, PHASE 2 — CORE TRACKING, PHASE 3 — FITNESS, PHASE 4 — CAREER, PHASE 5 — PLANNING, PHASE 6 — INSIGHTS, PHASE 7 — REFLECTION (+2 more)

### Community 15 - "package.json"
Cohesion: 0.09
Nodes (23): eslintConfig, engines, node, name, private, type, version, class-variance-authority (+15 more)

### Community 16 - "Winter Arc OS — simple habit architecture"
Cohesion: 0.22
Nodes (9): Authentication, privacy, and data controls, Boundaries and routes, Focused reads and domain contracts, Known open gates, Migration and cutover, Mutation behavior, Status and authority, Target public schema: five tables (+1 more)

### Community 17 - "Winter Arc OS — simple habit delivery"
Cohesion: 0.22
Nodes (9): Active direction, Final product acceptance, Step 1 — Product decision and cleanup inventory, Step 2 — New UI proposals and approval, Step 3 — Simplified foundation and coordinated cleanup, Step 4 — Today, Step 5 — Habits, Step 6 — Settings and final cleanup (+1 more)

### Community 18 - "Simple habit cleanup inventory"
Cohesion: 0.25
Nodes (8): Cutover and verification, Database scope, Packages, styles, assets, and configuration, Reviewed hosted reset scope — October 3, 2026, Runtime routes and modules, Simple habit cleanup inventory, Status and sources, Tests and helpers

### Community 19 - "Simple habit UI prompt set"
Cohesion: 0.25
Nodes (7): editor, habits, history, settings, Settings correction, Simple habit UI prompt set, today

### Community 20 - "fixtures.ts"
Cohesion: 0.33
Nodes (6): @axe-core/playwright, @playwright/test, zod, Fixture, signIn(), sessionSchema

### Community 21 - "MASTER_SPEC.md"
Cohesion: 0.04
Nodes (52): 10. HABIT SYSTEM, 11. HABIT GRID, 12. STREAK SYSTEM, 14. WORKOUT LOGGING, 15. CAREER TRACKER, 16. STUDY TIMER, 17. CAREER ANALYTICS, 18. WEEKLY TASK SYSTEM (+44 more)

### Community 22 - "13. FITNESS TRACKER"
Cohesion: 0.29
Nodes (7): 13. FITNESS TRACKER, Body Weight, Creatine, Protein, Sleep, Steps / Walking, Water

### Community 23 - "20260930180649_foundation.sql"
Cohesion: 0.19
Nodes (12): areas_updated, categories_owner_area, categories_updated, life_areas_owner_position, on_auth_user_created, preferences_updated, profiles_updated, public.categories (+4 more)

### Community 24 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 25 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, class-variance-authority, clsx, geist, lucide-react, next, next-themes, radix-ui (+6 more)

### Community 26 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @axe-core/playwright, @electric-sql/pglite, eslint, @eslint/compat, eslint-config-next, @playwright/test, supabase (+8 more)

### Community 27 - "habits/page.tsx"
Cohesion: 0.08
Nodes (57): lucide-react, AuthLayout(), HabitsPage(), metadata, WorkspaceLayout(), metadata, TodayPage(), Brand() (+49 more)

### Community 28 - "Winter Arc OS — UI/UX refinement plan"
Cohesion: 0.14
Nodes (15): 11. Validation checklist, 1. Goals, 2. Non-goals, 3. Current UI findings, 4. Approved design direction, 5. Design-system decisions, 7. Watermelon/shadcn usage rules, 8. Implementation phases A–G (+7 more)

### Community 29 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 30 - "3. CORE DESIGN PRINCIPLE"
Cohesion: 0.50
Nodes (4): 3. CORE DESIGN PRINCIPLE, HABIT, METRIC, TARGET

### Community 31 - "Today and Habits UI concepts"
Cohesion: 0.50
Nodes (3): Habits, Today, Today and Habits UI concepts

### Community 32 - "auth-form.tsx"
Cohesion: 0.06
Nodes (54): nextConfig, next, @supabase/ssr, headers, POST(), reply(), dynamic, GET() (+46 more)

### Community 34 - "Winter Arc OS — design direction"
Cohesion: 0.08
Nodes (25): Component adoption cancelled, Feature, mobile, and accessibility refinements (Phases E–G), Final A–G QA after adoption rollback, Implementation recording checklist, Interaction conventions, Navigation and responsive behavior, Privacy and analytics, Status (+17 more)

### Community 35 - "app/layout.tsx"
Cohesion: 0.23
Nodes (8): next-themes, dynamic, geist, metadata, RootLayout(), viewport, Connectivity(), ThemeProvider()

### Community 38 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:reset, db:start, dev, lint, start, test (+3 more)

### Community 39 - "settings-forms.tsx"
Cohesion: 0.31
Nodes (10): 10. Regression risks, 7. Watermelon/shadcn usage rules, Input(), Label(), updatePreferences(), updateProfile(), submitSettingsAction(), PreferencesForm() (+2 more)

### Community 40 - "editor.tsx"
Cohesion: 0.27
Nodes (8): react, react-dom, FormFeedback(), controlClass, FieldControlProps, HabitForm(), deleteWorkspaceData(), DeleteDataForm()

### Community 41 - "auth/validation.ts"
Cohesion: 0.20
Nodes (11): calendarSchema, preferencesSchema, appearanceSchema, email, initialFormState, loginSchema, password, passwordSchema (+3 more)

### Community 42 - "Winter Arc OS — simple habit product"
Cohesion: 0.15
Nodes (13): Brand commitments and accessibility, Delivery and verification, Explicit removals, Fresh-start boundary, Habit definition and recording, History and consistency, Platform, Positioning and operating context (+5 more)

### Community 43 - "Winter Arc OS — UI/UX refinement plan"
Cohesion: 0.17
Nodes (12): 10. Regression risks, 11. Validation checklist, 1. Goals, 2. Non-goals, 3. Current UI findings, 4. Approved design direction, 5. Design-system decisions, 8. Implementation phases A–G (+4 more)

### Community 49 - "Winter Arc OS — habit history and consistency"
Cohesion: 0.22
Nodes (9): Calendar rules, Corrections and retries, Effective schedule changes, Five date states, Required cases, Status, Today count, Weekly consistency (+1 more)

### Community 57 - "FormField"
Cohesion: 0.49
Nodes (10): Implemented shared presentation contracts (Phases B–D), 6. Shared component strategy, Phases B–D implementation decisions and evidence, 6. Shared component strategy, Phases B–D implementation decisions and evidence, Confirmation(), ResponsiveEditor(), close() (+2 more)

### Community 58 - "Winter Arc OS — simple habit verification"
Cohesion: 0.22
Nodes (9): Baseline and artifact results, Browser findings and fixes, Commands and evidence, Open gates, Replacement foundation evidence — October 3, 2026, Required replacement checks, Step 1–2 verification record — October 3, 2026, Truthful status (+1 more)

### Community 59 - "Winter Arc OS — project operating instructions"
Cohesion: 0.29
Nodes (7): Current state and authorization, Database and command discipline, Engineering invariants, Git and handoffs, Phase workflow, Start here, Winter Arc OS — project operating instructions

### Community 60 - "Winter Arc OS — simple habit design"
Cohesion: 0.29
Nodes (7): Artifacts and approval, Authority and implementation status, Inherited tokens, Operate mode: a daily checklist, Proposed navigation and sections, States and interaction, Winter Arc OS — simple habit design

### Community 61 - "Simple habit design review"
Cohesion: 0.29
Nodes (7): Approval record, Direction to approve, Following approval, Proposed review set, Simple habit design review, Status, Superseded artifacts

### Community 62 - "Winter Arc OS — project operating instructions"
Cohesion: 0.29
Nodes (7): Current state, Database and command discipline, Engineering invariants, Git and handoffs, Phase workflow, Start here, Winter Arc OS — project operating instructions

### Community 63 - "@supabase/supabase-js"
Cohesion: 0.29
Nodes (4): @supabase/supabase-js, candidates, client, [since, mode]

### Community 65 - "Winter Arc OS"
Cohesion: 0.22
Nodes (9): Auth and email setup, Browser verification, Commands, Data and offline controls, Database workflow, Documentation, Git and release, Install and run (+1 more)

### Community 66 - "This is NOT the Next.js you know"
Cohesion: 0.67
Nodes (3): graphify, This is NOT the Next.js you know, Verified simplified workflows — October 3, 2026

### Community 69 - "52. DEVELOPMENT PROCESS"
Cohesion: 0.20
Nodes (10): 52. DEVELOPMENT PROCESS, PHASE 1 — FOUNDATION, PHASE 2 — CORE TRACKING, PHASE 3 — FITNESS, PHASE 4 — CAREER, PHASE 5 — PLANNING, PHASE 6 — INSIGHTS, PHASE 7 — REFLECTION (+2 more)

### Community 71 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 76 - "13. FITNESS TRACKER"
Cohesion: 0.29
Nodes (7): 13. FITNESS TRACKER, Body Weight, Creatine, Protein, Sleep, Steps / Walking, Water

### Community 78 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 79 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 80 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 81 - "3. CORE DESIGN PRINCIPLE"
Cohesion: 0.50
Nodes (4): 3. CORE DESIGN PRINCIPLE, HABIT, METRIC, TARGET

## Knowledge Gaps
- **527 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+522 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 629 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `auth()` connect `20261001044053_fitness.sql` to `vitest`, `20261001004511_core_tracking.sql`, `20261001104654_planning.sql`, `20261001052104_career.sql`, `20260930180649_foundation.sql`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `vitest` connect `vitest` to `editor.tsx`, `auth/validation.ts`, `habits/page.tsx`, `package.json`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `Winter Arc OS — UI/UX refinement plan` connect `Winter Arc OS — UI/UX refinement plan` to `FormField`, `Winter Arc OS — design direction`, `AGENTS.md`, `settings-forms.tsx`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Button()` (e.g. with `10. Regression risks` and `7. Watermelon/shadcn usage rules`) actually correct?**
  _`Button()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _527 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `2026-10-03-pre-simplification/docs/MASTER_SPEC.md` be split into smaller, more focused modules?**
  _Cohesion score 0.03773584905660377 - nodes in this community are weakly interconnected._
- **Should `20261003090000_simple_habits.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.14333333333333334 - nodes in this community are weakly interconnected._