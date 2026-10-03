# Winter Arc OS — simple habit architecture

## Status and authority

Accepted target as of October 3, 2026. **Implemented and verified in development:** the source and configured development schema use the five-table replacement. Designs approved October 3, 2026; reset applied as version 20261003090000. The [historical architecture](history/2026-10-03-pre-simplification/docs/ARCHITECTURE.md) explains that existing implementation; [SIMPLIFICATION](SIMPLIFICATION.md) and its JSON inventory name cleanup candidates.

## Boundaries and routes

Keep Next.js App Router, React, TypeScript, npm, Tailwind, Supabase SSR/PostgreSQL, Zod, Geist, Lucide, current useful local primitives, and next-themes. Prefer Server Components for owned reads and small client components for interaction. Keep calculations outside UI components.

| Route/interface | Target |
| --- | --- |
| /today | Selected business date, eligible routine checklist, completed/required count |
| /habits | Routines/History views, habit editor, archive/delete, single-habit monthly calendar, compact weekly counts |
| /settings | Profile, preferences/privacy, export and destructive-data disclosures |
| /login, /signup, /forgot-password, /reset-password, /auth/confirm | Existing authenticated account flows |
| GET /api/export | Private format-version-2 JSON export of the five application tables |
| POST /api/account/delete | Immediately verified self-deletion; no arbitrary account target |

Root redirects to Today or Login. Fold the existing /settings/data presentation into Settings. Remove /onboarding, /track, /plan, /more, and all retired feature routes/subroutes, including /settings/organization and /settings/tracking. They return 404, rather than remaining hidden working features. Auth redirect allowlists retain only safe delivered destinations. Date/month/view/habit selection uses validated local URL parameters.

## Target public schema: five tables

Retain profiles and essential user_preferences; reset/rebuild habits, habit_schedules, habit_logs. Each habit-owned table has owner RLS; same-owner child FKs must enforce ownership independently of UI.

| Table | Minimum responsibility |
| --- | --- |
| profiles | Auth-owned display name and timestamps |
| user_preferences | Auth-owned timezone, week start, theme, global privacy, timestamps |
| habits | ID, owner, trimmed name, active_from business date, exclusive archived_from cutoff, timestamps/revision |
| habit_schedules | ID, owner, habit ID, weekday set, effective_from and exclusive effective_until dates |
| habit_logs | ID, owner, habit ID, business_date, captured timezone, completed boolean, revision, timestamps |

Daily means all seven ISO weekdays; selected days is a nonempty unique subset of 1–7. No quota enum, count target, notes, category, dosage, or metric columns. Natural uniqueness on habit/owner/date prevents duplicate check-ins. Schedule intervals cannot overlap and child relationships cannot cross owners. Give retained foreign keys covering indexes.

Drop the other 31 public tables, retired public/private routines, table triggers/policies/indexes, and obsolete preference fields: selected_challenge_id, starter_applied_on, onboarding_completed, hide_private_today. Keep only helper functions needed for ownership, timestamps/timezone validation, schedule/log integrity, and data controls.

## Focused reads and domain contracts

Replace TrackingSnapshot with request-scoped habit reads: account context, habit definitions, relevant schedule versions, and logs bounded to the requested dates. Today never reads metrics, workouts, sessions, timers, tasks, goals, reviews, policies, or challenge associations. Remove PersistentTimerBar and its shell database query.

Public domain contracts become Habit, HabitSchedule, HabitLog and the five derived date states. Completion input contains habitId, businessDate, completed, expectedRevision. Save-definition input contains only name, selected weekdays, identity/revision for edits. Archive/delete are habit-specific actions, not general definition-kind dispatch.

Validate inputs with Zod and independently verify identity/ownership on the server. Date eligibility is checked server-side, not merely by disabling controls. Queries include caller ownership even with RLS.

## Mutation behavior

Completion is an atomic desired-state write with a stable habit/date key and revision. Repeating the same already-saved desired state can return the current row without creating another entry. A conflicting stale change returns a visible conflict; don't overwrite another tab's newer value. Persist false on undo so revision handling remains meaningful. No operation-receipt table is needed for binary replacement.

Use a pending control state and authoritative saved response; failed mutations keep the prior confirmed state and offer retry. Do not present an offline change as saved. History and Today use the same evaluator.

Create definition and initial schedule transactionally starting today. Edit schedules prospectively from tomorrow; update an existing pending tomorrow version instead of inserting overlapping versions. Archive cutoff is tomorrow and preserves old schedules/logs. Permanent habit deletion cascades only that caller's owned children after explicit confirmation.

The history/date rules live in [SCORING](SCORING.md); there is no retained score engine.

## Authentication, privacy, and data controls

Keep cookie refresh in src/proxy.ts, private/no-store responses, independent getClaims()/getUser() checks, validated APP_ORIGIN, local redirects, and callback no-referrer configured headers. Keep token-hash and same-browser PKCE callbacks.

Privacy Mode masks all habit names before server rendering and client serialization, including labels in dialogs, calendar descriptions, attributes, accessible names, and errors. Creation/name editing is unavailable while privacy is enabled. Retain unsaved controlled settings input on failure.

Rewrite export_workspace_data() and deletion helpers to exactly match the five-table catalog. Export payload retains format identifier, generated_at, and data, bumps format_version from 1 to 2 because schema/meaning changed. No compatibility import is promised. Data clearing removes only habits/schedules/logs; Auth/profile/preferences remain.

Retain transactional before-account-delete cleanup, narrowed to the new schema. SUPABASE_SECRET_KEY remains server-only, same-project, and only for immediately verified self-deletion. Ordinary reads/writes/exports use caller identity. Never bypass the cleanup trigger with independent admin table deletions.

The service worker still caches only the public offline document and public icons; no private routes, API/RSC/Auth responses, exports, mutations, or personal records.

## Migration and cutover

Preserve applied migrations unchanged. Add a forward simplification migration after the current ledger. Inventory retirement explicitly: drop owned dependencies child-first, rewrite retained routines, replace habit tables, and preserve Auth/profile/preferences. Avoid a broad CASCADE that could erase shared infrastructure unnoticed.

First replay the full migration chain locally and validate the replacement app. Before a hosted mutation verify that configured URL, CLI/MCP project, live catalog/history, and reviewed reset target agree. The user authorized fresh product data in this development project; no production reset is authorized.

Don't apply the schema while a running app build still queries retired tables. Stop local app/test processes, apply the reviewed development migration, regenerate complete matching types, validate hosted ownership with rollback-only fixtures, and start the compatible app. No website deployment is part of this step.

Regenerate src/types/database.ts from the full matching Supabase schema, never from the removed partial catalog generator. Run hosted security/performance advisors and address verified findings in follow-up migrations. Historical migrations are replay inputs, not active app interfaces.

## Known open gates

Image approval, schema/code cleanup, hosted reset/type generation, and local replacement tests are complete. Full authenticated desktop/mobile browser and visual review passed (26 checks). Physical-device and actual screen-reader checks remain distinct from emulation. Custom SMTP/email delivery remains a production prerequisite. Do not interpret historical verification as target-product success.
