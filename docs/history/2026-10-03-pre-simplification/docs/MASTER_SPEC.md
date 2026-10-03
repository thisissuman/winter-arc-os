# WINTER ARC OS — MASTER BUILD SPECIFICATION

You are acting as the senior product engineer, frontend architect, UX designer, database architect, and QA engineer for this project.

Build a production-quality personal performance and habit-tracking web application called:

# Winter Arc OS

This is NOT a clone of any existing commercial product.

You may use common productivity-app UX concepts such as habit grids, streaks, progress rings, goal tracking, dashboards, heatmaps, weekly planning, and analytics, but the architecture, visual design, copy, components, database schema, and implementation must be original.

The application is primarily being built for one user but must have a clean multi-user-safe architecture.

Do not build a toy/demo application.

Build something polished enough that it can genuinely be used every day.

---

# 1. PRODUCT PURPOSE

Winter Arc OS is a personal operating system for tracking:

1. Fitness
2. Muscle-building progress
3. Nutrition
4. Career/interview preparation
5. Daily habits
6. Discipline
7. Weekly tasks
8. Goals
9. Focus/productivity
10. Personal reflection

The current primary challenge is:

Winter Arc 2026

Start:
September 1, 2026

End:
December 1, 2026

However, DO NOT hard-code the application exclusively around these dates.

The architecture must support creating future:

- seasons
- challenges
- phases
- personal arcs

Examples:

Winter Arc 2026
Interview Sprint
Wedding Prep
Cut Phase
AI Engineering Sprint

Each challenge has:

- title
- description
- start date
- end date
- goals
- habits
- metrics
- optional color/icon
- status

---

# 2. PRIMARY USER CONTEXT

The initial user is:

- frontend engineer
- works from home
- usually works around 11 AM–8 PM
- trains in the gym around 4 days/week
- current body weight approximately 65 kg
- muscle-gain focused
- interview preparation focused
- wants better discipline and consistency

Primary fitness objectives:

- build muscle
- monitor body weight
- hit daily protein targets
- take creatine consistently
- stay hydrated
- train approximately 4 days/week
- track sleep
- optionally track walking/steps

Primary career objectives:

- prepare for senior frontend/full-stack interviews
- improve JavaScript
- improve TypeScript
- React
- Next.js
- Frontend System Design
- DSA
- Python
- AI Engineering
- mock interviews
- portfolio/project work
- job applications later

Do not hard-code these categories.

Allow the user to manage them.

Seed them for the initial account.

---

# 3. CORE DESIGN PRINCIPLE

Do NOT reduce everything to checkboxes.

There are three distinct tracking concepts:

## HABIT

Binary or recurring behavior.

Examples:

- Creatine
- Meditation
- Morning routine
- Porn-free
- Read
- Stammering practice

Can be:

- daily
- certain weekdays
- X times per week
- X times per month

---

## TARGET

A frequency-based goal.

Example:

Gym:
4 sessions/week

Interview study:
5 sessions/week

Walking:
5 days/week

---

## METRIC

Numerical tracking.

Examples:

Protein:
126 / 130 g

Water:
3.1 / 3.5 L

Study:
135 / 150 minutes

Sleep:
7.2 hours

Body Weight:
65.6 kg

Steps:
7420

Calories:
2500 kcal

Metrics MUST retain their raw values so analytics are meaningful.

---

# 4. TECH STACK

Use modern stable versions available at implementation time.

Required:

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security
- Recharts for charts
- Lucide icons
- Zod
- React Hook Form where appropriate
- npm as package manager

Use Server Components where beneficial.

Use Client Components only when interactivity requires them.

Use Supabase's currently recommended SSR/cookie-based authentication architecture.

Do not use deprecated Supabase auth helpers.

---

# 5. APPLICATION ARCHITECTURE

Use a clean maintainable folder structure.

Prefer something similar to:

src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
    ui/
    dashboard/
    habits/
    fitness/
    career/
    tasks/
    goals/
    insights/
  features/
  lib/
    supabase/
    analytics/
    scoring/
    validation/
  hooks/
  types/
  constants/

Do not create unnecessary abstraction.

Keep feature logic close to the feature where practical.

---

# 6. AUTHENTICATION

Implement:

- signup
- login
- logout
- password reset
- persistent sessions

Optional later:

- Google OAuth

Do not make OAuth a blocking requirement.

Use Supabase Auth.

Every user-owned table MUST have secure RLS policies.

Users must never be able to read another user's private data.

---

# 7. APP NAVIGATION

Desktop:

Use a premium sidebar.

Suggested sections:

Today

Track
- Habits
- Fitness
- Career

Plan
- Tasks
- Goals

Insights

Reflection

More
- Challenges
- Settings

Mobile bottom navigation:

Today
Track
Plan
Insights
More

Use responsive routing.

Desktop and mobile should both feel first-class.

---

# 8. TODAY DASHBOARD

This is the main page.

It must answer:

"What should I do today?"

Top header:

WINTER ARC

Show:

Day X / Y

Example:

Day 30 / 92

Progress bar:

32%

Show current challenge.

---

## TODAY SCORE

Display:

Winter Arc Score

Example:

82 / 100

This score should NOT be arbitrary.

Create a configurable weighted scoring system.

Suggested default weighting:

Fitness: 30%
Career: 30%
Sleep/recovery: 15%
Nutrition: 15%
Discipline: 10%

Do not penalize users for habits that are not scheduled that day.

Document the scoring formula.

---

# 9. TODAY SECTIONS

Example:

Morning

Wake target
Creatine
Meditation
Gym
Breakfast

Fitness

Protein:
112 / 130g

Water:
2.6 / 3.5L

Steps:
6420 / 8000

Weight:
65.8kg

Gym:
Completed

Career

Study:
1h45 / 2h30

React:
45 min

Python:
40 min

DSA:
20 min

Discipline

Screen time target
Gaming limit
Private habits
Sleep target

Use polished cards with quick inputs.

The page should support extremely fast logging.

---

# 10. HABIT SYSTEM

Create/edit/delete/archive habits.

Fields:

- name
- description
- icon
- category
- frequency
- target count
- weekdays
- time of day
- active date range
- difficulty/weight
- privacy flag
- challenge association
- archived flag

Frequency types:

DAILY

WEEKDAYS

SPECIFIC_DAYS

TIMES_PER_WEEK

TIMES_PER_MONTH

CUSTOM

Habit status:

completed
missed
skipped
not-required

---

# 11. HABIT GRID

Build a GitHub-like/monthly habit matrix.

Rows:
habits

Columns:
dates

Clearly distinguish:

completed
missed
not scheduled
today
future

Support month navigation.

Desktop:
full matrix.

Mobile:
horizontal scrolling or compact layout.

Click/tap a cell to update the habit.

---

# 12. STREAK SYSTEM

Track:

- current streak
- longest streak
- weekly consistency
- monthly consistency

Do not make streaks the primary success metric.

For frequency habits like:

Gym 4x/week

the relevant measure should be:

3 / 4 sessions

not:

3-day streak.

Optional freeze tokens can be implemented later.

Structure the schema so freezes can be added without redesign.

---

# 13. FITNESS TRACKER

Fitness dashboard should contain:

## Body Weight

Input weight.

Display:

daily values
7-day moving average
weekly average
trend

Graph weight history.

---

## Protein

Daily protein goal.

Default:
130g

Editable.

Display:

grams consumed
goal
percentage

Charts:

daily protein
weekly adherence

---

## Water

Daily water goal.

Default:
3.5L

Editable.

Quick buttons:

+250 ml
+500 ml

Also allow manual entry.

---

## Creatine

Simple daily habit.

Default:
3g/day

Allow dosage configuration.

---

## Sleep

Log:

sleep time
wake time

or simply:

hours slept

Optional:

sleep quality 1–5.

---

## Steps / Walking

Track steps manually initially.

Allow daily walking goal.

Do not integrate external wearable APIs in V1.

---

# 14. WORKOUT LOGGING

Include lightweight workout tracking.

Do NOT attempt to replace Hevy/Strong.

Workout session:

- date
- workout name
- duration
- notes

Exercise:

- name
- muscle group

Set:

- set number
- weight
- reps
- optional RPE

Allow copying previous workout.

Track progressive overload history.

Keep this secondary to the core dashboard.

---

# 15. CAREER TRACKER

Career preparation is a major feature.

Default study categories:

JavaScript
TypeScript
React
Next.js
Frontend System Design
DSA
Python
AI Engineering
Mock Interview
Portfolio
Applications

Allow custom categories.

Study session:

- category
- start time
- end time
- duration
- notes
- optional topic
- challenge

Support:

manual duration entry

and

built-in study timer.

---

# 16. STUDY TIMER

Build a simple focus timer.

Modes:

stopwatch

optional Pomodoro later.

Timer must:

persist if user navigates between pages
not lose active state after accidental refresh if feasible
save completed session

Show today:

1h 45m / 2h 30m

Show weekly:

8h 20m / 12h

---

# 17. CAREER ANALYTICS

Charts:

study minutes/day
study hours/week
category distribution
weekly target completion
30-day consistency

Example:

React 32%
System Design 20%
Python 18%
DSA 15%
Other 15%

---

# 18. WEEKLY TASK SYSTEM

Build a 7-day weekly planner.

Each day has tasks.

Task fields:

- title
- notes
- date
- status
- priority
- category
- estimated duration
- actual duration
- optional goal association
- optional challenge association

Features:

add task
complete task
edit
delete
drag/reorder if practical
copy yesterday's unfinished tasks
move unfinished tasks to tomorrow

Do not build a massive Jira-style project manager.

Keep it personal.

---

# 19. GOALS

Goal fields:

- title
- description
- category
- target date
- challenge
- status
- progress type

Progress types:

manual percentage
milestones
metric based

Examples:

Gain muscle

Complete 50 interview problems

Finish React System Design prep

Build AI project

Each goal supports milestones.

---

# 20. LIFE AREAS

Allow flexible user-created areas.

Seed:

Health
Career
Learning
Finance
Relationships
Mindset
Creativity

Do not force exactly 10 areas.

---

# 21. INSIGHTS DASHBOARD

This should be one of the strongest parts of the product.

Show:

Overall consistency

Winter Arc score trend

Habit completion %

Fitness consistency

Career study hours

Protein adherence

Sleep average

Gym weekly target

Body-weight trend

Study category breakdown

Strongest habits

Most frequently missed habits

Week-over-week comparison

---

# 22. HEATMAP

Create GitHub-style consistency heatmaps.

Views:

overall consistency
fitness
career
habits

Intensity represents completion score.

Tooltip:

date
score
completed targets

---

# 23. WEEKLY REVIEW

At the end of each week allow review.

Fields:

Wins

What went wrong

What I learned

What should change next week

Energy:
1–5

Focus:
1–5

Motivation:
1–5

Optional:
stress
mood

---

# 24. MONTHLY REFLECTION

Fields:

Biggest wins

Biggest failures

Habits that improved

Habits that slipped

Fitness progress

Career progress

What to change

Freeform notes

Also automatically show monthly statistics beside the reflection.

---

# 25. PRIVATE HABITS

Some habits are personal.

Add:

is_private

Private items:

should be hideable from dashboard

should be obscurable using a "Privacy Mode"

Privacy Mode should hide sensitive labels.

For example:

"Porn-free"

could render:

"Private Habit"

when privacy mode is enabled.

---

# 26. CHALLENGES / SEASONS

Users must be able to create a challenge.

Fields:

name
description
start date
end date
theme
goals

Dashboard should show:

Day X / Y

days remaining

completion %

Allow:

active
completed
upcoming
archived

---

# 27. DEFAULT WINTER ARC SEED DATA

For the initial account, prepare optional seed data.

Daily:

Creatine
Protein target
Water target
Meditation
Stammering practice
Sleep target

Weekly:

Gym 4x
Career study 5x
Walking 5x

Career targets:

JavaScript
TypeScript
React
Next.js
Frontend System Design
DSA
Python
AI Engineering

Make seed data easy to delete or edit.

---

# 28. VISUAL DESIGN

Design language:

premium
minimal
dark-first
clean
mature
high-information-density without clutter

Inspiration direction:

Linear
Raycast
Vercel
modern fitness dashboards

Do NOT copy these products.

Use them only as general quality inspiration.

Avoid:

excessive gradients
neon cyberpunk
"alpha/sigma" gym aesthetic
huge glassmorphism
childish gamification
visual noise

---

# 29. COLOR SYSTEM

Dark mode first.

Background:
near-black / deep charcoal

Cards:
slightly elevated charcoal

Primary accent:
cool violet / indigo

Success:
subtle green

Warning:
amber

Error:
red

Use semantic CSS variables.

Also implement a polished light theme.

---

# 30. TYPOGRAPHY

Use a modern readable font.

Consider:

Geist

Use strong hierarchy.

Avoid giant marketing-style headings inside the application.

This is a productivity tool.

---

# 31. UI DETAILS

Use:

Cards
Tabs
Progress bars
Circular progress
Tooltips
Command palette if useful
Skeleton loaders
Empty states
Toast notifications
Dialog/drawer patterns
Responsive sheets on mobile

Animations should be subtle.

Use motion only where it improves feedback.

Do NOT introduce animation libraries unless genuinely useful.

---

# 32. MOBILE UX

This app MUST work extremely well on a phone.

Primary daily actions should require minimal taps.

Use:

bottom navigation
bottom sheets
large tap targets
quick-add controls
sticky relevant actions

Do not simply shrink desktop layouts.

---

# 33. PWA

Make the app installable.

Implement:

manifest
icons placeholders
theme colors
basic offline shell where practical

Do not over-engineer full offline database synchronization for V1.

---

# 34. DATABASE

Design normalized Supabase/PostgreSQL tables.

Likely entities include:

profiles

challenges

habits
habit_schedules
habit_logs

metric_definitions
metric_logs

workouts
workout_exercises
workout_sets

study_categories
study_sessions

tasks

goals
goal_milestones

weekly_reviews
monthly_reflections

user_preferences

You may improve this schema.

Use:

UUID primary keys

created_at

updated_at

user_id

appropriate indexes

foreign keys

constraints

enums only where genuinely useful

---

# 35. DATABASE MIGRATIONS

Keep SQL migrations under:

supabase/migrations

Create:

tables
indexes
triggers
RLS
policies

Never ask the developer to manually create tables one by one through the dashboard.

Everything should be reproducible.

---

# 36. ROW LEVEL SECURITY

RLS is mandatory.

Every private table must have policies based on:

auth.uid() = user_id

For child records where user_id is absent, enforce access through parent ownership or preferably include user_id when it simplifies secure RLS.

Security correctness takes priority over theoretical normalization.

---

# 37. TYPE SAFETY

Avoid:

any

unless absolutely justified.

Generate or maintain Supabase DB types.

Use Zod validation.

Share schemas where appropriate between form validation and server actions/API boundaries.

---

# 38. STATE MANAGEMENT

Do NOT add Redux automatically.

Prefer:

Server Components
URL state
local React state
React Context where useful

Only introduce a global state library if a demonstrated need exists.

For the timer, a lightweight context or dedicated store is acceptable.

Do not over-engineer.

---

# 39. DATA FETCHING

Prefer secure server-side data fetching where appropriate.

Avoid unnecessary client-side waterfalls.

Use optimistic updates where UX benefits significantly, such as:

habit completion

water quick-add

task completion

---

# 40. ANALYTICS CALCULATIONS

Create reusable functions for:

daily score

weekly score

habit consistency

metric adherence

challenge progress

study totals

gym weekly frequency

protein adherence

sleep averages

streaks

Keep analytics logic outside presentation components.

Write tests for important calculations.

---

# 41. SCORE LOGIC

Do not simply count completed checkboxes.

Score metrics based on percentage adherence.

Example:

Protein target:
126 / 130 = 96.9%

Cap completion contribution at 100 unless explicitly configured otherwise.

Frequency targets:

Gym:
3 / 4 = 75%

Habit:
complete = 100%
missed = 0%

Not scheduled:
excluded.

Weighted total produces daily/weekly score.

---

# 42. TESTING

Implement practical testing.

At minimum test:

scoring
streak calculations
weekly frequency calculations
study duration aggregation
metric adherence

Use the modern testing approach appropriate for the chosen stack.

Do not chase meaningless coverage percentages.

---

# 43. ERROR HANDLING

Provide:

error boundaries
user-friendly errors
loading states
empty states

Database failures should not silently fail.

---

# 44. ACCESSIBILITY

Use semantic HTML.

Keyboard accessible controls.

Proper labels.

Focus states.

ARIA only where necessary.

Reasonable color contrast.

---

# 45. PERFORMANCE

Avoid unnecessary Client Components.

Avoid giant dependencies.

Lazy load heavy charts where sensible.

Optimize mobile performance.

Avoid premature optimization.

---

# 46. SETTINGS

Settings page:

Profile

Appearance

Daily targets

Fitness targets

Career targets

Privacy mode

Challenge settings

Habit management

Export data

Delete data/account

---

# 47. EXPORT

Allow exporting personal data as JSON.

Optional CSV exports:

habit logs
metrics
study sessions
weight

No import required for initial V1 unless easy.

---

# 48. AI FEATURES

DO NOT make V1 dependent on an AI API.

Prepare architecture for later features like:

weekly AI review

habit failure analysis

study recommendation

next-week planning

But do not require OpenAI/Anthropic/etc.

The app must be fully useful with zero AI cost.

---

# 49. CODE QUALITY

Strict requirements:

No fake mock APIs in final implementation.

No TODO-filled unfinished pages presented as complete.

No hard-coded user IDs.

No duplicated business logic.

No giant 1000-line components.

No needless abstraction.

No deprecated packages.

No insecure Supabase service role usage in the browser.

No secrets committed to Git.

No fake analytics.

No placeholder buttons that do nothing.

---

# 50. ENVIRONMENT VARIABLES

Create:

.env.example

Include required names.

Never insert real secrets.

Document setup in README.

---

# 51. README

README must include:

Project overview

Stack

Architecture

Local setup

Supabase setup

Environment variables

Running migrations

Running development server

Testing

Production build

Deployment to Vercel

PWA notes

Database overview

---

# 52. DEVELOPMENT PROCESS

Do NOT attempt the entire application in one uncontrolled coding pass.

Work in phases.

## PHASE 1 — FOUNDATION

First:

1. inspect repository
2. scaffold application
3. configure dependencies
4. setup design system
5. setup Supabase clients
6. create database migrations
7. auth
8. protected layout
9. sidebar/mobile nav
10. base dashboard shell

Verify:

npm install
npm run lint
npm run build

Fix all failures.

Commit logically if git operations are available.

---

## PHASE 2 — CORE TRACKING

Implement:

Challenges

Habits

Habit schedules

Habit logs

Metrics

Today Dashboard

Scoring engine

Habit Grid

---

## PHASE 3 — FITNESS

Implement:

Weight

Protein

Water

Creatine

Sleep

Steps

Charts

Workout logger

---

## PHASE 4 — CAREER

Implement:

Study categories

Study sessions

Timer

Career targets

Study analytics

---

## PHASE 5 — PLANNING

Implement:

Weekly tasks

Goals

Milestones

---

## PHASE 6 — INSIGHTS

Implement:

Insights dashboard

Heatmaps

Weekly comparisons

Consistency calculations

Strongest/weakest habits

---

## PHASE 7 — REFLECTION

Implement:

Weekly reviews

Monthly reflection

Mindset scores

---

## PHASE 8 — POLISH

Implement:

PWA

responsive improvements

empty states

animations

light theme

privacy mode

export

accessibility pass

performance pass

---

## PHASE 9 — FINAL QA

Run:

lint

typecheck

tests

production build

Review browser console errors.

Review mobile layout.

Review desktop layout.

Review database security.

Fix issues instead of merely documenting them.

---

# 53. IMPORTANT CODEX BEHAVIOR

You are expected to actively build and verify the software.

Do not repeatedly ask the user:

"Should I continue?"

"Do you want me to implement the next component?"

"Which option do you prefer?"

When implementation details are ambiguous, choose the solution most aligned with:

simplicity
maintainability
security
modern best practices
good UX

Record notable decisions in documentation.

Only ask the user when a decision genuinely cannot reasonably be inferred.

---

# 54. FIRST ACTION

Start by inspecting the repository.

If it is empty:

scaffold the project using the modern stable Next.js setup with:

TypeScript
App Router
Tailwind
src directory
ESLint
npm

Then configure shadcn/ui.

Then create the application foundation described in Phase 1.

Do not merely return instructions.

Actually modify the repository.

After Phase 1 is complete:

run all appropriate validation commands.

Fix errors.

Then provide a concise report containing:

what was created

important architectural decisions

commands executed

database setup required from the developer

environment variables still needed

next phase

Do not proceed into massive feature implementation until Phase 1 is stable.