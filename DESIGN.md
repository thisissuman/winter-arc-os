# Winter Arc OS — design direction

## Status

**Foundation, core tracking, and fitness interfaces are implemented.** Phase 1 auth and shell retain their recorded visual and accessibility results. Phase 2 Today and tracking pages passed desktop/mobile browser and automated accessibility checks. Phase 3 adds Fitness measurement/sleep cards, recorded-day charts with text summaries, an exercise library, and responsive workout/set forms. See QA for exact checks.

Product truth lives in [PRODUCT](PRODUCT.md), route/component responsibilities in [ARCHITECTURE](docs/ARCHITECTURE.md), and validation in [QA](docs/QA.md).

## Task and hierarchy

The user logs habits and measurements quickly on a phone, then reviews progress and plans on desktop. Today should reveal the selected challenge and date, today's score with explanation, due actions, quick measurement inputs, and separate weekly target progress. Unconfigured targets and unavailable sources receive honest empty/configuration states.

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
| Sidebar | `#15161b` | `#efeff4` |
| Primary / focus | `#a89af3` | `#6852d6` |
| Primary text | `#181322` | `#ffffff` |
| Secondary | `#22242c` | `#eeedf3` |
| Muted text | `#a5a7b2` | `#626875` |
| Accent | `#28243b` | `#e9e5fa` |
| Border | `#2b2d36` | `#dddde5` |
| Input border | `#393c48` | `#d0d0dc` |
| Success | `#87d5a4` | `#237844` |
| Warning | `#eac079` | `#925600` |
| Destructive | `#ffb4ab` | `#b42318` |

Geist variable sans is packaged locally and loaded with `next/font/local`. Controls/body use 14–16 px text; section headings use compact 24–30 px sizing. The auth introduction uses a larger desktop heading. Spacing uses Tailwind's 4 px base, with 24 px mobile page gutters and wider desktop spacing. Radii are 6/8/14/16 px. Primary controls and navigation targets are at least 44 px high. Focus uses a 2 px semantic outline with 4 px offset.

Shared shadcn primitives are Button, Input, Label, Badge, Separator, and Skeleton; interactive feature forms remain under their feature directories. Semantic colors, visible labels, actual pending/error feedback, and reduced-motion CSS apply across foundation screens.

## Navigation and responsive behavior

Implemented in source: desktop uses a 240 px sidebar from 768 px upward; mobile uses a header and fixed three-link bottom navigation with safe-area spacing. The sidebar includes Fitness and the mobile Track hub links to it. Auth uses a split introduction/form layout from 1024 px upward and a single form column below it. Both presentations use the same URLs. Plan, Insights, Reflection, and More remain later work.

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

## Privacy and analytics

Private names, descriptions, notes, tooltips, search results, and accessible names use the same privacy-aware presentation rules. Do not render hidden original text into attributes or screen-reader labels. Sensitive UI data does not enter telemetry.

Missing measurements do not display as measured zero. Empty scores read “No scheduled targets.” Open periods read “In progress.” Charts show units, ranges, coverage, and text summaries. Observation-only measurements are not implied to improve the score.

## Implementation recording checklist

- [x] Record actual semantic tokens for both themes.
- [x] Record font/type/spacing rules from delivered components.
- [x] Record responsive navigation and verify Phase 2/3 tracking interactions at desktop and mobile widths.
- [x] Verify foundation mobile/tablet/desktop layouts, keyboard skip links, automated contrast/accessibility, and rendering with reduced motion enabled.
- [ ] Verify privacy masking across secondary labels and accessible names.
- [x] Record regenerated auth/private-screen artifact filenames in [QA](docs/QA.md); artifacts are ignored, not committed as fixture data.

Phase 1 auth/empty-Today screenshots were inspected at 1440 px desktop and 390 px mobile, plus Today at 768 px tablet; light account Settings was inspected on desktop/mobile. Phase 2 tracking browser checks pass at desktop/mobile sizes: Today, Habits, and Metrics pass automated WCAG 2 A/AA and 2.1 AA scans; keyboard toggling and horizontal-overflow assertions pass. Phase 2 masks private labels before passing them to interactive components, uses text/symbol habit-grid states, and has optimistic logging with rollback. A complete cross-application privacy review remains a Phase 8 gate. Generated browser artifacts remain ignored under `test-results/`; QA records outcomes.

Phase 3 browser checks cover Fitness at desktop/mobile widths, its WCAG 2 A/AA and 2.1 AA axe scan, and horizontal overflow. Recharts appears only on fitness routes and has adjacent numeric summaries with missing-day coverage; sparse history shows an explicit empty state. Workout names, exercise names, and sleep notes are hidden or uneditable in Privacy Mode. Exercise/set controls use labelled fields and keyboard-operable move buttons. The full cross-application privacy review remains a Phase 8 gate.
