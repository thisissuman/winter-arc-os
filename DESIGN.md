# Winter Arc OS — design direction

## Status

**Approved direction; not an implemented design system.** Phase 0 contains no UI, CSS tokens, components, or screenshots. Phase 1 must replace planned conventions with values and patterns verified in the actual application. Do not claim visual or accessibility verification from this document alone.

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

Exact color values, spacing scales, and component variants will be recorded from the verified Phase 1 implementation, not guessed as already existing tokens.

## Navigation and responsive behavior

Desktop: sidebar groups Today, Track, Plan, Insights, Reflection, and More. Mobile: Today, Track, Plan, Insights, More bottom navigation with safe-area spacing. Both use the same routes.

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

- [ ] Record actual semantic tokens for both themes.
- [ ] Record font/type/spacing rules from delivered components.
- [ ] Record navigation adaptation and dialog/sheet behavior.
- [ ] Verify mobile, tablet, desktop, keyboard, contrast, and reduced motion.
- [ ] Verify privacy masking across secondary labels and accessible names.
- [ ] Link any verified visual artifacts from the QA record; do not fabricate screenshots.
