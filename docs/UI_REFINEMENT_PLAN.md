Status: Superseded October 3, 2026
Current phase: None — historical reference

The accepted simple-habit replacement in [PRODUCT](../PRODUCT.md) and [ROADMAP](ROADMAP.md) now owns future work. This broader interface refinement plan is not an active implementation queue. Its original evidence is preserved in the [pre-simplification snapshot](history/2026-10-03-pre-simplification/docs/UI_REFINEMENT_PLAN.md); current physical-device/screen-reader limitations remain documented in [QA](QA.md).

# Winter Arc OS — UI/UX refinement plan

Approved October 2, 2026. This plan records the original architecture/interface review and the subsequently authorized A–G implementation. Phases A–E have recorded gates; E–G code changes were made at the user's request with checks deferred until the explicit validation request. Automated validation now passes, with the exact full-run/rerun results in QA. Physical-device and actual screen-reader checks remain open for F/G. The existing [product contract](../PRODUCT.md), [architecture](ARCHITECTURE.md), [scoring rules](SCORING.md), [design record](../DESIGN.md), [roadmap](ROADMAP.md), and [QA evidence](QA.md) remain authoritative for implemented behavior.

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
- Each implementation phase requires an explicit request; A–G have now been requested. This refinement does not authorize Phase 9 or deployment.

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

The values above guide all phases. Implemented token, component, layout, and interaction conventions are recorded in [DESIGN](../DESIGN.md).

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

The tables below record historical A–G catalog references. The later CA1–CA5 adoption proposal is withdrawn; CA1–CA2 code was reverted, and CA3–CA5 were not implemented. Retain the original shared primitives and native controls. Watermelon is no longer an active project resource.

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

- [x] **A:** Dark and light roles cover text, surfaces, controls, selected states, status, focus, and charts. Type/spacing/control scales are applied coherently. Text contrast and input boundaries received recorded manual and computed reviews; no feature behavior changed. See [DESIGN](../DESIGN.md) and [QA](QA.md).
- [x] **B:** Shared patterns work by keyboard and touch, have visible labels and associated errors, report real pending/saved/failure states, and return focus correctly. Privacy-safe presentation is preserved.
- [x] **C:** Every existing destination and active state remains reachable at phone, tablet, desktop, and short desktop heights. Protected navigation and URL behavior are unchanged. Timer and navigation do not obscure content or each other.
- [x] **D:** On a configured phone, the first relevant daily action is reachable early. Daily and weekly scores, coverage, setup needs, and challenge elapsed time remain distinct; all values and mutations match the existing route.
- [x] **E:** Fitness measurements, workouts, Career sessions/timer, habit states/quotas, metrics, Planning, Insights, Reflection, and Settings/Auth retain their workflows. Charts and summaries agree with existing source values, units, missing-data rules, privacy, and ownership. The full regression and corrected focused rerun cover all 62 browser cases; populated weight values/tooltips and source restoration passed on desktop/mobile. See QA for exact results.
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
| Generated registry files overwrite customized shared controls or add missing aliases/transitive packages. | Preview exact source/dependency/file changes, decline replacements, adapt locally, preserve the existing diff, and record the smallest compatible lockfile delta. |
| Custom select/checkbox/switch/date fields change FormData, disabled-field omission, validation, or auto-submit timing. | Preserve exact names/values, native required behavior and submitters; inspect submitted payload parity and test blank/unchecked/pending/offline states. |
| Radix portals conflict with a native dialog's top layer, focus trap, or mobile viewport handling. | Choose one modal architecture per flow; test nested date/menu controls in the actual editor before expanding. Keep the native editor until the replacement passes. |
| Toasts disappear before an error is understood or announce the same outcome twice. | Keep persistent field/action errors, deduplicate live regions, mount only the justified toaster, and preserve timer/keyboard/safe-area clearance. |

## 11. Validation checklist

The original documentation-only handoff completed these checks before Phase A implementation:

- [x] Confirm the twelve requested sections, exact status/current-phase lines, and A–G sequence.
- [x] Check local Markdown destinations, balanced fences, and whitespace in the two changed documents.
- [x] Check the task diff contains only this plan and the roadmap reference; preserve pre-existing unrelated work.
- [x] Record clearly that application tests and live UI checks were not run for documentation-only changes.

For phases B–G, run the relevant checks and record actual commands and outcomes in [QA](QA.md). Phase A's completed checks are recorded in the progress section below and in QA:

- [x] Run `npm run lint`, then `npm run typecheck`, relevant Vitest checks, and `npm run build`; keep typecheck and build sequential because both write `.next/types`.
- [x] Run affected authenticated desktop/mobile Playwright flows and privacy/ownership assertions. Use `npm run test:db` when database or authorization contracts could be affected; do not treat it as proof of hosted Auth/email.
- [ ] Inspect rendered dark/light layouts and the widths, timer, keyboard, touch, zoom, focus, screen reader, and reduced-motion scenarios relevant to the phase.
- [x] Compare scores, quotas, metrics, units, source coverage, and zero-versus-missing states with the existing domain fixtures.
- [x] Update [DESIGN](../DESIGN.md), [QA](QA.md), and roadmap/progress evidence for delivered work. After code changes, run `graphify update .` as required by [AGENTS](../AGENTS.md).

## 12. Progress/status section

| Phase | Status | Evidence |
| --- | --- | --- |
| A — Design Tokens | Complete | Tokens, shared controls, selected/focus/status/chart roles, both-theme contrast and rendered checks; lint, typecheck, 41 Vitest cases, build, and focused desktop/mobile browser checks passed October 2, 2026. |
| B — Shared Components | Complete | Shared contracts, field associations, editor focus return, privacy-safe ScorePanel, and authenticated browser regression passed October 2, 2026. |
| C — Shell/Navigation | Complete | Grouped sidebar, compact hubs, timer/nav insets, all requested widths and short-height browser checks passed October 2, 2026. |
| D — Today Dashboard | Complete | Existing source calculations/actions retained; phone hierarchy, themes, empty/setup states, and logging regressions passed October 2, 2026. |
| E — Feature Pages | Complete | Lint/typecheck, 42 Vitest cases, production build, feature/source/privacy browser regressions, populated-chart review, both-theme 14-route layout/axe checks, and corrected assertion reruns passed October 2, 2026. |
| F — Responsive/Mobile Polish | Implemented; device gate open | Responsive controls, visual viewport handling, safe-area roles, and scrolling editors implemented. Actual phone keyboards, OS safe areas, and device zoom remain unverified. |
| G — Accessibility/Animation Polish | Implemented; assistive-technology gate open | Accessible chart disclosures, quieter timer semantics, atomic feedback, and reduced-motion handling implemented. Actual screen-reader announcement behavior remains unverified. |
| Component adoption — CA1–CA5 | Cancelled | CA1–CA2 reverted at the user’s request; CA3–CA5 were never implemented. No further adoption is authorized. |

### Phase A implementation decisions and evidence

- Preserved the charcoal/violet palette and Geist. Added named page/section/stat/body/caption/chart type roles, a 4 px-based spacing role set, compact 32 px and touch 44 px control heights, 8 px control radius, and restrained floating-editor shadows.
- Strengthened light/dark control borders, assigned explicit raised/inset, selected, feedback, focus, and chart roles, and retained existing text, state, and reduced-motion semantics. Shared Button defaults reach 44 px on phones after auditing callers; shared Input and native form controls reach 44 px, with 16 px form text on phones.
- Applied tokens to the shared primitives, navigation selection, feedback, headers/editor/score panel, Fitness and Insights chart chrome, and heatmap labels. No route, Server Action, business rule, database, Auth/privacy, scoring calculation, or dependency changed. The foundation browser test's authenticated Today assertion now allows 20 seconds for the observed hosted load; it does not alter the application timeout.
- Key changed files: [`src/app/globals.css`](../src/app/globals.css), [`src/components/ui/button.tsx`](../src/components/ui/button.tsx), [`src/components/ui/input.tsx`](../src/components/ui/input.tsx), [`src/components/tracking/form-field.tsx`](../src/components/tracking/form-field.tsx), [`src/components/form-feedback.tsx`](../src/components/form-feedback.tsx), [`src/components/shell/navigation.tsx`](../src/components/shell/navigation.tsx), [`src/features/fitness/trend-chart.tsx`](../src/features/fitness/trend-chart.tsx), [`src/features/insights/score-trend.tsx`](../src/features/insights/score-trend.tsx), [`src/features/insights/insight-view.tsx`](../src/features/insights/insight-view.tsx), and [`tests/e2e/foundation.spec.ts`](../tests/e2e/foundation.spec.ts). The shared header, editor, score panel, design/QA/roadmap records, and generated `graphify-out/` graph were also updated.
- Validation: `npm run lint`, `npm run typecheck`, `npm run test` (41/41), and `npm run build` passed sequentially. Focused authenticated foundation and Insights browser checks passed on desktop/mobile (2/2 each), including axe, keyboard/reduced-motion, and overflow checks. Rendered dark Today and light Settings were inspected at desktop/phone sizes; a persisted light Today phone screenshot and computed phone control/focus checks also passed. Career's three rendered shared buttons measured at least 44 px on phone, with an unconstrained default at 32 px on desktop. Both-theme token contrast was calculated from the final CSS, and `graphify update .` completed.
- Deferred to later phases: the dedicated test account has no populated line-chart series, so the new series/tooltip treatment was reviewed in source and its route passed browser checks, but a populated tooltip was not visually exercised. Phase E/G will review it with real recorded data, alongside chart touch/keyboard details. No Phase A acceptance item remains open.

### Phases B–D implementation decisions and evidence

- **B — Shared Components:** Added `Panel`, `StatSummary`, `ActionRow`, `DestinationRow`, `PeriodToolbar`, `SectionHeader`, `InlineFeedback`, `ChartFrame`, `CoverageLabel`, and `EmptyState` presentation contracts. `PageHeader` supports compact use while its default remains compatible with feature pages. `FormField` now binds the visible label, hint, and error to a direct control while retaining a caller's existing description; a focused unit test covers the association. The existing native dialog is exported as `ResponsiveEditor` with its `EditorDialog` alias retained, and `Confirmation` retains typed destructive confirmation and focus return. Habit/metric feedback uses the common presentational state without changing its save, retry, or rollback logic. `ScorePanel` uses the shared summary contract; the optional compact form separates its unchanged, privacy-aware explanation for Today. No shadcn package, Base UI, Recharts replacement, or other dependency was added. `ChartFrame` is a ready contract; applying it to chart-heavy feature routes remains Phase E.
- **C — Shell/Navigation:** Grouped desktop links under Daily Work, Review, and Manage with the original destination and active-route expression. Track, Plan, and More now use compact `DestinationRow` links with the same paths and descriptions. The short-height desktop sidebar scrolls independently. Mobile navigation and the persistent timer share a bottom dock and safe-area-aware height; content receives matching scroll clearance. The timer's existing accessible status name remains, while the ticking clock is marked `aria-live="off"` for the Phase G screen-reader review. No timer action or synchronization behavior changed.
- **D — Today Dashboard:** Kept `loadTrackingSnapshot`, date/challenge selection, `scoreForPeriod`, habit/metric/frequency calculations, all logger props, links, and Server Actions. The date and challenge timeline are compact, separate daily/weekly score summaries precede the due habit and measurement actions, setup remains visible, and detailed score explanations sit after period progress. Habit identity is shown by its logger rather than repeated in its wrapper. Challenge elapsed time is explicitly separate from achievement. Empty and configuration states remain visible.
- **Key files:** [`src/components/presentation/`](../src/components/presentation/), [`src/components/tracking/page-header.tsx`](../src/components/tracking/page-header.tsx), [`src/components/tracking/form-field.tsx`](../src/components/tracking/form-field.tsx), [`src/components/tracking/editor-dialog.tsx`](../src/components/tracking/editor-dialog.tsx), [`src/components/shell/navigation.tsx`](../src/components/shell/navigation.tsx), [`src/app/(workspace)/layout.tsx`](../src/app/%28workspace%29/layout.tsx), [`src/app/(workspace)/today/page.tsx`](../src/app/%28workspace%29/today/page.tsx), the Track/Plan/More hub pages, [`src/features/career/focus-timer.tsx`](../src/features/career/focus-timer.tsx), [`src/features/today/score-panel.tsx`](../src/features/today/score-panel.tsx), and the focused [unit](../src/components/tracking/form-field.test.ts) and [browser](../tests/e2e/ui-refinement.spec.ts) checks.
- **Validation:** Final lint, typecheck, 42 Vitest cases, and production build passed. Existing authenticated foundation/Career and Insights/tracking focused runs passed 4/4 each across desktop/mobile; the new B–D browser regression passed 6/6 and the full browser suite passed 54/54. It checked both themes, 360/390/768/1024/1440 px widths, 500 px desktop height, all hub destinations, horizontal overflow, compressed-height field focus, dialog Escape/focus return, running/paused timer alignment, and the ability to scroll the last Today content above the dock. Rendered dark/light Today and hubs plus running/paused timer screenshots were inspected. `graphify update .` refreshed the source graph. Marked browser fixtures were removed from the matching development project and verified absent. See [QA](QA.md) for exact commands and limitations.
- **Deferred to F/G and final QA:** A headless viewport-height reduction does not reproduce an actual iOS/Android software keyboard or device safe-area inset. Physical-device keyboard, landscape/safe-area, screen-reader announcements, zoom, and full cross-route accessibility review remain scheduled for F/G. Phase E will adopt `ChartFrame` on chart-heavy routes and visually check a populated Recharts tooltip. No B–D acceptance item remains open.

### Phases E–G implementation decisions

- **E — Feature Pages:** Fitness puts daily measurement entry before recorded trends and avoids duplicate measurement headings. Career puts the existing timer before duration summaries and adds a compact recent-session presentation from the already loaded snapshot. Habits gets a named keyboard-scrollable calendar; date controls on Metrics, Planning, Reflection, and Settings share the implemented control styling. Fitness and Insights use `ChartFrame` with existing units/coverage, and heatmaps expose dates without hover. Reflection's optional ratings use a disclosure; saved ratings open it initially. Auth password hints are associated with the existing fields. Existing queries, Server Actions, validation, scoring, routes, and privacy boundaries were preserved.
- **F — Responsive/Mobile Polish:** Workout-set and timer action controls wrap at phone widths. Editor headers stay outside their scrolling form bodies, with safe-area-aware padding and visual-viewport bounds. The mobile shell coordinates gutters, landscape heights, timer/navigation clearance, and keyboard contraction through `MobileViewport`. Phone inputs remain at least 16 px, and primary controls retain their 44 px targets. Physical-device keyboard, nonzero OS safe-area, rotation, and zoom checks remain open.
- **G — Accessibility/Animation Polish:** Score/fitness trends include keyboard/touch disclosures listing exact dates, raw values, missing entries, and score coverage, even without enough entries to plot. The persistent timer is a named region instead of a live status; elapsed time is not continuously announced, and action feedback remains separate. The panel exposes the actual elapsed value with a screen-reader prefix. Shared feedback is atomic, Button transitions cover colors for 150 ms, and reduced-motion CSS disables animations/transitions while keeping pending copy available. Actual screen-reader behavior remains unverified.
- **Catalog decision:** Reused existing local shadcn-style primitives and native dialog/details/form controls. Watermelon remained a visual reference. No component installation, Base UI adoption, Recharts replacement, dependency change, or form-library migration occurred.
- **Key files:** Feature pages under [`src/app/(workspace)/`](../src/app/%28workspace%29/), [`src/components/shell/mobile-viewport.tsx`](../src/components/shell/mobile-viewport.tsx), [`src/app/globals.css`](../src/app/globals.css), [`src/components/tracking/editor-dialog.tsx`](../src/components/tracking/editor-dialog.tsx), [`src/components/presentation/`](../src/components/presentation/), [`src/features/fitness/workout-editor.tsx`](../src/features/fitness/workout-editor.tsx), the Fitness/Insights chart components, [`src/features/career/focus-timer.tsx`](../src/features/career/focus-timer.tsx), [`src/features/reflection/review-form.tsx`](../src/features/reflection/review-form.tsx), and [`src/features/auth/auth-form.tsx`](../src/features/auth/auth-form.tsx). Regression coverage lives in [`tests/e2e/ui-refinement.spec.ts`](../tests/e2e/ui-refinement.spec.ts); existing Career, Fitness, Foundation, and Reflection selectors were aligned with the refined presentation.
- **Validation:** Lint/typecheck, 42/42 Vitest cases, and production build passed. The full 62-case production browser run passed 59 and identified three test-assertion failures. The corrected focused rerun passed 8/8 desktop/mobile cases, including all failed cases and added landscape/keyboard coverage. All 62 browser cases therefore have passing evidence across the full run and final rerun; this is not a claim of a single 62/62 run. Both-theme feature checks cover 14 routes at 360/390/768/1024/1440 px, short desktop heights, axe, and phone form text. Timer checks additionally cover 740×360 landscape. Populated weight charts/tooltips, keyboard chart disclosures, native editor focus return/wrapping, reduced motion, simulated visual-viewport contraction, and keyboard habit-grid scrolling passed. Screenshots, final token contrast, fixture restoration, and graph refresh are recorded in QA.
- **Remaining gates:** F stays open for physical iOS/Android keyboards, nonzero safe-area insets/rotation, device zoom, and configured/long-content device review. G stays open for actual VoiceOver/TalkBack or equivalent screen-reader traversal and timer announcement review. Populated daily-score and workout-progression visuals were not separately seeded; their components/domain logic were reviewed and existing analytics/workout regressions passed. No browser emulation is represented as physical-device or screen-reader verification.

The earlier Phase 0–8 implementation and its recorded test results remain as stated in [QA](QA.md). SMTP-dependent signup/recovery checks, operating-system install/device review, staging, backups, and release verification remain open for final QA. Mark the full refinement complete only after every A–G acceptance gate has evidence.

### Component adoption cancellation — October 2, 2026

The user withdrew the component-adoption direction and requested its reversal. Removed CA1/CA2 registry primitives and adapted Watermelon patterns, restored the original consuming controls, and removed the CA1–CA5 implementation instructions and acceptance gates. Preserve all pre-existing A–G refinement work and its open F/G gates. No additional adoption work is authorized. This record describes the cancellation rather than treating adoption as current approved direction.

### Final A–G QA after adoption rollback — October 2, 2026

- Lint, typecheck, 42/42 unit cases, and production build passed. The complete browser suite passed 60/62; two desktop Fitness cleanup assertions were corrected using hosted-action timing and saved-state persistence, then the focused Fitness rerun passed 4/4. All 62 cases have passing evidence across runs, with no skipped authenticated checks. Exact commands and outcomes are in [QA](QA.md).
- Both-theme responsive/axe checks, requested widths, short/landscape timer states, keyboard focus/disclosures/grid scrolling, populated weight tooltips/values, privacy, offline forms, and simulated keyboard response passed. Current screenshots were inspected. Only Fitness test assertions and documentation were edited; application behavior and existing uncommitted refinement work were preserved.
- A–E retain their completed status. F/G remain implemented with real-device and actual screen-reader acceptance gates open; current phase remains F. Do not mark them complete from emulation, ARIA inspection, or axe alone. Component adoption remains cancelled; product Phase 9 has not started.
