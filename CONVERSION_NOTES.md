# Conversion Notes — Registration Simulator (Flash/AS3 → Accessible HTML5)

## Behavior model

The simulator generates 50 stars at random positions in a 470×370 region
(the 400×300 star-field area plus a 35 px margin on every side) with random
magnitudes between 3 and 7. It then renders three 400×300 CCD-style images
("starfields") of those same stars: each image adds Gaussian read noise
(mean 2418, σ 432, produced with a Park–Miller LCG and the polar Box–Muller
method, then chunk-shuffled with a per-field seed), spreads each star's flux
(`peakValue · 10^((3 − magnitude)/2.5)` at 16-bit depth) through an Airy-disc
point-spread function of radius 4, and maps counts to grayscale through a
γ = 1.8 transfer function (invertible via the "invert colors" option).
Starfield 1 is fixed at the center of the work area; starfields 2 and 3
contain the same stars shifted by (+35, −29) and (+15, +21) pixels
respectively, and start hidden. The student shows the fields, drags them,
nudges them with the arrow keys, or types x/y offsets (clamped to ±40 px
around starfield 1) until the star patterns align — the images register at
offsets (−35, +29) for starfield 2 and (−15, −21) for starfield 3. One field
at a time is "on top" (thicker highlighted border, draggable/arrow-keyable,
optionally 40 % transparent); the on-top field can be cycled with the
"switch on top field" button or the 'a' key.

## Source → output mapping

| ActionScript source | HTML5 port |
| --- | --- |
| `MainTimeline.frame1` constants & layout rects | `simulation.js` constants block (values verbatim) |
| `MainTimeline.generateStarList()` | `generateStarList()` |
| `MainTimeline.initStarField()` / `StarField` setters | precomputed per-field counts (`computeFieldCounts`) |
| `StarField.generateNoise()` (LCG + polar Box–Muller) | `generateNoiseData()` — identical arithmetic, exact in doubles |
| `StarField.shuffleNoise()` (chunk permutation) | `buildChunkTable()` |
| `StarField.update()` (noise + PSF starlight, clamping, int/uint casts) | `computeFieldCounts()` + `buildFieldImage()` |
| `AiryDisc` (radius 4, `getJ1` Bessel approximation) | `buildAiryDisc()` / `getJ1()` — constants verbatim |
| `GammaTransferFunction.refresh()` (γ = 1.8, inverted table) | `buildLookupTables()` |
| `onStarFieldPressed/Moved/Released` (drag with offset re-anchoring at limits, `int` casts) | Pointer Events path in `simulation.js`, identical math incl. `|0` truncation |
| `changeStarFieldPosition()` (clamp to `positionLimitsRect`) | `changeStarFieldPosition()` |
| `onKeyDownFunc()` ('a' = 65/97, arrows move on-top field by 1 px) | global `keydown` handler + per-field keyboard path |
| `goToNextVisibleField()` / `onTopFieldChangedViaRadioButton()` / `updateFieldAlphas()` | `goToNextVisibleField()` / `onTopChanged()` / derived in `render()` |
| `updatePositionTextInputs()` (`Math.round(...).toString()`) | `updatePositionInputs()` — same formatting |
| `fl.controls` Button/CheckBox/RadioButton/TextInput | native `<button>`, `<input type="checkbox">`, `<input type="radio">`, `<input type="text" maxlength="3">` with the `restrict="-0-9"` filter reproduced in JS |
| `setMask` on `starFieldsContainerSP` | `ctx.clip()` to the work-area rect |
| Border colors `16748688` (#FF9090, 3 px, on top) / `9474192` (#909090, 2 px) | identical |
| Work area box: white fill, 1 px #666666 stroke | identical |

## Rendering architecture

- Canvas covers the original work-area stage rect (14, 61, 500, 400); all
  state lives in original Flash stage coordinates. Only the final draw and the
  pointer mapping translate by the fixed (14, 61) origin — a pure presentation
  translation with no effect on the ported math.
- The canvas backing store is 500×400 × devicePixelRatio and CSS scales the
  element to its panel (aspect ratio preserved); pointer coordinates are mapped
  back through the current scale so drag/clamp math matches the AS exactly at
  any display size.
- Each field's pixel counts never change after startup (only the sprite
  positions move), so counts are computed once per field and cached as
  offscreen canvases per color mode (normal / inverted).

## Assets

No exported assets are reused: every visual in this sim is generated at
runtime (BitmapData noise/star rendering and vector chrome). The exported
`shapes/*.svg`, `sprites/`, and `fonts/` entries are all `fl.controls`
component skins and Verdana font glyphs, which per the pipeline rules are
replaced by native accessible controls and the KL-UNL foundation styling, so
`html5/assets/` is intentionally absent.

## contents.json

The shared `foundation/contents.json` already contained a
`registrationSimulator` entry; it was carried over verbatim into the copied
`html5/foundation/contents.json` with one change (per instruction): in the
About content, the sentence "Permission is granted to use these files for
noncommercial purposes as long as they remain unmodified." was replaced with
the Copyright 2026 Board of Regents / Apache License 2.0 notice.

**Pre-existing JSON syntax errors repaired (flagged for the shared upstream
file).** The source `contents.json` is not valid JSON — browsers' strict
`JSON.parse` rejects it, so the KL-UNL masthead could not load *any* sim from
it (console: `SyntaxError: Bad control character in string literal…`). The
copy in `html5/foundation/` received the minimal syntactic repairs below; no
wording was changed. **These same fixes should be applied to the shared
upstream `foundation/contents.json`:**

- `ce_hc` help: raw line break inside the string before the closing quote — removed.
- `meltednail` help: raw line break inside the string before the closing quote — removed.
- `eclipsingbinarysim` help: raw line break mid-sentence ("These data were⏎ provided") — joined to "were provided".
- `pulsarPeriodSim001` help: literal tab character after `<p>` — replaced with a space.
- `renaissancePtolemaic` help: unescaped quotes in `<a href="../venusphases">` — escaped as `\"`.
- `venusphases` help: unescaped quotes in `<a href="../ptolemaic">` — escaped as `\"`.

All other foundation files (`kl-unl-masthead.js`, `kl-unl.css`, `kl-unl.js`)
are byte-for-byte unchanged.

## Quirks of the original, preserved

- **noiseSeed assignment bug:** `frame1` assigns `starField1.noiseSeed` three
  times (7, 5007, 10071); the 5007/10071 assignments were clearly intended for
  fields 2 and 3 but target field 1. Net effect: field 1 ends with shuffle
  seed 10071 and fields 2/3 keep the `StarField` default seed 1. The port
  reproduces this final effective state (`SHUFFLE_SEEDS = {1: 10071, 2: 1, 3: 1}`),
  so fields 2 and 3 have identical noise patterns, exactly as in the SWF.
- **Invalid offset text jumps to the corner:** `changeStarFieldPosition` casts
  through AS3 `int()`, and `int(NaN) === 0`, so committing empty/invalid text
  moves the field to the clamped minimum corner (offset −40, −40). The
  `isNaN/isFinite` guard in the AS is dead code after the cast. Preserved
  (`| 0` has the same semantics).
- **`goToNextVisibleField` is inert once no field is visible** (selection
  "none" returns early); only re-showing a field restores an on-top selection.
  Preserved.
- Star positions/magnitudes are drawn from `Math.random()` at load, as in the
  original (a new pattern per page load).

## Deviations from the original (all presentation/accessibility; behavior intact)

1. **Chrome and layout** follow the KL-UNL foundation (masthead with
   Reset/Help/About, panel classes, palette, fonts) instead of the Flash pixel
   chrome — per pipeline Goals B/C. Panel structure, grouping, and reading
   order (Work Area left; Starfield Controls with the shown/on top/x/y grid,
   hint text, and switch button; Appearance Options below) mirror the original
   screenshot.
2. **Reset** exists only via the masthead `sim-reset` event (the Flash sim had
   no reset). It restores the exact initial session state, keeping the star
   list generated at load.
3. **Global key handling is scoped:** in Flash, the stage `keyDown` fired even
   while a TextInput had focus, so arrow keys moved the on-top field *and* the
   caret simultaneously. The port skips the global 'a'/arrow shortcuts while
   focus is in a text input, and skips global arrows on radio buttons (arrows
   natively change radio selection). The same movement is always available by
   focusing the field itself (see ACCESSIBILITY.md).
4. **Keyboard drag path added** (WCAG): each visible star field has a focus
   proxy; arrows nudge by 1 px (parity with the original), Shift+arrow and
   PageUp/PageDown by 10 px. Home/End are not meaningful for this 2-D drag and
   are not bound. Moving a focused field brings it on top first, mirroring the
   pointer behavior (in the original, arrows only ever move the on-top field).
5. **Offset inputs are right-aligned** so digits line up down the column
   (visual-polish rule); the Flash TextInputs were left-aligned.
6. **No MathJax usage:** the sim contains no mathematical equations, formulas,
   or math-notation symbols ("x offset" / "y offset" are verbatim plain-text
   labels from the original). `klunlInitEqn()` is redefined as a no-op, and no
   MathJax include exists in the provided foundation folder.
7. The 1 px work-area border stroke is drawn fully inside the canvas (in Flash
   half the stroke fell outside the work-area rect onto the stage background).

## Per-browser notes

Pointer Events, canvas 2D, `<dialog>` (used by the masthead), and CSS grid are
supported by current Chrome, Edge, Firefox, and Safari (desktop + iOS);
`touch-action: none` on the stage keeps iOS Safari from scrolling during
drags. No vendor-prefix-only CSS and no Chrome-only APIs are used. Canvas
bilinear scaling of the noise image may look microscopically different across
GPUs/browsers, as any scaled bitmap does; the underlying pixel data is
identical.
