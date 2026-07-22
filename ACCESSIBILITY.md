# Accessibility Notes — Registration Simulator

WCAG 2.1 AA affordances added in the HTML5 conversion. **Human screen-reader
QA (NVDA on Windows with Chrome/Firefox, VoiceOver on macOS with Safari/Chrome)
is still required before release.**

## Structure & semantics

- `<kl-unl-masthead>` renders the single `<h1>` plus Reset/About (and Help)
  with its own accessible modal dialog; the sim adds no competing masthead.
- Landmarks: `<main class="app-layout">` with three `<section>` panels, each
  labelled by its `<h2 class="panel__heading">` ("Work Area", "Starfield
  Controls", "Appearance Options" — verbatim original headings).
- The Starfield Controls grid is a real `<table>`: row headers ("starfield 1/2/3")
  and column headers ("shown", "on top", "x offset", "y offset") give screen
  readers cell context; every control also carries an explicit `aria-label`
  (e.g. "starfield 2 x offset in pixels").
- Starfield 1's fixed-offset cells show "----" (`aria-hidden`) with an sr-only
  "starfield 1 is fixed" equivalent.
- `<html lang="en">`; all inputs labelled (aria-label or `<label for>`).

## Text alternatives for the canvas

- The `<canvas>` is `aria-hidden`; it is never a tab stop.
- A visually hidden description (`#rs-desc`, referenced by `aria-describedby`
  from each field proxy) is regenerated from the single `render()` pass and
  states what the diagram currently shows: which starfields are shown/hidden,
  each one's x/y offset **in pixels**, which is on top, transparency, and
  inversion state.
- A polite `aria-live` region announces every meaningful state change on
  commit (not per tick): visibility toggles, on-top changes, drag/arrow-key
  results ("Starfield 2 at x offset 25 pixels, y offset −35 pixels."),
  transparency, inversion, and reset. Arrow-key movement announcements are
  debounced (500 ms after the last keypress). All numeric announcements
  include the quantity name and the unit ("pixels") — never a bare number.

## Keyboard map

| Key | Context | Action |
| --- | --- | --- |
| Tab / Shift+Tab | everywhere | Move between interactive controls only (masthead buttons, checkboxes, radios, offset inputs, switch button, visible star-field proxies). Display-only content is never a tab stop. |
| Enter / Space | focused star-field proxy | Bring that starfield on top |
| Arrow keys | focused starfield 2/3 proxy | Move that field 1 px (brings it on top first, like a pointer drag) |
| Shift+Arrow | focused starfield 2/3 proxy | Move 10 px |
| PageUp / PageDown | focused starfield 2/3 proxy | Move up/down 10 px |
| Arrow keys | anywhere except text inputs, radio buttons, and the proxies | Move the on-top field 1 px (original stage-level behavior) |
| a | anywhere except text inputs | Switch on top field (original shortcut; also available as the "switch on top field" button) |
| Enter | offset text input | Commit the typed offsets (also committed on focus-out) |
| Escape | masthead dialog | Close dialog (handled by the masthead component) |

- Each visible star field has an invisible focus **proxy** overlaying its
  canvas rectangle: `tabindex="0"`, `role="application"` with
  `aria-roledescription="draggable star field image"` (starfield 1, which is
  fixed, is a `role="button"` that brings it on top). Clicking/tapping a field
  focuses its proxy (`.focus()` on pointerdown), so arrow keys work
  immediately after a click — no tabbing required.
- Proxies show an always-visible focus ring (`--outline-color`); Tab always
  moves away normally (no traps). Pointer and keyboard paths mutate the same
  state object.
- Sliders: none in this sim. All other controls are native elements with full
  built-in keyboard support.

## Color & contrast

- All chrome uses the KL-UNL palette variables; text is `#1a1a1a` on white
  (≈16:1). Hint text inherits the same foreground color at 1rem italic.
- "On top" is **never signaled by color alone**: the pink border (#FF9090) is
  also 3 px vs 2 px (shape cue), the on-top radio button is selected, and the
  live region/description name the on-top field in text.
- The star images themselves are grayscale by design (original educational
  content, both normal and inverted modes) and carry no color-coded state.
- Border colors are kept verbatim from the original (#FF9090 / #909090); they
  are supplementary graphics whose state is fully available through the radio
  group and text, so no palette remap was required.

## Motion, timing, zoom, touch

- The sim has **no animation** — rendering changes only in direct response to
  user actions — so no Pause control is needed and `prefers-reduced-motion`
  requires no special handling; nothing flashes.
- Body copy is 1.125 rem, sized in rem throughout; the layout reflows to one
  column at narrow widths/200 % zoom with no horizontal scrolling or clipping
  (canvas scales with preserved aspect ratio).
- Pointer Events with `touch-action: none` on the stage give one shared
  mouse/touch/pen drag path; buttons and checkboxes/radios sit in ≥44 px
  touch rows; no hover-only affordances.

## Known limitations / QA checklist for human testers

- Verify NVDA and VoiceOver both read the table cells with row+column context
  and the proxy labels ("Starfield 2, x offset 25 pixels…").
- Verify `role="application"` on the proxies passes arrow keys through in
  NVDA browse mode (NVDA switches to focus mode automatically; if a tester
  finds otherwise, `role="slider"` per axis would be the fallback).
- Verify live-region announcements are not duplicated or truncated during
  rapid arrow-key nudging (debounce is 500 ms).
- The invisible "none" on-top state (all fields hidden) leaves all radios
  unchecked, matching the original's hidden "none" radio; the live region
  announces "No star field is on top."
