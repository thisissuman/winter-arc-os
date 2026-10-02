# Graph Report - winter-arc-os  (2026-10-02)

## Corpus Check
- 226 files · ~133,602 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 1498 nodes · 3764 edges · 80 communities (55 shown, 25 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 117 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dc01a1bf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Button
- tracking/actions.ts
- vitest
- insights/domain.ts
- career/actions.ts
- 20261001004511_core_tracking.sql
- surfaces.tsx
- tracking/domain.ts
- Skeleton
- 20261001104654_planning.sql
- dates.ts
- Phases B–D implementation decisions and evidence
- 20261001044053_fitness.sql
- 20261001052104_career.sql
- planning/actions.ts
- package.json
- challenge-pages.tsx
- fitness/actions.ts
- components.json
- @playwright/test
- MASTER_SPEC.md
- tracking/types.ts
- 20260930180649_foundation.sql
- compilerOptions
- dependencies
- devDependencies
- today/page.tsx
- lucide-react
- What You Must Do When Invoked
- Implementation roadmap and phase gates
- auth-form.tsx
- Database conventions
- Winter Arc OS — UI/UX refinement plan
- app/layout.tsx
- habit-page.tsx
- scripts
- Verification record
- cn
- PageHeader
- Winter Arc OS — product requirements
- 20261001160428_reflection.sql
- 20261002004151_data_controls.sql
- public.save_fitness_workout
- public.save_fitness_workout
- 20261001044323_fitness_owner_indexes.sql
- Scheduling, adherence, and scoring
- public.carry_planning_tasks
- goal_milestones_goal_owner
- score_items_policy_category
- categories_area_owner
- bootstrap.sql
- postcss.config.mjs
- sw.js
- Winter Arc OS
- insight-view.tsx
- AGENTS.md
- 52. DEVELOPMENT PROCESS
- graphify reference: extra exports and benchmark
- fitness/page.tsx
- Winter Arc OS — project operating instructions
- 13. FITNESS TRACKER
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- 3. CORE DESIGN PRINCIPLE
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- extraction-spec.md
- 8. TODAY DASHBOARD
- zod
- Winter Arc OS — design direction

## God Nodes (most connected - your core abstractions)
1. `Button()` - 92 edges
2. `PageHeader()` - 55 edges
3. `next` - 54 edges
4. `FormFeedback()` - 54 edges
5. `requireAccount` - 53 edges
6. `FormField()` - 42 edges
7. `TrackingUnavailable()` - 38 edges
8. `react` - 37 edges
9. `Skeleton()` - 34 edges
10. `addDays()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Reflection — Phase 7 (implemented)` --references--> `buildInsightReport()`  [INFERRED]
  docs/ARCHITECTURE.md → src/features/insights/domain.ts
- `Frequency and partial periods` --references--> `metricPeriodValue()`  [INFERRED]
  docs/SCORING.md → src/features/tracking/domain.ts
- `Phases E–G implementation decisions` --references--> `ChartFrame()`  [INFERRED]
  docs/UI_REFINEMENT_PLAN.md → src/components/presentation/stat-summary.tsx
- `Implemented shared presentation contracts (Phases B–D)` --references--> `DestinationRow()`  [INFERRED]
  DESIGN.md → src/components/presentation/surfaces.tsx
- `6. Shared component strategy` --references--> `DestinationRow()`  [INFERRED]
  docs/UI_REFINEMENT_PLAN.md → src/components/presentation/surfaces.tsx

## Import Cycles
- None detected.

## Communities (80 total, 25 thin omitted)

### Community 0 - "Button"
Cohesion: 0.05
Nodes (102): 10. Regression risks, 3. Current UI findings, Architecture and dependencies, Interface inconsistencies and hierarchy, react, ErrorPage(), metadata, MetricsPage() (+94 more)

### Community 1 - "tracking/actions.ts"
Cohesion: 0.06
Nodes (64): MetricLogger(), MetricLoggerProps, MetricLoggerState(), add(), replace(), archiveChallenge(), archiveFrequencyTarget(), archiveHabit() (+56 more)

### Community 2 - "vitest"
Cohesion: 0.09
Nodes (8): @electric-sql/pglite, vitest, foundationDatabase(), asOwner(), fixture(), receipts, tables, trackingTables

### Community 3 - "insights/domain.ts"
Cohesion: 0.16
Nodes (20): Interval, intervals(), nextLocalMidnight(), studyCategorySeconds(), studyCoverage, studyDay, studySessionDays(), base (+12 more)

### Community 4 - "career/actions.ts"
Cohesion: 0.11
Nodes (32): call(), CareerState, controlFocusTimer(), failure(), presentTimer(), readActiveTimer(), RpcError, RpcName (+24 more)

### Community 5 - "20261001004511_core_tracking.sql"
Cohesion: 0.06
Nodes (9): frequency_rules_no_overlap, habit_log_revision, metric_log_revision, metric_targets_no_overlap, preferences_challenge_owner, public.challenges, public.habits, schedules_no_overlap (+1 more)

### Community 6 - "surfaces.tsx"
Cohesion: 0.19
Nodes (11): links, metadata, MorePage(), links, metadata, PlanPage(), links, metadata (+3 more)

### Community 7 - "tracking/domain.ts"
Cohesion: 0.18
Nodes (31): Insights — Phase 6 (implemented), CareerPage(), metadata, datesBetween(), activeOn(), aggregate(), associationReason(), challenge() (+23 more)

### Community 8 - "Skeleton"
Cohesion: 0.12
Nodes (16): Loading(), Loading(), ChallengesLoading(), Loading(), Loading(), Loading(), HabitsLoading(), InsightsLoading() (+8 more)

### Community 9 - "20261001104654_planning.sql"
Cohesion: 0.14
Nodes (21): goal_milestones_owner_goal, goals_category_owner, goals_challenge_owner, goals_metric_owner, goals_owner_status, goals_revision, milestones_revision, public.goal_milestones (+13 more)

### Community 10 - "dates.ts"
Cohesion: 0.22
Nodes (16): parseInsightsFilters(), single(), CalendarPeriod, calendarString(), calendarTimestamp(), DateRange, daysBetween(), isBusinessDate() (+8 more)

### Community 11 - "Phases B–D implementation decisions and evidence"
Cohesion: 0.27
Nodes (19): Implemented shared presentation contracts (Phases B–D), 5. Design-system decisions, 6. Shared component strategy, Phases B–D implementation decisions and evidence, InlineFeedback(), ChartFrame(), CoverageLabel(), StatSummary() (+11 more)

### Community 12 - "20261001044053_fitness.sql"
Cohesion: 0.14
Nodes (20): exercises_owner_name_active, public.copy_fitness_workout(), public.exercises, public.save_fitness_sleep(), public.save_fitness_workout(), public.sleep_logs, public.workout_exercises, public.workout_operations (+12 more)

### Community 13 - "20261001052104_career.sql"
Cohesion: 0.13
Nodes (17): focus_timers_category_owner, focus_timers_challenge_owner, focus_timers_one_active, focus_timers_revision, public.focus_timers, public.save_study_category(), public.save_study_session(), public.setup_career() (+9 more)

### Community 14 - "planning/actions.ts"
Cohesion: 0.08
Nodes (39): call(), carryPlanningTasks(), failure(), RpcError, RpcName, saved(), saveGoalMilestone(), savePlanningGoal() (+31 more)

### Community 15 - "package.json"
Cohesion: 0.09
Nodes (23): eslintConfig, engines, node, name, private, type, version, eslint (+15 more)

### Community 16 - "challenge-pages.tsx"
Cohesion: 0.23
Nodes (14): ChallengePage(), metadata, ChallengesPage(), metadata, ChallengeArchiveButton(), ChallengeEditor(), DeleteChallengeDialog(), SelectChallengeButton() (+6 more)

### Community 17 - "fitness/actions.ts"
Cohesion: 0.10
Nodes (29): call(), copyWorkout(), deleteWorkout(), failure(), FitnessState, RpcError, RpcName, saveExercise() (+21 more)

### Community 18 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 21 - "MASTER_SPEC.md"
Cohesion: 0.04
Nodes (52): 10. HABIT SYSTEM, 11. HABIT GRID, 12. STREAK SYSTEM, 14. WORKOUT LOGGING, 15. CAREER TRACKER, 16. STUDY TIMER, 17. CAREER ANALYTICS, 18. WEEKLY TASK SYSTEM (+44 more)

### Community 22 - "tracking/types.ts"
Cohesion: 0.05
Nodes (44): category, dailyPolicy, item(), owner, protein, snapshot(), target, weeklyPolicy (+36 more)

### Community 23 - "20260930180649_foundation.sql"
Cohesion: 0.18
Nodes (12): areas_updated, categories_owner_area, categories_updated, life_areas_owner_position, on_auth_user_created, preferences_updated, profiles_updated, public.categories (+4 more)

### Community 24 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 25 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, class-variance-authority, clsx, geist, lucide-react, next, next-themes, radix-ui (+9 more)

### Community 26 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @axe-core/playwright, @electric-sql/pglite, eslint, @eslint/compat, eslint-config-next, @playwright/test, shadcn (+8 more)

### Community 27 - "today/page.tsx"
Cohesion: 0.26
Nodes (11): groups, metadata, TodayPage(), ChallengeSwitcher(), HabitLogger(), inclusiveChallengeProgress(), parseDateQuery(), PrivacyContext (+3 more)

### Community 28 - "lucide-react"
Cohesion: 0.39
Nodes (6): lucide-react, AuthLayout(), WorkspaceLayout(), Brand(), LogoutButton(), FocusTimer

### Community 29 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 31 - "Implementation roadmap and phase gates"
Cohesion: 0.09
Nodes (23): 1A — Scaffold and shared system, 1B — Database and authentication, 2A — Challenges and optional starter setup, 2B — Habits and grid, 2C — Metrics and frequency, 2D — Today and scoring, Acceptance gate, Acceptance gate (+15 more)

### Community 32 - "auth-form.tsx"
Cohesion: 0.05
Nodes (62): @supabase/ssr, @supabase/supabase-js, headers, POST(), reply(), dynamic, GET(), headers (+54 more)

### Community 33 - "Database conventions"
Cohesion: 0.10
Nodes (20): Account and organization — Phase 1, Application boundaries, Architecture, data model, and interface contract, Authentication and security, Career — Phase 4 (implemented), Challenges and core tracking — Phase 2, Component responsibilities, Data flow (+12 more)

### Community 34 - "Winter Arc OS — UI/UX refinement plan"
Cohesion: 0.18
Nodes (11): 11. Validation checklist, 12. Progress/status section, 1. Goals, 2. Non-goals, 4. Approved design direction, 8. Implementation phases A–G, 9. Acceptance criteria for each phase, Component adoption cancellation — October 2, 2026 (+3 more)

### Community 35 - "app/layout.tsx"
Cohesion: 0.23
Nodes (8): next-themes, dynamic, geist, metadata, RootLayout(), viewport, Connectivity(), ThemeProvider()

### Community 37 - "habit-page.tsx"
Cohesion: 0.24
Nodes (11): HabitsPage(), metadata, HabitArchiveButton(), HabitPage(), habitSummary(), monthTitle(), Query, scheduleForEditor() (+3 more)

### Community 38 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:reset, db:start, dev, lint, start, test (+3 more)

### Community 39 - "Verification record"
Cohesion: 0.09
Nodes (22): Browser flows and presentation, Component adoption rollback — October 2, 2026, Database security matrix, Documentation verification, Domain cases, Phase 0 — September 30, 2026, Phase 1 — September 30, 2026, Phase 2 validation and hosted migration — October 1, 2026 (+14 more)

### Community 40 - "cn"
Cohesion: 0.14
Nodes (17): 7. Watermelon/shadcn usage rules, class-variance-authority, clsx, radix-ui, tailwind-merge, Tone, tones, desktopGroups (+9 more)

### Community 41 - "PageHeader"
Cohesion: 0.06
Nodes (69): nextConfig, next, metadata, StudySessionsPage(), metadata, WorkoutPage(), metadata, WorkoutsPage() (+61 more)

### Community 42 - "Winter Arc OS — product requirements"
Cohesion: 0.11
Nodes (18): Accessibility and inclusion, Brand commitments, Constraints and later work, Data controls and installation decisions — Phase 8, Date, history, and privacy expectations, Evidence on hand, Operating context, Optional starter definitions (+10 more)

### Community 43 - "20261001160428_reflection.sql"
Cohesion: 0.31
Nodes (6): monthly_reflections_owner_recent, public.monthly_reflections, public.save_monthly_reflection(), public.save_weekly_review(), public.weekly_reviews, weekly_reviews_owner_recent

### Community 49 - "Scheduling, adherence, and scoring"
Cohesion: 0.13
Nodes (15): Calendar and effective rules, Daily score, Duplicate-source exclusion, Frequency and partial periods, Habit schedules and states, Insights comparison semantics, Monthly evaluation, Raw metrics (+7 more)

### Community 65 - "Winter Arc OS"
Cohesion: 0.15
Nodes (13): Commands, Current delivery, Data controls and recovery, Documentation, Hosted configuration, Install and run, Installation and offline behavior, Later features (+5 more)

### Community 66 - "insight-view.tsx"
Cohesion: 0.33
Nodes (9): InsightPoint, InsightReport, InsightsFilters, Heatmap(), InsightView(), MetricCard(), number(), shade() (+1 more)

### Community 69 - "52. DEVELOPMENT PROCESS"
Cohesion: 0.20
Nodes (10): 52. DEVELOPMENT PROCESS, PHASE 1 — FOUNDATION, PHASE 2 — CORE TRACKING, PHASE 3 — FITNESS, PHASE 4 — CAREER, PHASE 5 — PLANNING, PHASE 6 — INSIGHTS, PHASE 7 — REFLECTION (+2 more)

### Community 71 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 73 - "fitness/page.tsx"
Cohesion: 0.35
Nodes (11): FitnessPage(), metadata, averageRecorded(), FitnessPoint, metricByStarterKey(), metricSeries(), RecordedAverage, weightAverages() (+3 more)

### Community 75 - "Winter Arc OS — project operating instructions"
Cohesion: 0.29
Nodes (7): Current state, Database and command discipline, Engineering invariants, Git and handoffs, Phase workflow, Start here, Winter Arc OS — project operating instructions

### Community 76 - "13. FITNESS TRACKER"
Cohesion: 0.29
Nodes (7): 13. FITNESS TRACKER, Body Weight, Creatine, Protein, Sleep, Steps / Walking, Water

### Community 77 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

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

### Community 86 - "zod"
Cohesion: 0.18
Nodes (8): zod, date, monthlyReflectionSchema, rating, revision, text, weeklyReviewSchema, sessionSchema

### Community 89 - "Winter Arc OS — design direction"
Cohesion: 0.15
Nodes (14): Component adoption cancelled, Feature, mobile, and accessibility refinements (Phases E–G), Implementation recording checklist, Interaction conventions, Navigation and responsive behavior, Privacy and analytics, Status, Task and hierarchy (+6 more)

## Knowledge Gaps
- **521 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+516 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 659 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Winter Arc OS — UI/UX refinement plan` connect `Winter Arc OS — UI/UX refinement plan` to `Button`, `Phases B–D implementation decisions and evidence`, `cn`, `AGENTS.md`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `next` connect `PageHeader` to `auth-form.tsx`, `Button`, `insight-view.tsx`, `app/layout.tsx`, `career/actions.ts`, `habit-page.tsx`, `surfaces.tsx`, `tracking/domain.ts`, `cn`, `fitness/page.tsx`, `tracking/actions.ts`, `planning/actions.ts`, `package.json`, `challenge-pages.tsx`, `fitness/actions.ts`, `today/page.tsx`, `lucide-react`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `Button()` connect `Button` to `auth-form.tsx`, `tracking/actions.ts`, `career/actions.ts`, `habit-page.tsx`, `tracking/domain.ts`, `cn`, `fitness/page.tsx`, `PageHeader`, `Phases B–D implementation decisions and evidence`, `challenge-pages.tsx`, `fitness/actions.ts`, `today/page.tsx`, `lucide-react`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Button()` (e.g. with `10. Regression risks` and `7. Watermelon/shadcn usage rules`) actually correct?**
  _`Button()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `PageHeader()` (e.g. with `Implemented shared presentation contracts (Phases B–D)` and `6. Shared component strategy`) actually correct?**
  _`PageHeader()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _521 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.05313439244310863 - nodes in this community are weakly interconnected._