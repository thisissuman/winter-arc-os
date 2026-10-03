---
name: Winter Arc OS
description: A quiet daily checklist in charcoal and violet.
colors:
  primary-dark: "#a89af3"
  primary-light: "#6852d6"
  primary-hover-dark: "#b7abf5"
  primary-hover-light: "#5943c7"
  primary-ink-dark: "#181322"
  primary-ink-light: "#ffffff"
  background-dark: "#101115"
  background-light: "#f7f7fa"
  foreground-dark: "#ededf2"
  foreground-light: "#202129"
  sidebar-dark: "#15161b"
  sidebar-light: "#efeff4"
  surface-dark: "#181a20"
  surface-light: "#ffffff"
  raised-dark: "#1d2027"
  inset-dark: "#111318"
  inset-light: "#f5f5f8"
  secondary-dark: "#22242c"
  secondary-light: "#eeedf3"
  selected-dark: "#28243b"
  selected-light: "#e9e5fa"
  muted-dark: "#a5a7b2"
  muted-light: "#626875"
  divider-dark: "#2b2d36"
  divider-light: "#dddde5"
  control-border-dark: "#707482"
  control-border-light: "#858a97"
  success-dark: "#87d5a4"
  success-light: "#237844"
  destructive-dark: "#ffb4ab"
  destructive-light: "#b42318"
typography:
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  section:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  task:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  caption:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "8px"
  container: "16px"
  circle: "50%"
spacing:
  base: "4px"
  control: "8px"
  row: "12px"
  compact: "16px"
  panel: "20px"
  panel-lg: "24px"
  section: "32px"
components:
  button-primary-dark:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.primary-ink-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  button-primary-light:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary-ink-light}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  button-outline-dark:
    backgroundColor: "{colors.inset-dark}"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.control}"
    height: "44px"
  button-outline-light:
    backgroundColor: "{colors.background-light}"
    textColor: "{colors.foreground-light}"
    rounded: "{rounded.control}"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "44px"
  button-destructive-dark:
    textColor: "{colors.destructive-dark}"
    rounded: "{rounded.control}"
    height: "44px"
  button-destructive-light:
    textColor: "{colors.destructive-light}"
    rounded: "{rounded.control}"
    height: "44px"
  field:
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "44px"
  navigation-link:
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "44px"
  calendar-container:
    rounded: "{rounded.container}"
    padding: "8px"
  completion-row:
    typography: "{typography.task}"
    rounded: "{rounded.control}"
    padding: "16px 8px"
    height: "64px"
---

# Design System: Winter Arc OS

## Overview

**Creative North Star: "A quiet daily checklist"**

Winter Arc OS is a private habit app designed to be used in under a minute. The approved charcoal/violet world gives ordinary routines a calm, readable setting: familiar controls, short labels, open space and prominent habit names. The identity is Winter Arc OS, with its existing snowflake mark and locally packaged Geist type.

This document records the implemented replacement, grounded in [the stylesheet](src/app/globals.css), [shared controls](src/components/ui), and Today/Habits/Settings. The five [desktop/phone boards](docs/DESIGN_REVIEW.md) were approved October 3, 2026; they are direction references rather than synchronized user data. The earlier broad-product concepts are superseded. The final real-auth desktop/mobile suite passed all 26 checks; hosted rollback-only security checks also passed. Detailed evidence and remaining actual-device, screen-reader and SMTP limitations belong to [QA](docs/QA.md). This design record does not claim those manual or email checks.

**Key Characteristics:**

- Solid charcoal and cool paper surfaces with a restrained violet accent.
- Narrow task columns, divider rows and a three-destination shell.
- Readable completed states, visible focus and large touch controls.
- A name-and-schedule editor with quiet, literal save feedback.
- Complete dark/light roles, without ornamental gradients, neon, glass or decorative imagery.

## Colors

Violet identifies action, selection and focus; neutral tonal layers keep the routine itself prominent. The paired frontmatter values are normative for their respective themes. Runtime components use the semantic CSS variables, so a theme change updates the whole interface together.

### Primary

- **Soft Violet:** dark-theme primary actions, active control borders, focus and the thin completion bar. Its dark ink maintains readable button labels.
- **Clear Violet:** the corresponding light-theme action and focus color, paired with white button labels.
- **Selected Violet:** a restrained tonal background for active navigation, selected dates and schedule choices; it is separate from the solid action fill.

### Neutral

- **Charcoal / Cool Paper:** workspace backgrounds. The sidebar occupies a subtly different neutral layer.
- **Routine Surface:** framed calendars, menus and date controls. Raised and inset roles distinguish editors and fields without decorative material effects; light raised surfaces reuse the white surface role.
- **Reading Ink / Muted Ink:** primary text and supporting dates/help. Completed habit names remain readable in muted ink.
- **Quiet Divider / Control Stroke:** subtle section boundaries versus stronger interactive outlines. Do not substitute a divider for a field's control stroke.

Success green identifies confirmed completion. Destructive red identifies errors and deletion; boxed feedback uses the existing success/warning/error surface and border variables from the stylesheet. Symbols, words and control state carry meaning alongside color.

**The Meaningful Accent Rule.** Use violet for an available action, selection or focus. Keep ordinary rows and section backgrounds neutral.

## Typography

**Display and Body Font:** locally loaded Geist variable sans, with a sans-serif fallback. No second display family or icon font is introduced.

**Character:** compact and plain, with enough hierarchy to find the next action immediately. Page headings are semibold and slightly tightened; routine text and supporting copy use normal tracking. Counts use tabular numerals where the value changes.

### Hierarchy

- **Headline:** page titles using the headline token.
- **Section:** editor titles and substantial empty-state headings; small Settings section labels instead use medium task-sized text.
- **Task:** checklist names, date subtitles and ordinary prominent content.
- **Body:** supporting copy, controls and routine schedule descriptions.
- **Label:** visible form labels and medium-weight actions.
- **Caption:** calendar weekday labels, helper text and short explanatory status.

There is no oversized display/stat tier in the simple product. Routine-list names use a modest intermediate heading size. Phone inputs, selects and textareas retain task-sized type (16 px) to avoid focus zoom, even when desktop controls use smaller body text. Long names wrap rather than forcing horizontal scrolling.

**The Literal Label Rule.** Use sentence case and the name of the action or state. Keep visible labels and full accessible names; abbreviated weekdays still announce their full names.

## Layout

The desktop shell has a fixed sidebar (240 px) and a centered outer main container (maximum 920 px). Each section's task column is capped at 42 rem (672 px). Desktop content begins with generous top space (48 px); narrow layouts use a smaller top inset (32 px). Spacing follows the frontmatter's four-pixel rhythm.

At the desktop breakpoint (768 px), the sidebar replaces the phone header and bottom navigation. Below it, the three-link dock reserves its own safe-area-aware clearance. Narrow-phone horizontal gutters start at 16 px and honor display cutouts. The editor changes from a full-width bottom sheet to a centered dialog at 640 px, independently of the workspace sidebar breakpoint. Visual-viewport handling hides the dock while the keyboard is open and keeps editor actions reachable.

Headers can wrap their action below the title. New habit spans the phone's Routines header width; Today's Add a habit remains a quiet text action. Settings uses divider-separated Account, Preferences and Your data sections, with a two-column section label/content layout where space permits. History is one calendar rather than a wide routine matrix.

**The Task Column Rule.** Preserve the readable centered column and let controls wrap on small screens. Extra screen width is breathing room, not a reason to add dashboard panels.

## Elevation & Depth

Most surfaces are flat: background changes, strokes and dividers establish structure. Only the modal editor and routine menu use the existing floating shadow; the editor also uses a dimmed modal backdrop. There is no ornamental glow, blur or glass layer. Exact theme-specific shadows and motion values live in [.impeccable/design.json](.impeccable/design.json).

**The Flat Workspace Rule.** Keep ordinary routine rows and Settings sections unraised. Use floating depth for content that overlays the workspace.

## Shapes

Controls, navigation and date cells have gently curved corners using the control radius. Calendars, menus and dialogs use the container radius; the phone sheet rounds its upper corners. Completion markers and weekday selectors are circular. Thin divider lines separate rows; stronger strokes identify inputs and uncompleted markers.

Default controls and icon actions have at least 44 px touch targets. Checklist rows are at least 64 px tall and calendar dates at least 56 px tall. These are minimums: wrapped names, feedback and short viewport scrolling may increase their size. Do not promote unused smaller primitive variants into ordinary app controls.

## Components

### Buttons

Compact, direct actions with the control radius and medium label text. Primary uses the theme's violet/ink pair; hover uses its primary-hover role. Outline actions use a control stroke and neutral fill. Ghost actions remain quiet until hover; destructive actions use a red tonal fill. Pending actions use explicit Saving/Deleting copy and disabled state.

The shared button uses a short color transition (150 ms, ease-out) and a small press offset. Keyboard focus uses the existing border/ring treatment; other native controls retain the global two-pixel outline with four-pixel offset. Reduced-motion mode removes transitions and animations.

### Schedule Choices

Daily and Selected days are labelled native radios in rounded outlined choices. Selected choices use the selected fill and primary stroke. Weekday choices are circular labelled checkboxes with full weekday accessible names; choice targets retain the standard touch minimum. Focus highlights the whole label.

### Cards / Containers

Use a framed tonal container for the calendar, an overlay menu or an editor. Use divider rows for routines and Settings rather than wrapping every section in a card. Containers use the container radius and compact or panel spacing; only overlays receive the floating shadow.

### Inputs / Fields

Visible labels sit above or alongside controls. Native inputs/selects/date fields use the control radius and stronger control border; inset or card fills follow the existing component context. Focus remains obvious, errors have associated text and destructive styling, and disabled controls visibly dim. Controlled fields keep unsaved values through failures.

### Navigation

Only Today, Habits and Settings appear in the main shell. Each link has an outline icon, medium label and a large target. The current link uses the selected fill and aria-current; other links are muted until hover. Desktop navigation is vertical, while the phone dock places icons above labels in three equal columns. Routines/History use a separate local underline navigation within Habits.

### Completion Row

The entire row is a semantic checkbox control with a circular marker, wrapped habit name and restrained neutral hover. Completion adds a green fill/check and muted readable text. Pending saves show the existing loading spinner and an announced state. Failure/conflict feedback appears beneath the row with a reload action; never display a failed change as saved.

### Calendar

The framed seven-column calendar has a visible chosen-habit label, month heading and large date cells. The selected date has a primary stroke/selected fill. Check, cross, open circle, dash and dot distinguish Completed, Not completed, Pending today, Not scheduled and Future; full date/state accessible labels accompany them. Noneligible dates remain inspectable and explain why completion is unavailable. The selected date's correction control sits beneath the calendar.

### Editor and Feedback

Use the existing native modal dialog with a labelled title, close action, focus return, Escape behavior and scrollable body. Habit editing exposes only name and schedule, with an honest start-today/tomorrow-change explanation. Cancel is an outline action and save is primary. Destructive confirmation states the actual scope. Status/error regions announce results; loading, empty, all-done, offline and privacy states keep the same typography and neutral structure.

## Do's and Don'ts

### Do:

- **Do** use semantic theme roles, visible control strokes and consistent focus treatment.
- **Do** keep habit names prominent, wrapping long content and preserving readable completed text.
- **Do** keep touch targets large and reserve space for the phone dock and keyboard.
- **Do** convey states with symbols or text as well as color.
- **Do** mask habit names consistently in Privacy Mode, including editors and accessible labels.
- **Do** use literal pending/error feedback and honor reduced motion.

### Don't:

- **Don't** add ornamental gradients, neon, glass, decorative imagery or an animation library.
- **Don't** turn Today into score cards, charts, streak rewards or a reporting dashboard.
- **Don't** add navigation destinations or required setup fields beyond the accepted product.
- **Don't** treat illustrative board labels/counts as saved user data or QA evidence.
- **Don't** weaken a readable control or hide its failure state to make a screenshot cleaner.
