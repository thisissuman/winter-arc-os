# Winter Arc OS — design direction

## Status

**Foundation, core tracking, fitness, Career, Planning, Insights, and Reflection interfaces are implemented. UI/UX refinement Phases A–G have code implementations; physical-device and actual screen-reader verification remain open for F/G.** Phase 1 auth and shell retain their recorded visual and accessibility results. Phase 2 Today and tracking pages passed desktop/mobile browser and automated accessibility checks. Phase 3 adds Fitness measurement/sleep cards, recorded-day charts with text summaries, an exercise library, and responsive workout/set forms. Phase 4 adds study summaries, category distribution, session forms, and a persistent timer bar. Phase 5 adds a seven-day task board, selected-day forms, accessible order controls, carry-forward actions, and goal progress cards. Phase 6 adds bounded filters, a score trend, four numeric heatmaps, coverage cards, and ranked source summaries. Phase 7 adds readable prompt forms, optional 1–5 check-ins, a saved-review history, and adjacent source statistics. See QA for exact checks.

Product truth lives in [PRODUCT](PRODUCT.md), route/component responsibilities in [ARCHITECTURE](docs/ARCHITECTURE.md), and validation in [QA](docs/QA.md).

## Task and hierarchy

The user logs habits and measurements quickly on a phone, then reviews progress and plans on desktop. Today shows the selected challenge and date, distinct compact daily/weekly score summaries, due habits and quick measurements, then weekly/monthly progress and expandable score explanations. Unconfigured targets and unavailable sources receive honest empty/configuration states.

Charts are secondary on Today and primary on feature/Insights pages. Keep elapsed challenge time visibly separate from achieved adherence. Daily and weekly scores have explicit labels.

## Visual commitments

- Restrained charcoal background and slightly elevated surfaces, with one cool violet/indigo accent.
- Semantic success, warning, destructive, muted, and focus roles in CSS variables. Supply equivalent light-theme roles from Phase 1.
- Geist as the interface font; compact application headings, readable body text, tabular numerals where useful.
- Clear spacing and alignment, modest borders, minimal shadows, and information density without crowded controls.
- Original application composition and copy; quality references are not layout templates.
- No ornamental gradients, neon glows, excessive glass, hype language, or decorative animation libraries.

Actual semantic variables live in `src/app/globals.css`:

| Role | Dark | Light |
| --- | --- | --- |
| Background | `#101115` | `#f7f7fa` |
| Text | `#ededf2` | `#202129` |
| Card | `#181a20` | `#ffffff` |
| Raised surface | `#1d2027` | `#ffffff` |
| Inset control surface | `#111318` | `#f5f5f8` |
| Sidebar | `#15161b` | `#efeff4` |
| Primary / focus | `#a89af3` | `#6852d6` |
| Primary hover | `#b7abf5` | `#5943c7` |
| Primary text | `#181322` | `#ffffff` |
| Secondary | `#22242c` | `#eeedf3` |
| Muted text | `#a5a7b2` | `#626875` |
| Accent | `#28243b` | `#e9e5fa` |
| Selected surface / text / border | `#28243b` / `#ededf2` / `#a89af3` | `#e9e5fa` / `#202129` / `#6852d6` |
| Border | `#2b2d36` | `#dddde5` |
| Control border / input border | `#707482` | `#858a97` |
| Success | `#87d5a4` | `#237844` |
| Warning | `#eac079` | `#925600` |
| Destructive | `#ffb4ab` | `#b42318` |
| Success feedback surface / border | `#1a2921` / `#426650` | `#eef8f1` / `#a6cfb2` |
| Warning feedback surface / border | `#2a241a` / `#84653b` | `#fff6e8` / `#d8b884` |
| Error feedback surface / border | `#321f22` / `#995852` | `#fff0ee` / `#d59996` |
| Chart primary / secondary | `#a89af3` / `#b8bfd4` | `#6852d6` / `#5e6884` |
| Chart grid / label | `#373b48` / `#a5a7b2` | `#d5d8e1` / `#626875` |

Geist variable sans is packaged locally and loaded with `next/font/local`. Phase A names the shared type roles: page title 30 px/1.2, section heading 20 px/1.3, key statistic 36 px/1.1, body and desktop control 14 px/1.5, caption and chart label 12 px. The auth introduction retains its larger desktop heading. The 4 px spacing base remains; named roles are control gap 8 px, related row gap 12 px, compact panel 16 px, panel 20 px, large panel 24 px, and section gap 32 px. Existing page gutters and layouts stay in place.

Control tokens are 32 px compact and 44 px touch. The default shared Button remains compact on desktop and gains a 44 px minimum height on phones; existing explicit 44 px buttons stay 44 px. Shared Input and native `controlClass` fields use 44 px height/minimum height. Phone text in inputs, selects, and textareas is 16 px even when a local `text-sm` class is present, preventing browser focus zoom; desktop form text can stay 14 px. The existing 6/8/14/16 px radius scale remains, with 8 px for controls. Only floating editor surfaces gain a restrained theme-specific shadow (`0 14px 36px rgb(27 28 40 / 12%)` light; `0 18px 48px rgb(0 0 0 / 40%)` dark). Focus keeps a 2 px theme-colored outline with 4 px offset; existing component focus rings and reduced-motion rules remain.

The stronger control border provides at least 3.23:1 contrast against its adjacent background in both themes; ordinary body, muted, feedback, selected, and chart-label text meet at least 4.5:1 on the reviewed solid surfaces. The line charts now use chart roles for grid, labels, and primary series, with theme-aware tooltip surfaces; Insights heatmap values use 12 px labels. These are presentation tokens only. Source coverage, missing-versus-zero behavior, chart animation settings, action feedback semantics, and all data calculations remain unchanged.

Shared shadcn primitives are Button, Input, Label, Badge, Separator, and Skeleton; interactive feature forms remain under their feature directories. Semantic colors, visible labels, actual pending/error feedback, and reduced-motion CSS apply across foundation screens.

## Navigation and responsive behavior

Implemented in source: desktop uses a 240 px sidebar from 768 px upward, groups Daily Work/Review/Manage, and scrolls its links independently on short screens; mobile uses a header and fixed five-link bottom navigation with safe-area spacing. The mobile links are Today, Track, Plan, Insights, and More; More links to Reflection, Challenges, and Settings. An active focus timer stacks directly above the mobile navigation or sits at the desktop bottom edge; shared inset tokens reserve scroll clearance for both bars. Phase G makes the persistent timer a named region rather than a live status, with the elapsed clock marked `aria-live="off"`; confirmed actions retain their separate feedback. The panel's elapsed time includes an accessible text prefix and actual clock value. Actual screen-reader announcement cadence remains unverified. Auth uses a split introduction/form layout from 1024 px upward and a single form column below it. Both presentations use the same URLs.

At small widths, prioritize a single reading column, sheets for short editing flows, reachable quick-add controls, and clear sticky actions when useful. Weekly planners can show one selected day with a week switcher. The habit grid may scroll horizontally but keeps habit identity readable and supports keyboard cell interaction.

Only delivered features enter navigation. Do not use inactive buttons or empty future pages as a substitute for implementation.

## Interaction conventions

- Quick logging uses clear saved/pending/failed feedback and restores state on failure.
- Form labels remain visible; Zod errors are associated with fields. Dialogs/sheets preserve focus and return it to the trigger.
- Tables and grids have semantic structure, meaningful accessible names, and non-color status indicators.
- Today pending, explicit missed, skipped, unscheduled, completed, and future are distinct states.
- Archive is the ordinary remove action for history-bearing trackers. Permanent deletion has explicit consequences and confirmation.
- Subtle motion communicates feedback; honor reduced motion and keep content visible without animation.
- Theme/privacy preferences must be applied before sensitive content flashes during initial render.

## Implemented shared presentation contracts (Phases B–D)

`Panel` uses a quiet bordered surface at 16 px compact or 20–24 px standard padding. `StatSummary` presents one value with its period, state, and optional `CoverageLabel`; the compact variant is used for Today scores. `ActionRow` keeps action controls and current context together, while `DestinationRow` gives the Track/Plan/More hubs a consistent, full-row keyboard/touch target. `PeriodToolbar` groups existing date controls without owning route logic. `EmptyState` carries a clear next step. `ChartFrame` supplies title, unit, period, coverage, empty content, and text alternative on Fitness and Insights routes.

`PageHeader` retains its default sizing for other routes and offers a compact Today variant; `SectionHeader` aligns section titles and actions. `FormField` associates direct controls with label/hint/error IDs, preserves supplied `aria-describedby`, and marks errors with `aria-invalid` and an alert. `InlineFeedback` distinguishes success, warning, information, and failure without implying an unsaved mutation succeeded. The native dialog remains `EditorDialog` for current callers and is also exported as `ResponsiveEditor`; `Confirmation` supplies an explicit destructive scope while retaining Escape handling and focus return. The same privacy-aware names and score details are passed through these surfaces.

Today now keeps setup/configuration notices early, shows compact separate daily and weekly score/coverage cards, then scheduled habits and measurements. The selected challenge's elapsed-days bar is a calendar marker, never an adherence score. Flexible targets and detailed score explanations follow the immediate actions. No score math, query, action, or tracker behavior changed.

## Feature, mobile, and accessibility refinements (Phases E–G)

Fitness places measurements and workout entry before trends, showing each measurement label once. Career puts the timer before duration summaries and manual/history sections, with category management later. Planning, Settings, and Reflection retain their existing actions and use consistent date/control styles. Reflection's optional ratings are a disclosure that opens initially when a saved rating exists. Auth password guidance is associated with its control and field errors. These changes retain existing source calculations, validation, ownership, and privacy masking.

Workout sets and timer actions wrap into reachable phone controls. The native editor keeps its header and close action outside a scrolling form body. Phone gutters and editor padding include safe-area roles, with a compact landscape shell. `MobileViewport` uses visual viewport contraction while an editing control is focused to hide the phone dock and fit the editor above the keyboard. Emulation verifies the response to viewport contraction; actual device keyboards and nonzero OS safe-area insets still require device review.

The habit calendar is a named, focusable horizontal scroll region with keyboard instructions and a separated sticky identity column. Score/fitness trends expose exact dated values in keyboard/touch disclosures, including coverage and gaps; this also works when too few values exist to draw a line. Heatmaps retain their date/coverage disclosures and non-color numeric explanations. No data is synthesized to fill gaps. Recharts animation remains disabled.

Shared feedback uses atomic alert/status announcements. Buttons transition colors for 150 ms rather than all properties. Reduced-motion CSS removes animations and transitions and uses immediate scrolling; pending copy remains visible when the spinner is static. No new shadcn or Watermelon component, provider, or dependency was installed: existing local primitives were reused and the catalogs served as references.

## Privacy and analytics

Private names, descriptions, notes, tooltips, search results, and accessible names use the same privacy-aware presentation rules. Do not render hidden original text into attributes or screen-reader labels. Sensitive UI data does not enter telemetry.

Missing measurements do not display as measured zero. Empty scores read “No scheduled targets.” Open periods read “In progress.” Charts show units, ranges, coverage, and text summaries. Observation-only measurements are not implied to improve the score.

## Implementation recording checklist

- [x] Record actual semantic tokens for both themes.
- [x] Record font/type/spacing rules from delivered components.
- [x] Record responsive navigation and verify Phase 2/3 tracking interactions at desktop and mobile widths.
- [x] Verify foundation mobile/tablet/desktop layouts, keyboard skip links, automated contrast/accessibility, and rendering with reduced motion enabled.
- [x] Verify privacy masking across secondary labels and accessible names.
- [x] Record regenerated auth/private-screen artifact filenames in [QA](docs/QA.md); artifacts are ignored, not committed as fixture data.

Phase 1 auth/empty-Today screenshots were inspected at 1440 px desktop and 390 px mobile, plus Today at 768 px tablet; light account Settings was inspected on desktop/mobile. Phase 2 tracking browser checks pass at desktop/mobile sizes: Today, Habits, and Metrics pass automated WCAG 2 A/AA and 2.1 AA scans; keyboard toggling and horizontal-overflow assertions pass. Phase 2 masks private labels before passing them to interactive components, uses text/symbol habit-grid states, and has optimistic logging with rollback. The complete cross-application privacy review is recorded with Phase 8 in QA. Generated browser artifacts remain ignored under `test-results/`; QA records outcomes.

Phase 3 browser checks cover Fitness at desktop/mobile widths, its WCAG 2 A/AA and 2.1 AA axe scan, and horizontal overflow. Recharts appears only on fitness routes and has adjacent numeric summaries with missing-day coverage; sparse history shows an explicit empty state. Workout names, exercise names, and sleep notes are hidden or uneditable in Privacy Mode. Exercise/set controls use labelled fields and keyboard-operable move buttons. The full cross-application privacy review is recorded with Phase 8 in QA.

Phase 4 keeps Career summaries as text and proportional category bars with numeric alternatives. The timer shows a saved running/paused state and elapsed clock; action feedback distinguishes a confirmed save from a connectivity failure. Desktop/mobile browser checks cover offline finish feedback and recovery, navigation, refresh, two-tab reconciliation, automated accessibility, and horizontal overflow. Study topics, notes, and category names are masked in Privacy Mode. The full cross-application privacy review is recorded with Phase 8 in QA.

Phase 5 shows seven dates as reachable controls and the chosen day as a single-column task list on phones. Every task has labelled status, priority, estimate, and actual-duration fields; order buttons give a keyboard alternative to dragging. Carry-forward spells out move versus copy and reports the saved count. Goal cards distinguish 0% from an unconfigured milestone or missing metric value. The Planning browser flows passed desktop/mobile accessibility and horizontal-overflow checks. Private task and goal text is masked in Privacy Mode; the complete cross-application privacy audit is recorded with Phase 8 in QA.

Phase 6 presents a daily score trend only on Insights, with a numeric summary and gaps for absent scores. Four seven-column heatmaps put a percentage or an em dash inside each cell, so zero and no eligible result remain distinct without relying on color. Each cell exposes its date and logged/expected coverage to assistive technology. Desktop uses two-column heatmap and source-summary grids; mobile keeps filter controls and cards in a single-column flow. The selected organizational category narrows source summaries, while policy scores retain their full scoring categories, with that distinction shown next to the filters. The route avoids fabricated values and masks private tracker/study-category labels before rendering. Automated desktop/mobile accessibility and overflow outcomes are recorded in QA; the cross-application privacy audit is recorded with Phase 8 in QA.

Phase 7 keeps Reflection as a writing surface: prompts are labelled and spaced for long answers, optional ratings are grouped in a fieldset, and saved periods appear as date-only links. A four-card context panel sits beside the editor on wide screens and below it on phones. The panel displays the same score, coverage, study, and workout calculations as Insights, with a clear in-progress range. Privacy Mode hides the entire editor and written responses while leaving numerical context available. Desktop/mobile accessibility, privacy, and overflow checks are recorded in QA.

Phase 8 preserves the charcoal/violet identity and adds section-based Settings and Data controls. Destructive actions appear under explicit scope explanations with typed confirmation and current-password fields. Organization uses labelled name/order/parent controls and archive/restore, preserving linked history. Settings forms keep user input visible when offline, with specific unsaved-state feedback; loading screens use valid status semantics. Installation controls appear only when the browser offers an actual prompt.

The public offline document contains a brand icon, reconnect explanation, and one working retry link. Its theme follows device appearance and contains no personal data. The privacy boundary masks hidden text before client serialization while keeping numerical calculations unchanged. A single Impeccable detector pass over the changed settings/connectivity/offline surfaces returned no findings. Rendered desktop/mobile Settings and light Data controls were inspected together; accessibility, keyboard, tablet overflow, and final browser results are recorded in QA. Generated artifacts remain ignored.

## Component adoption cancelled

CA1–CA2 additions were reverted at the user’s request on October 2, 2026. CA3–CA5 were not implemented and are cancelled. The existing A–G UI refinement conventions and original native controls remain the source of truth. No further component-library adoption is authorized.

## Final A–G QA after adoption rollback

October 2, 2026: existing native controls and A–G presentation conventions passed lint/typecheck, 42 unit cases, production build, and browser evidence for all 62 cases across a 60/62 full run and corrected 4/4 Fitness rerun. Both themes, requested widths, short/landscape timer clearance, accessible chart details, modal focus return, reduced motion, and simulated keyboard behavior were reviewed. No application presentation changes were required. Physical-device and actual screen-reader gates remain open; see [QA](docs/QA.md) for precise results and limits. Component adoption remains cancelled.
