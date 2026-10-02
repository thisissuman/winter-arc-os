# Graph Report - winter-arc-os  (2026-10-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1170 nodes · 3265 edges · 65 communities (46 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `96e000e3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Button
- tracking/actions.ts
- vitest
- requireAccount
- career/actions.ts
- 20261001004511_core_tracking.sql
- fitness/page.tsx
- tracking/domain.ts
- Skeleton
- 20261001104654_planning.sql
- insights/domain.ts
- PageHeader
- 20261001044053_fitness.sql
- 20261001052104_career.sql
- planning/actions.ts
- package.json
- today/page.tsx
- workout-editor.tsx
- components.json
- auth/actions.ts
- @playwright/test
- planning/types.ts
- tracking/types.ts
- 20260930180649_foundation.sql
- compilerOptions
- dependencies
- devDependencies
- database.ts
- delete/route.ts
- isSupabaseConfigured
- insights/domain.test.ts
- tracking/domain.test.ts
- challenge-pages.tsx
- fitness/validation.ts
- reflection/actions.ts
- app/layout.tsx
- planning/queries.ts
- habit-page.tsx
- scripts
- env.ts
- career/domain.ts
- next
- task-forms.tsx
- 20261001160428_reflection.sql
- data/page.tsx
- 20261002004151_data_controls.sql
- public.save_fitness_workout
- public.save_fitness_workout
- 20261001044323_fitness_owner_indexes.sql
- lucide-react
- public.carry_planning_tasks
- goal_milestones_goal_owner
- score_items_policy_category
- categories_area_owner
- bootstrap.sql
- postcss.config.mjs
- sw.js

## God Nodes (most connected - your core abstractions)
1. `Button()` - 87 edges
2. `next` - 56 edges
3. `FormFeedback()` - 53 edges
4. `requireAccount` - 53 edges
5. `PageHeader()` - 48 edges
6. `TrackingUnavailable()` - 38 edges
7. `FormField()` - 36 edges
8. `addDays()` - 34 edges
9. `react` - 33 edges
10. `loadTrackingSnapshot()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `LogoutButton()` --indirect_call--> `logout()`  [INFERRED]
  src/components/shell/logout-button.tsx → src/features/auth/actions.ts
- `CareerSetupForm()` --indirect_call--> `setupCareer()`  [INFERRED]
  src/features/career/career-forms.tsx → src/features/career/actions.ts
- `StudyCategoryForm()` --indirect_call--> `saveStudyCategory()`  [INFERRED]
  src/features/career/career-forms.tsx → src/features/career/actions.ts
- `StudySessionForm()` --indirect_call--> `saveStudySession()`  [INFERRED]
  src/features/career/career-forms.tsx → src/features/career/actions.ts
- `ChallengeForm()` --indirect_call--> `saveChallenge()`  [INFERRED]
  src/features/challenges/challenge-forms.tsx → src/features/tracking/actions.ts

## Import Cycles
- None detected.

## Communities (65 total, 19 thin omitted)

### Community 0 - "Button"
Cohesion: 0.06
Nodes (89): class-variance-authority, radix-ui, react, ErrorPage(), metadata, SettingsPage(), metadata, periods (+81 more)

### Community 1 - "tracking/actions.ts"
Cohesion: 0.06
Nodes (62): zod, HabitLoggerProps, HabitLoggerState(), save(), LoggedState, add(), archiveChallenge(), archiveFrequencyTarget() (+54 more)

### Community 2 - "vitest"
Cohesion: 0.09
Nodes (8): @electric-sql/pglite, vitest, foundationDatabase(), asOwner(), fixture(), receipts, tables, trackingTables

### Community 3 - "requireAccount"
Cohesion: 0.11
Nodes (35): metadata, MonthlyReflectionPage(), metadata, ReflectionPage(), metadata, WeeklyReviewPage(), check(), getMonthlyReflection() (+27 more)

### Community 4 - "career/actions.ts"
Cohesion: 0.09
Nodes (37): WorkspaceLayout(), desktopNavigation, mobileNavigation, Navigation(), call(), CareerState, controlFocusTimer(), failure() (+29 more)

### Community 5 - "20261001004511_core_tracking.sql"
Cohesion: 0.06
Nodes (9): frequency_rules_no_overlap, habit_log_revision, metric_log_revision, metric_targets_no_overlap, preferences_challenge_owner, public.challenges, public.habits, schedules_no_overlap (+1 more)

### Community 6 - "fitness/page.tsx"
Cohesion: 0.15
Nodes (25): CareerPage(), metadata, FitnessPage(), metadata, metadata, WorkoutsPage(), averageRecorded(), exerciseProgression() (+17 more)

### Community 7 - "tracking/domain.ts"
Cohesion: 0.19
Nodes (32): habitSummary(), datesBetween(), daysBetween(), periodRange(), activeOn(), aggregate(), associationReason(), challenge() (+24 more)

### Community 8 - "Skeleton"
Cohesion: 0.12
Nodes (16): Loading(), Loading(), ChallengesLoading(), Loading(), Loading(), Loading(), HabitsLoading(), InsightsLoading() (+8 more)

### Community 9 - "20261001104654_planning.sql"
Cohesion: 0.14
Nodes (21): goal_milestones_owner_goal, goals_category_owner, goals_challenge_owner, goals_metric_owner, goals_owner_status, goals_revision, milestones_revision, public.goal_milestones (+13 more)

### Community 10 - "insights/domain.ts"
Cohesion: 0.14
Nodes (25): recharts, InsightsPage(), metadata, average(), buildInsightReport(), HabitRank, InsightPoint, InsightReport (+17 more)

### Community 11 - "PageHeader"
Cohesion: 0.12
Nodes (20): metadata, StudySessionsPage(), metadata, WorkoutPage(), links, metadata, MorePage(), metadata (+12 more)

### Community 12 - "20261001044053_fitness.sql"
Cohesion: 0.14
Nodes (20): exercises_owner_name_active, public.copy_fitness_workout(), public.exercises, public.save_fitness_sleep(), public.save_fitness_workout(), public.sleep_logs, public.workout_exercises, public.workout_operations (+12 more)

### Community 13 - "20261001052104_career.sql"
Cohesion: 0.13
Nodes (17): focus_timers_category_owner, focus_timers_challenge_owner, focus_timers_one_active, focus_timers_revision, public.focus_timers, public.save_study_category(), public.save_study_session(), public.setup_career() (+9 more)

### Community 14 - "planning/actions.ts"
Cohesion: 0.12
Nodes (26): call(), carryPlanningTasks(), failure(), movePlanningTask(), presentTask(), RpcError, RpcName, saved() (+18 more)

### Community 15 - "package.json"
Cohesion: 0.08
Nodes (24): eslintConfig, engines, node, name, private, type, version, clsx (+16 more)

### Community 16 - "today/page.tsx"
Cohesion: 0.20
Nodes (20): metadata, MetricsPage(), groups, metadata, TodayPage(), ChallengeSwitcher(), HabitLogger(), MetricLogger() (+12 more)

### Community 17 - "workout-editor.tsx"
Cohesion: 0.17
Nodes (21): call(), copyWorkout(), deleteWorkout(), failure(), FitnessState, RpcError, RpcName, saveExercise() (+13 more)

### Community 18 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 19 - "auth/actions.ts"
Cohesion: 0.19
Nodes (17): GET(), invalid(), login(), logout(), requestRecovery(), resetPassword(), signup(), unavailable (+9 more)

### Community 20 - "@playwright/test"
Cohesion: 0.14
Nodes (3): @axe-core/playwright, @playwright/test, sessionSchema

### Community 21 - "planning/types.ts"
Cohesion: 0.18
Nodes (16): carryCandidates(), orderedTasks(), goal, snapshot, GoalAggregation, GoalMilestone, GoalMode, GoalProgress (+8 more)

### Community 22 - "tracking/types.ts"
Cohesion: 0.11
Nodes (18): ActiveRecord, BusinessDate, ChallengeHabit, ChallengeMetric, ChallengeTarget, EffectiveRecord, FrequencyRule, FrequencySource (+10 more)

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

### Community 27 - "database.ts"
Cohesion: 0.13
Nodes (12): @supabase/supabase-js, CompositeTypes, Constants, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+4 more)

### Community 28 - "delete/route.ts"
Cohesion: 0.23
Nodes (11): headers, POST(), reply(), deleteWorkspaceData(), accountDeletionSchema, organizationSchema, password, workspaceDeletionSchema (+3 more)

### Community 29 - "isSupabaseConfigured"
Cohesion: 0.17
Nodes (11): dynamic, GET(), headers, metadata, RecoveryPage(), LoginPage(), metadata, metadata (+3 more)

### Community 30 - "insights/domain.test.ts"
Cohesion: 0.13
Nodes (13): category, dailyPolicy, item(), owner, protein, snapshot(), target, weeklyPolicy (+5 more)

### Community 31 - "tracking/domain.test.ts"
Cohesion: 0.12
Nodes (11): categories, dailyPolicy, habit, habitItem, metric, metricItem, owned, schedule (+3 more)

### Community 32 - "challenge-pages.tsx"
Cohesion: 0.25
Nodes (12): ChallengePage(), metadata, ChallengesPage(), metadata, ChallengeArchiveButton(), ChallengeEditor(), SelectChallengeButton(), ChallengeDetail() (+4 more)

### Community 33 - "fitness/validation.ts"
Cohesion: 0.13
Nodes (14): copyWorkoutSchema, deleteWorkoutSchema, duration, exerciseSchema, fitnessSetupSchema, note, nullableUuid, optionalIso (+6 more)

### Community 34 - "reflection/actions.ts"
Cohesion: 0.20
Nodes (13): errorMessage(), field(), ReflectionState, save(), SaveFunction, saveMonthlyReflection(), saveWeeklyReview(), date (+5 more)

### Community 35 - "app/layout.tsx"
Cohesion: 0.23
Nodes (8): next-themes, dynamic, geist, metadata, RootLayout(), viewport, Connectivity(), ThemeProvider()

### Community 36 - "planning/queries.ts"
Cohesion: 0.32
Nodes (8): GoalDetailPage(), GoalsPage(), metadata, goalProgress(), loadPlanningSnapshot(), PlanningReadTable, PlanningSetupError, Tables

### Community 37 - "habit-page.tsx"
Cohesion: 0.26
Nodes (10): HabitsPage(), metadata, HabitLogDialog(), HabitPage(), monthTitle(), Query, scheduleForEditor(), states (+2 more)

### Community 38 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:reset, db:start, dev, lint, start, test (+3 more)

### Community 39 - "env.ts"
Cohesion: 0.33
Nodes (6): @supabase/ssr, createClient(), supabaseEnvironment(), config, proxy(), Database

### Community 40 - "career/domain.ts"
Cohesion: 0.36
Nodes (9): Interval, intervals(), nextLocalMidnight(), studyCategorySeconds(), StudyCoverage, StudyDay, studySessionDays(), base (+1 more)

### Community 41 - "next"
Cohesion: 0.20
Nodes (4): nextConfig, next, metadata, ResetPage()

### Community 42 - "task-forms.tsx"
Cohesion: 0.36
Nodes (8): metadata, TasksPage(), PlanningState, CarryForm(), TaskChoices, TaskForm(), TaskRow(), TaskStatus

### Community 43 - "20261001160428_reflection.sql"
Cohesion: 0.31
Nodes (6): monthly_reflections_owner_recent, public.monthly_reflections, public.save_monthly_reflection(), public.save_weekly_review(), public.weekly_reviews, weekly_reviews_owner_recent

### Community 44 - "data/page.tsx"
Cohesion: 0.43
Nodes (6): DataSettingsPage(), metadata, DeleteAccountForm(), remove(), ExportControl(), download()

### Community 49 - "lucide-react"
Cohesion: 0.70
Nodes (3): lucide-react, AuthLayout(), Brand()

## Knowledge Gaps
- **286 isolated node(s):** `FormAction`, `Kind`, `ChallengeEditorProps`, `TrackerOption`, `CategoryOption` (+281 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 413 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `Button`, `tracking/actions.ts`, `requireAccount`, `career/actions.ts`, `fitness/page.tsx`, `insights/domain.ts`, `PageHeader`, `planning/actions.ts`, `package.json`, `today/page.tsx`, `workout-editor.tsx`, `auth/actions.ts`, `delete/route.ts`, `isSupabaseConfigured`, `challenge-pages.tsx`, `reflection/actions.ts`, `app/layout.tsx`, `planning/queries.ts`, `habit-page.tsx`, `env.ts`, `task-forms.tsx`, `data/page.tsx`, `lucide-react`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `Button()` connect `Button` to `challenge-pages.tsx`, `tracking/actions.ts`, `career/actions.ts`, `habit-page.tsx`, `fitness/page.tsx`, `insights/domain.ts`, `task-forms.tsx`, `data/page.tsx`, `today/page.tsx`, `workout-editor.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `vitest` connect `vitest` to `career/domain.ts`, `package.json`, `auth/actions.ts`, `planning/types.ts`, `insights/domain.test.ts`, `tracking/domain.test.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `FormAction`, `Kind`, `ChallengeEditorProps` to the rest of the system?**
  _286 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.061915729575938216 - nodes in this community are weakly interconnected._
- **Should `tracking/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06201923076923077 - nodes in this community are weakly interconnected._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.08603145235892692 - nodes in this community are weakly interconnected._