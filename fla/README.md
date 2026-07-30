# `fla/` — original Flash source material

This folder is the **decompiled original** of the Registration Simulator, kept
for reference and provenance. Nothing here is used at runtime: the live
simulation is the accessible HTML5 version in the repository root.

## Contents

| Path | What it is |
| --- | --- |
| `registrationSimulator.swf` | The original compiled Flash movie |
| `scripts/` | ActionScript 3 decompiled with JPEXS/FFDec — the behavioral ground truth for the conversion |
| `scripts/registrationSimulator_fla/MainTimeline.as` | Main controller: layout constants, drag logic, on-top/visibility state machine |
| `scripts/edu/unl/astro/starField/` | `StarField`, `AiryDisc`, `GammaTransferFunction`, `Star` — the image-generation physics |
| `scripts/fl/` | Adobe's stock `fl.controls` component framework (not ported; replaced by native accessible controls) |
| `shapes/`, `sprites/`, `fonts/`, `frames/` | Exported vector shapes, component skins, Verdana glyphs, and a frame render |
| `texts/` | Extracted on-screen string literals |
| `symbolClass/symbols.csv` | Linkage name ↔ symbol id map |
| `Capture.PNG` | Screenshot of the running original, used as the layout reference |
| `foundation/` | The KL-UNL foundation files exactly as received (see note below) |

`images/`, `morphshapes/`, and `movies/` were exported empty — the SWF contains
no bitmaps, morph shapes, or nested movie clips. Every visual in this
simulation is generated in code at runtime, which is why the HTML5 port has no
`assets/` folder and redraws the star fields on a `<canvas>`.

## Note on `fla/foundation/` vs the repository root `foundation/`

`fla/foundation/` is the pristine copy as received. The root `foundation/` is
the one the live sim loads; it is byte-identical except for `contents.json`,
which adds this sim's entry and repairs pre-existing JSON syntax errors that
broke the masthead for every simulation. Those repairs are itemized in
[`../CONVERSION_NOTES.md`](../CONVERSION_NOTES.md).

## Licensing

The original simulation is University of Nebraska–Lincoln astronomy education
material. See the About dialog in the running simulation for the applicable
copyright and Apache 2.0 license notice.
