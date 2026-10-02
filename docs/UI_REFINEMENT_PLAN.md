Status: In Progress
Current phase: A — Design Tokens

# Winter Arc OS — UI/UX refinement plan

Approved October 2, 2026. This plan records the read-only architecture and interface review completed before final QA. “Current phase” identifies the next planned work; implementation has not started. The existing [product contract](../PRODUCT.md), [architecture](ARCHITECTURE.md), [scoring rules](SCORING.md), [design record](../DESIGN.md), [roadmap](ROADMAP.md), and [QA evidence](QA.md) remain authoritative for implemented behavior.

## 1. Goals

- Refine Winter Arc OS as a premium, minimal, mature, dark-first personal productivity, fitness, career, and habit dashboard, with phone use treated as a primary workflow.
- Make high information density feel ordered: users should find the next action, understand progress, and inspect history without scanning repeated labels or decorative surfaces.
- Establish consistent typography, spacing, color roles, controls, cards, feedback, charts, and navigation across existing routes and both themes.
- Improve keyboard, screen-reader, touch, reduced-motion, and narrow-screen experiences while preserving the existing product and its privacy boundary.
- Complete phases A–G in order, with evidence at each gate before the separate final QA and release phase.

## 2. Non-goals

- No business, scoring, scheduling, streak, target, quota, timer, or calculation changes.
- No database schema, migration, RLS, authentication, authorization, server-action contract, or query semantics changes.
- No route additions, removals, URL changes, or altered active-route logic.
- No fabricated analytics, synthesized measurements, new career pipeline, new tracker type, or gamification system.
- No wholesale component-library migration or adoption of a Watermelon dashboard template as application code.
- No deployment, release, or claim that deferred SMTP and device checks have passed.
- This document and its roadmap reference do not authorize UI implementation.

## 3. Current UI findings

### Architecture and dependencies

Graphify's existing project graph was queried first, then relevant source, canonical documents, and stored desktop/mobile screenshots were inspected. This was a scoped review of the current repository and saved browser artifacts, not a new live device or full-route visual test.

| Layer | Implemented pattern | Refinement boundary |
| --- | --- | --- |
| Routes and data | Thin Next.js App Router Server Components under `src/app`; authenticated pages compose owned reads. | Preserve paths, route parameters, server/client division, loading and error behavior. |
| Domain features | Interactive views, actions, schemas, queries, and domain calculations live in `src/features`. | Presentation can change; domain math and validated mutations stay intact. |
| Shared UI | Six local shadcn-style primitives (`Button`, `Input`, `Label`, `Badge`, `Separator`, `Skeleton`) in `src/components/ui`, with shell and tracking helpers in `src/components`. | Extend the current Radix/shadcn family selectively; keep feature logic in features. |
| Auth and privacy | Protected pages verify identity; the proxy refreshes cookies with private/no-store responses; actions verify identity and ownership independently. Private text is masked before client serialization. | Retain every boundary and prevent hidden values leaking through tooltips, accessible names, chart data, or props. |
| Navigation | Desktop 240 px sidebar from 768 px; phone header plus five-link fixed bottom navigation: Today, Track, Plan, Insights, More. Auth changes to a split layout from 1024 px. | Preserve destinations, active states, protected redirects, and responsive behavior. |
| Shared feature dependencies | `MetricLogger` serves Today, Fitness, and Metrics; `ScorePanel` serves Today and Insights; `PageHeader` is reused broadly; Reflection statistics reuse Insights calculations. | Coordinate visual changes at the shared component before individual pages. |

Representative sources: [global tokens](../src/app/globals.css), [workspace layout](../src/app/%28workspace%29/layout.tsx), [navigation](../src/components/shell/navigation.tsx), [PageHeader](../src/components/tracking/page-header.tsx), [MetricLogger](../src/features/today/metric-logger.tsx), [ScorePanel](../src/features/today/score-panel.tsx), and [Insights view](../src/features/insights/insight-view.tsx).

### Interface inconsistencies and hierarchy

| Area | Observed condition | Intended correction |
| --- | --- | --- |
| Today | Setup/context and separate daily/weekly score cards can push logging below the first phone screen. Tracker names repeat between parent sections and embedded loggers. | Compact the context and summaries; bring due actions and quick metrics earlier; remove repeated headings without hiding unconfigured states. |
| Controls | Primitive button/input defaults are 32 px high while many forms override them to 44 px. Focus-timer, workout set, and note actions mix sizes. | Define shared control sizes and a 44 px touch target for primary phone actions. |
| Forms | Labels, hints, errors, pending state, and focus handling vary. `FormField` renders related text but does not itself wire every child control's descriptive/error attributes. | Create a consistent accessible field contract and explicit error association. |
| Cards and spacing | Sections use local padding, borders, nested cards, and custom rows, causing uneven density. | Use a small set of surface and row patterns; prefer dividers over unnecessary card nesting. |
| Mobile hubs | Track, Plan, and More are grids of tall destination cards; they require excess scrolling for navigation. | Convert them to compact, clearly labeled destination rows while keeping all links. |
| Persistent timer | The mobile timer bar uses a fixed offset relative to the bottom navigation; safe area, keyboard, and landscape interaction need coordinated review. A ticking status region may announce too often. | Treat timer and navigation as one inset system and announce timer state changes rather than every second. |
| Charts | Insights heatmaps use very small numeric labels and rely on hover metadata for full dates/coverage. | Raise label legibility and expose existing date/coverage detail to touch and keyboard users. |
| Copy and states | Some implementation-facing labels compete with user actions. Several distinct source states already exist. | Use plain task language while keeping zero, missing, skipped, unscheduled, future, and in-progress states distinct. |

The existing charcoal/violet palette and light-theme mapping are a sound base. A raw token contrast check found readable main and muted text on their solid surfaces, while input boundaries deserve a manual visual and non-color affordance review. That check does not establish whole-page accessibility conformance.

## 4. Approved design direction

- Aim for the restraint, alignment, and interaction quality associated with Linear, Raycast, and Vercel; compose an original interface around Winter Arc OS tasks and data.
- Keep charcoal surfaces, one cool violet/indigo accent, Geist, compact headings, tabular numerals, modest borders, and minimal shadows.
- Make a page read in this order when applicable: context, primary action, current progress, history, then configuration. Show required setup and errors clearly rather than burying them.
- Use color to clarify status and interaction. Avoid neon, cyberpunk styling, excessive gradients, glass effects, decorative motion, childish rewards, and unrelated visual treatments.
- Use dense rows and concise copy; retain comfortable touch targets and legible labels.

## 5. Design-system decisions

| Area | Approved decision |
| --- | --- |
| Typography | Retain local Geist. Target 24–30 px semibold page titles, 18–20 px section headings, 28–36 px tabular key figures, 14 px desktop body/control text, 16 px phone form inputs, 12–13 px secondary text, and at least 12 px chart labels. Reserve uppercase/letter spacing for short, meaningful metadata. |
| Spacing | Continue the 4 px base. Use approximately 8 px within a control group, 12–16 px between related rows, 16 px compact phone panels, 20–24 px larger panels, and 24–32 px between sections. Keep established page gutters first; gain density by reducing repetition and nesting. |
| Color | Preserve the [implemented dark/light semantic palette](../DESIGN.md). Add explicit roles only where needed for control boundaries, selected surfaces, feedback backgrounds, and chart series. Verify both themes and non-color distinctions before setting new values. |
| Radii and elevation | Keep the existing 6/8/14/16 px radius scale, restrained borders, and minimal shadows. Avoid visually heavy nested cards. |
| Card system | Standardize four presentation patterns: `Panel` for grouped content, `StatSummary` for one value plus context, `ActionRow` for a log/task/session, and `EditorSurface` for forms. Interactive surfaces have clear hover/focus; static cards do not pretend to be clickable. |
| States | Use consistent saved, pending, failed, empty, unconfigured, private, and in-progress treatments. A pending visual state cannot imply a successful server save. Preserve current optimistic rollback and retry behavior. |
| Charts | Use one frame for title, unit, period, source coverage, text alternative, loading/empty state, and theme-aware tooltip. Keep Recharts and existing calculations. Gaps remain gaps; measured zero remains zero. |
| Motion | Prefer 150–200 ms color, opacity, and overlay transitions when useful. Keep spatial controls stable, disable ornamental chart animation, and honor reduced motion. No motion dependency is required. |

The values above are intended design rules, not a claim that all are already implemented. Record actual final tokens and conventions in [DESIGN](../DESIGN.md) during implementation.

## 6. Shared component strategy

Build presentation primitives in phases A–B, then use them to refine the shell and routes. Keep data fetching, actions, schemas, and scoring inside their existing feature boundaries.

| Candidate | Use | Ownership rule |
| --- | --- | --- |
| `PageHeader` and `SectionHeader` | Consistent title, short context, and route actions. | Adapt the current shared header; no route logic inside the component. |
| `Panel`, `StatSummary`, `ActionRow`, `DestinationRow` | Consistent surface density for dashboards, history, and navigation hubs. | Pass already authorized display data and privacy-safe labels. |
| `PeriodToolbar` | Compact date/challenge/period controls on existing routes. | Retain route parameters, timezone, and filter validation. |
| `FormField`, `InlineFeedback`, `ResponsiveEditor`, `Confirmation` | Visible labels/hints/errors, saved/pending/failure states, phone sheets, desktop dialogs, and explicit destructive scope. | Reuse existing Server Actions and Zod schemas; retain focus return, typed confirmations, and controlled offline inputs. |
| `ChartFrame`, `CoverageLabel`, `EmptyState` | Consistent chart metadata, missing-data explanation, accessible alternatives, and next steps. | Reuse exact existing results and source semantics. |

Keep feature-specific controls near their owners: habit toggles and grids under Habits/Today, metric entry under Today/Fitness/Metrics, workout set ordering under Fitness, timer controls under Career, and chart selection/heatmap interaction under Insights. Do not combine different data types merely because their cards look alike.

## 7. Watermelon/shadcn usage rules

Both catalogs are design and component resources. Inspect examples before choosing a pattern; adapt to the existing Next.js, React, Tailwind, Radix Nova, Supabase, and Recharts stack. Do not copy demo data, providers, navigation, CSS resets, dependencies, route assumptions, or unverified accessibility behavior.

| Resource | Read-only tools used in the analysis | Decision |
| --- | --- | --- |
| shadcn MCP | `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist` | Retain the six installed primitives. Selectively consider `Card`, `Field`, `Textarea`, `NativeSelect`, `Progress`, `Table`, `AlertDialog`, `DropdownMenu`, `Collapsible`, `Tooltip`, and `Chart` when a route has a concrete need. `Dialog`, `Sheet`, `Calendar`, `Combobox`, and `Sidebar` are references until existing behavior justifies adoption. |
| Watermelon UI MCP | `catalog_summary`, `list_categories`, `list_catalog_entries`, `search`, `get_inspiration`, `get_component`, `get_catalog_entry`, `compose_page` | Borrow selected layout and interaction patterns only; implement them with current primitives and truthful application data. |

| Watermelon reference | Worth considering for | Guardrail |
| --- | --- | --- |
| [Capitalio Dashboard](https://ui.watermelon.sh/dashboard/capitalio-dashboard) | Compact summary and chart-panel composition for Today/Insights. | Do not import its full dashboard, synthetic data, extra icon set, Base UI components, or Recharts 2 dependency into the current Recharts 3 app. |
| [Demostack Dashboard](https://ui.watermelon.sh/dashboard/demostack-dashboard) | Sidebar grouping and toolbar alignment. | Keep Winter Arc OS destinations and active states; omit team/search/notification constructs. |
| [Data Table](https://ui.watermelon.sh/components/data-table) | Aligned workout and study history rows. | Use fluid phone rows rather than fixed-width invoice columns or unrelated bulk actions. |
| [Tabs](https://ui.watermelon.sh/components/tabs) | Restrained segmented controls for an existing mode or period switch. | Keep reachable labels, keyboard behavior, and route/query semantics. |
| [Sheet](https://ui.watermelon.sh/components/sheet) | Mobile editor header/footer layout. | Retain the current native `EditorDialog` initially; change it only with verified focus and keyboard behavior. |
| [Date Picker](https://ui.watermelon.sh/components/date-picker) | Optional desktop date-trigger treatment. | Preserve native phone date input and existing business-date validation. |

Do not take Watermelon social cards, decorative statistics, movie ratings, or marketing gradients into this product. For shadcn, prefer the current `Button`, `Input`, `Label`, `Badge`, `Separator`, and `Skeleton` where they already work. Avoid blanket package installation and copying registry dependency versions; the app already uses Recharts 3.10.1. Existing Server Actions/Zod do not require a new form library.

## 8. Implementation phases A–G

| Phase | Scope | Main deliverable |
| --- | --- | --- |
| **A — Design Tokens** | Define type, spacing, control sizes, surfaces, color roles, state treatments, chart colors, and both-theme contrast from the existing palette. | A documented token set and scoped global/primitives update. |
| **B — Shared Components** | Align panels, summaries, rows, headers, fields, feedback, toolbars, editor/confirmation, and chart frames. | Reusable presentation contracts with current auth/privacy and action behavior. |
| **C — Shell/Navigation** | Group desktop destinations, compact Track/Plan/More hubs, coordinate bottom navigation and timer insets. | The same links and active logic in a clearer shell. |
| **D — Today Dashboard** | Compress context and daily/weekly summaries, put due habits and quick metrics sooner, and move secondary explanations/history lower. | An action-first Today view using only existing Today data and actions. |
| **E — Feature Pages** | Refine Fitness/workouts, Career, Habits/Metrics, Planning, Insights, Reflection, then Settings/Auth. | Consistent feature hierarchy, forms, charts, and state treatment without contract changes. |
| **F — Responsive/Mobile Polish** | Tune wrapping, keyboards, editor actions, tablet density, safe areas, landscape, and long content. | Reliable phone/tablet/desktop layouts, including an active timer. |
| **G — Accessibility/Animation Polish** | Finish contrast, focus, screen-reader content, reduced-motion behavior, and subtle feedback. | Verified accessibility and restrained interaction polish. |

Page composition decisions within those phases:

- **Shell and Today (C–D):** Group desktop links as Daily Work (Today, Habits, Metrics, Fitness, Career, Tasks, Goals), Review (Insights, Reflection, Challenges), and Manage (Settings). Retain the five phone destinations and every existing hub link, using compact rows. On Today, show compact date/challenge context, distinct daily and weekly summaries with coverage, due habits and quick metrics, relevant workout/study and planning links, then quotas and detailed score explanation. Keep challenge elapsed time separate from achievement and show required setup when a source is unconfigured.
- **Fitness (E):** Put quick measurements and workout entry before history. Show each metric identity, unit, saved value, and next action once; keep bodyweight observation-only and preserve averages/coverage and sleep mode units. Use compact, ordered exercise/set rows with reachable add, reorder, remove, draft, and completion controls.
- **Career (E):** Give the active focus timer the primary phone position, followed by clearly separate duration and session totals, manual session entry, and recent history. Place category administration lower in the page. Keep start/pause/resume/finish/discard state and offline failure feedback truthful.
- **Habits and Metrics (E):** Make completion and measurement logging primary. Keep count, skip, undo, and notes accessible as secondary actions. Give the monthly habit grid a readable identity column, keyboard and horizontal-scroll cues, a legend, and distinct scheduled/skipped/missed/unscheduled/future states; treat quota and streak summaries as secondary context.
- **Planning, Insights, and Reflection (E):** Keep selected-day task actions and goal progress ahead of configuration. For Insights, retain existing filters and Recharts calculations; show period, units, coverage, gaps, comparable-period rules, text alternatives, and touch/keyboard date detail in each chart or heatmap. Reflection stays a writing surface with the existing Insights-derived period statistics as context.
- **Forms, Settings, and Auth (E):** Standardize visible labels, hints, field errors, pending/saved/failure feedback, and optional-field disclosure. Preserve existing payload validation, ownership checks, privacy editor restrictions, typed confirmations, current-password checks, and unsaved values after offline failures. Auth changes concern visual consistency only.

Responsive and accessibility checks belong to every phase; F and G are final cross-product passes. Do not advance a phase on visual appearance alone.

## 9. Acceptance criteria for each phase

- [ ] **A:** Dark and light roles cover text, surfaces, controls, selected states, status, focus, and charts. Type/spacing/control scales are applied coherently. Text contrast and input boundaries receive a recorded manual and automated review; no feature behavior changes.
- [ ] **B:** Shared patterns work by keyboard and touch, have visible labels and associated errors, report real pending/saved/failure states, and return focus correctly. Privacy-safe presentation is preserved.
- [ ] **C:** Every existing destination and active state remains reachable at phone, tablet, desktop, and short desktop heights. Protected navigation and URL behavior are unchanged. Timer and navigation do not obscure content or each other.
- [ ] **D:** On a configured phone, the first relevant daily action is reachable early. Daily and weekly scores, coverage, setup needs, and challenge elapsed time remain distinct; all values and mutations match the existing route.
- [ ] **E:** Fitness measurements, workouts, Career sessions/timer, habit states/quotas, metrics, Planning, Insights, Reflection, and Settings/Auth retain their workflows. Charts and summaries agree with existing source values, units, missing-data rules, privacy, and ownership.
- [ ] **F:** Check 360, 390, 768, 1024, and 1440 px widths plus landscape/short-height, open keyboard, long labels, active timer, and intentional habit-grid scrolling. No accidental page-wide overflow or unreachable action.
- [ ] **G:** Automated axe checks and manual keyboard/screen-reader/reduced-motion review pass on affected routes. Focus is visible, non-color state cues remain, chart/date detail works without hover, and timer updates do not create continuous announcements.

Each checked gate needs a dated result in [QA](QA.md). Update the implemented convention in [DESIGN](../DESIGN.md) and the phase state here at the same time. The final QA/release gate in [ROADMAP](ROADMAP.md) remains separate.

## 10. Regression risks

| Risk | Required safeguard |
| --- | --- |
| Reordering cards hides required setup, privacy, errors, or scoring context. | Preserve those states and verify configured/unconfigured, empty, error, private, and in-progress accounts. |
| Shared component styling changes 32 px controls, 44 px phone targets, dialog focus, or keyboard set ordering. | Audit all consumers of `Button`, `Input`, `FormField`, and `EditorDialog`; run focused keyboard and touch checks. |
| Fixed timer bar collides with bottom navigation, safe areas, keyboard, or tall content. | Test both bars together in active/paused states across narrow, landscape, and short-height layouts. |
| A visual chart refactor turns missing into zero, changes daily/weekly denominators, or hides coverage. | Keep domain calculations unchanged and compare rendered values/text alternatives with existing fixtures. |
| Privacy Mode leaks text via client props, tooltips, chart labels, accessible names, or animation frames. | Keep masking before serialization and repeat the private-payload/secondary-label checks. |
| New form wrappers clear unsaved input on offline or failed Server Actions. | Preserve controlled inputs and explicit failure feedback; test offline save/retry paths. |
| Component catalog examples introduce Base UI, conflicting Recharts versions, demo actions, or alternate routing. | Adapt visual patterns into the existing primitives; inspect lockfile changes and every interactive control. |
| Theme/token changes reduce legibility or conceal boundaries in light mode. | Review contrast, focus, inputs, statuses, and charts in both themes. |

## 11. Validation checklist

For this documentation-only handoff:

- [x] Confirm the twelve requested sections, exact status/current-phase lines, and A–G sequence.
- [x] Check local Markdown destinations, balanced fences, and whitespace in the two changed documents.
- [x] Check the task diff contains only this plan and the roadmap reference; preserve pre-existing unrelated work.
- [x] Record clearly that application tests and live UI checks were not run for documentation-only changes.

For each later implementation phase, run the relevant checks and record actual commands and outcomes in [QA](QA.md):

- [ ] Run `npm run lint`, then `npm run typecheck`, relevant Vitest checks, and `npm run build`; keep typecheck and build sequential because both write `.next/types`.
- [ ] Run affected authenticated desktop/mobile Playwright flows and privacy/ownership assertions. Use `npm run test:db` when database or authorization contracts could be affected; do not treat it as proof of hosted Auth/email.
- [ ] Inspect rendered dark/light layouts and the widths, timer, keyboard, touch, zoom, focus, screen reader, and reduced-motion scenarios relevant to the phase.
- [ ] Compare scores, quotas, metrics, units, source coverage, and zero-versus-missing states with the existing domain fixtures.
- [ ] Update [DESIGN](../DESIGN.md), [QA](QA.md), and roadmap/progress evidence for delivered work. After code changes, run `graphify update .` as required by [AGENTS](../AGENTS.md).

## 12. Progress/status section

| Phase | Status | Evidence |
| --- | --- | --- |
| A — Design Tokens | Current; implementation not started | Plan approved and recorded October 2, 2026. Acceptance gate open. |
| B — Shared Components | Not started | Depends on A. |
| C — Shell/Navigation | Not started | Depends on B. |
| D — Today Dashboard | Not started | Depends on C. |
| E — Feature Pages | Not started | Depends on D. |
| F — Responsive/Mobile Polish | Not started | Depends on E. |
| G — Accessibility/Animation Polish | Not started | Depends on F. |

The earlier Phase 0–8 implementation and its recorded test results remain as stated in [QA](QA.md). No application tests or fresh live UI checks were run for this documentation-only handoff. SMTP-dependent signup/recovery checks, operating-system install/device review, staging, backups, and release verification remain open for final QA. Mark this refinement complete only after every A–G acceptance gate has evidence.
