/* Registration Simulator — HTML5 port of registrationSimulator.swf
 *
 * Behavior is ported verbatim from the decompiled ActionScript 3 sources:
 *   scripts/registrationSimulator_fla/MainTimeline.as   (controller)
 *   scripts/edu/unl/astro/starField/StarField.as        (noise + star rendering)
 *   scripts/edu/unl/astro/starField/AiryDisc.as         (point-spread function)
 *   scripts/edu/unl/astro/starField/GammaTransferFunction.as
 *   scripts/edu/unl/astro/starField/Star.as
 *
 * All coordinates below are ORIGINAL Flash stage coordinates. The canvas
 * covers the work-area box, stage rect (14, 61, 500, 400); drawing and
 * pointer input are translated by that fixed origin only at the canvas edge.
 */
'use strict';

(function () {

  /* ================= constants (verbatim from MainTimeline.frame1) ======= */

  var STARFIELD_W = 400, STARFIELD_H = 300;   // starFieldDimensions
  var POSITION_BUFFER = -10;                  // positionBuffer
  var WORK_AREA_MARGIN = 50;                  // workAreaMargin
  var STARFIELD_MARGIN = 35;                  // starFieldMargin
  var SATURATION_MAGNITUDE = 3;               // saturationMagnitude
  var MAGNITUDE_RANGE = 4;                    // magnitudeRange
  var NUM_STARS = 50;                         // numStars

  // workAreaRect = new Rectangle(14, 61, w + 2*margin, h + 2*margin)
  var WORK = { x: 14, y: 61, w: STARFIELD_W + 2 * WORK_AREA_MARGIN, h: STARFIELD_H + 2 * WORK_AREA_MARGIN };

  // positionLimitsRect (left/top/right/bottom exactly as in frame1)
  var LIMITS = {
    left:   WORK.x - POSITION_BUFFER,                     // 24
    top:    WORK.y - POSITION_BUFFER,                     // 71
    right:  WORK.x + WORK.w - STARFIELD_W + POSITION_BUFFER,  // 104
    bottom: WORK.y + WORK.h - STARFIELD_H + POSITION_BUFFER   // 151
  };

  // StarField parameters (initStarField + StarField defaults)
  var NOISE_MEAN = 2418;
  var NOISE_SIGMA = 432;
  var BIT_DEPTH = 16;
  var PEAK_VALUE = Math.pow(2, BIT_DEPTH) - 1;            // 65535
  var GAMMA = 1.8;                                        // GammaTransferFunction._gamma

  // dimensions setter: numChunks = 0.7*width; chunkSize = ceil(w*h/numChunks), bumped to even
  var NUM_CHUNKS = Math.floor(0.7 * STARFIELD_W);         // 280 (int cast)
  var CHUNK_SIZE = Math.ceil(STARFIELD_W * STARFIELD_H / NUM_CHUNKS);
  if (CHUNK_SIZE % 2 === 1) { CHUNK_SIZE += 1; }          // 430

  // Per-field star coordinate offsets passed to initStarField in frame1
  var STAR_OFFSETS = { 1: { x: 0, y: 0 }, 2: { x: 35, y: -29 }, 3: { x: 15, y: 21 } };

  // Effective noise shuffle seeds. NOTE: frame1 assigns "starField1.noiseSeed"
  // three times (7, then 5007, then 10071) — the 5007/10071 lines were clearly
  // meant for fields 2 and 3 but target field 1, so after startup field 1 has
  // shuffle seed 10071 and fields 2 and 3 keep the StarField default seed of 1.
  // We reproduce that final effective state exactly.
  var SHUFFLE_SEEDS = { 1: 10071, 2: 1, 3: 1 };

  // Border styling from onTopFieldChangedViaRadioButton:
  // on-top: lineStyle(3, 16748688 = #FF9090); others: lineStyle(2, 9474192 = #909090)
  var BORDER_ON_TOP = { width: 3, color: '#FF9090' };
  var BORDER_NORMAL = { width: 2, color: '#909090' };

  /* ================= deterministic math (StarField / AiryDisc) =========== */

  // Park-Miller LCG used throughout StarField (exact in doubles: max product < 2^53)
  function lcgNext(seed) { return (seed * 16807) % 2147483647; }

  // StarField.generateNoise(): polar Box-Muller driven by the LCG, seed starts at 1.
  // The noise VALUES are identical for every field; only the chunk shuffle differs.
  function generateNoiseData() {
    var n = NUM_CHUNKS * CHUNK_SIZE;
    var data = new Float64Array(n);
    var seed = 1;
    var i = 0, v1, v2, s;
    while (i < n) {
      do {
        v1 = 2 * (seed / 2147483647) - 1;
        seed = lcgNext(seed);
        v2 = 2 * (seed / 2147483647) - 1;
        seed = lcgNext(seed);
        s = v1 * v1 + v2 * v2;
      } while (s >= 1);
      s = Math.sqrt(-2 * Math.log(s) / s);
      data[i] = NOISE_MEAN + NOISE_SIGMA * v1 * s;
      data[++i] = NOISE_MEAN + NOISE_SIGMA * v2 * s;
      i++;
    }
    return data;
  }

  // StarField.shuffleNoise(): chunk permutation from the field's shuffle seed
  function buildChunkTable(shuffleSeed) {
    var t = new Array(NUM_CHUNKS);
    var i, j, tmp;
    for (i = 0; i < NUM_CHUNKS; i++) { t[i] = i; }
    var seed = shuffleSeed;
    for (i = 0; i < NUM_CHUNKS - 1; i++) {
      j = i + Math.floor((NUM_CHUNKS - i) * (seed / 2147483647));
      seed = lcgNext(seed);
      tmp = t[j]; t[j] = t[i]; t[i] = tmp;
    }
    return t;
  }

  // AiryDisc.getJ1 — Bessel J1 rational approximation, constants verbatim
  function getJ1(x) {
    var y, p1, p2, result, ax, z, xx;
    ax = Math.abs(x);
    if (ax < 8) {
      y = x * x;
      p1 = x * (72362614232 + y * (-7895059235 + y * (242396853.1 + y * (-2972611.439 + y * (15704.4826 + y * -30.16036606)))));
      p2 = 144725228442 + y * (2300535178 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y * 1))));
      result = p1 / p2;
    } else {
      z = 8 / ax;
      y = z * z;
      xx = ax - 2.356194491;
      p1 = 1 + y * (0.00183105 + y * (-0.00003516396496 + y * (0.000002457520174 + y * -2.40337019e-7)));
      p2 = 0.04687499995 + y * (-0.0002002690873 + y * (0.000008449199096 + y * (-8.8228987e-7 + y * 1.05787412e-7)));
      result = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * p1 - z * Math.sin(xx) * p2);
      if (x < 0) { result = -result; }
    }
    return result;
  }

  // AiryDisc.reset() with radius 4 (main timeline: new AiryDisc(4))
  function buildAiryDisc(radius) {
    var size = 2 * radius - 1;
    var center = radius - 1;
    var k = 3.831705970256774 / radius;   // first zero of J1, scaled to the radius
    var data = [];
    var a, b, va, vb, r2, j1, val;
    for (a = 0; a < size; a++) { data[a] = []; }
    for (a = 0; a < radius; a++) {
      va = k * a;
      for (b = 0; b <= a; b++) {
        vb = k * b;
        r2 = va * va + vb * vb;
        if (r2 >= 14.681970642501405) {
          val = 0;
        } else {
          j1 = getJ1(Math.sqrt(r2));
          val = 4 * j1 * j1 / r2;    // NaN at the exact center (0/0), same as the AS
        }
        data[center + a][center - b] = val;
        data[center + b][center - a] = val;
        data[center - b][center - a] = val;
        data[center - a][center - b] = val;
        data[center - a][center + b] = val;
        data[center - b][center + a] = val;
        data[center + b][center + a] = val;
        data[center + a][center + b] = val;
      }
    }
    data[center][center] = 1;   // overwrites the NaN center, as in AiryDisc.reset()
    return { data: data, size: size, center: center };
  }

  // GammaTransferFunction.refresh(): 16-bit counts -> 8-bit grey, gamma 1.8
  function buildLookupTables() {
    var normal = new Uint8Array(PEAK_VALUE + 1);
    var inverted = new Uint8Array(PEAK_VALUE + 1);
    var i, v;
    for (i = 0; i <= PEAK_VALUE; i++) {
      v = Math.trunc(255 * Math.pow(i / PEAK_VALUE, 1 / GAMMA));  // int cast in AS
      normal[i] = v;
      inverted[i] = 255 - v;
    }
    return { normal: normal, inverted: inverted };
  }

  // StarField.update(): counts = shuffled noise + PSF-spread starlight.
  // The AS writes star flux through the same chunk mapping it reads back with,
  // so the displayed pixel value is: mappedNoise[i] + sum(flux * psf) at i.
  function computeFieldCounts(noiseData, chunkTable, stars, psf) {
    var counts = new Float64Array(STARFIELD_W * STARFIELD_H);
    var i, chunk, off;
    for (i = 0; i < counts.length; i++) {
      chunk = Math.floor(i / CHUNK_SIZE);
      off = i - chunk * CHUNK_SIZE;
      counts[i] = noiseData[off + CHUNK_SIZE * chunkTable[chunk]];
    }
    var s, flux, x0, y0, px, py, x, y, col, w;
    for (s = 0; s < stars.length; s++) {
      // flux = peakValue * 10^((saturationMagnitude - magnitude) / 2.5)
      flux = PEAK_VALUE * Math.pow(10, (SATURATION_MAGNITUDE - stars[s].magnitude) / 2.5);
      x0 = (stars[s].x - psf.center) | 0;   // int casts as in the AS
      y0 = (stars[s].y - psf.center) | 0;
      for (px = 0; px < psf.size; px++) {
        x = x0 + px;
        if (x < 0) { continue; }
        if (x >= STARFIELD_W) { break; }
        col = psf.data[px];
        for (py = 0; py < psf.size; py++) {
          y = y0 + py;
          w = col[py];
          if (w <= 0 || y < 0) { continue; }
          if (y >= STARFIELD_H) { break; }
          counts[x + y * STARFIELD_W] += flux * w;
        }
      }
    }
    return counts;
  }

  // Map counts -> ImageData through a lookup table (clamped 0..peakValue)
  function buildFieldImage(counts, lut) {
    var img = new ImageData(STARFIELD_W, STARFIELD_H);
    var px = img.data;
    var i, v, g, o;
    for (i = 0; i < counts.length; i++) {
      v = counts[i];
      if (v < 0) { v = 0; } else if (v > PEAK_VALUE) { v = PEAK_VALUE; }
      g = lut[Math.trunc(v)];   // uint cast in AS
      o = i * 4;
      px[o] = g; px[o + 1] = g; px[o + 2] = g; px[o + 3] = 255;
    }
    return img;
  }

  /* ================= build the session's star list ======================= */

  // MainTimeline.generateStarList(): 50 random stars over the field + margin,
  // magnitudes in [saturationMagnitude, saturationMagnitude + magnitudeRange)
  function generateStarList() {
    var xMin = -STARFIELD_MARGIN;
    var xMax = STARFIELD_W + STARFIELD_MARGIN;
    var yMin = -STARFIELD_MARGIN;
    var yMax = STARFIELD_H + STARFIELD_MARGIN;
    var xRange = xMax - xMin;
    var yRange = yMax - yMin;
    var list = [];
    for (var i = 0; i < NUM_STARS; i++) {
      list.push({
        x: xMin + xRange * Math.random(),
        y: yMin + yRange * Math.random(),
        magnitude: SATURATION_MAGNITUDE + MAGNITUDE_RANGE * Math.random()
      });
    }
    return list;
  }

  /* ================= state ============================================== */

  // Initial positions from frame1:
  //   field1 at (work.x + workAreaMargin, work.y + workAreaMargin) = (64, 111), fixed
  //   field2 at (work.x + 75, work.y + 15) = (89, 76)
  //   field3 at (work.x + 23, work.y + 60) = (37, 121)
  function initialFieldState() {
    return {
      1: { x: WORK.x + WORK_AREA_MARGIN, y: WORK.y + WORK_AREA_MARGIN, visible: true },
      2: { x: WORK.x + 75, y: WORK.y + 15, visible: false },
      3: { x: WORK.x + 23, y: WORK.y + 60, visible: false }
    };
  }

  var state = {
    fields: initialFieldState(),
    zOrder: [1, 2, 3],     // display-list order in starFieldsContainerSP; last = topmost
    onTop: '1',            // onTopRadioButtonGroup.selectedData: '1' | '2' | '3' | 'none'
    useAlpha: false,       // "make top field transparent"
    inverted: false        // "invert colors"
  };

  /* ================= precomputed rendering data ========================== */

  var noiseData = generateNoiseData();
  var psf = buildAiryDisc(4);
  var luts = buildLookupTables();
  var starsList = generateStarList();

  // Per-field counts (never change after startup: star positions inside each
  // image are fixed; only the sprite positions move).
  var fieldCounts = {};
  // Cached offscreen canvases per field and per color mode.
  var fieldCanvases = { normal: {}, inverted: {} };

  function getFieldCanvas(id) {
    var mode = state.inverted ? 'inverted' : 'normal';
    if (!fieldCanvases[mode][id]) {
      if (!fieldCounts[id]) {
        var chunkTable = buildChunkTable(SHUFFLE_SEEDS[id]);
        var offset = STAR_OFFSETS[id];
        var stars = starsList.map(function (st) {
          return { x: st.x + offset.x, y: st.y + offset.y, magnitude: st.magnitude };
        });
        fieldCounts[id] = computeFieldCounts(noiseData, chunkTable, stars, psf);
      }
      var img = buildFieldImage(fieldCounts[id], state.inverted ? luts.inverted : luts.normal);
      var c = document.createElement('canvas');
      c.width = STARFIELD_W;
      c.height = STARFIELD_H;
      c.getContext('2d').putImageData(img, 0, 0);
      fieldCanvases[mode][id] = c;
    }
    return fieldCanvases[mode][id];
  }

  /* ================= DOM references ===================================== */

  var canvas, ctx, stage, live, desc;
  var showBoxes = {}, radios = {}, xInputs = {}, yInputs = {}, proxies = {};
  var advanceButton, alphaBox, invertBox;
  var dpr = 1;

  /* ================= screen-reader announcements ======================== */

  var announceTimer = null;
  function announce(message) {
    // Rewrite the polite live region; a clear-then-set keeps repeats audible.
    live.textContent = '';
    window.requestAnimationFrame(function () { live.textContent = message; });
  }

  // For arrow-key nudging: announce on commit (debounced), not per keystroke.
  function announceMoveDebounced(id) {
    if (announceTimer) { window.clearTimeout(announceTimer); }
    announceTimer = window.setTimeout(function () {
      announceTimer = null;
      announcePosition(id);
    }, 500);
  }

  function offsetsOf(id) {
    var f = state.fields[id], f1 = state.fields[1];
    return { x: Math.round(f.x - f1.x), y: Math.round(f.y - f1.y) };
  }

  function announcePosition(id) {
    var o = offsetsOf(id);
    announce('Starfield ' + id + ' at x offset ' + o.x + ' pixels, y offset ' + o.y + ' pixels.');
  }

  /* ================= ported controller logic ============================ */

  // MainTimeline.updatePositionTextInputs()
  function updatePositionInputs() {
    var o2 = offsetsOf(2), o3 = offsetsOf(3);
    xInputs[2].value = o2.x.toString();
    yInputs[2].value = o2.y.toString();
    xInputs[3].value = o3.x.toString();
    yInputs[3].value = o3.y.toString();
  }

  // MainTimeline.changeStarFieldPosition(fieldNumber, {x, y})
  function changeStarFieldPosition(n, pos) {
    var f = n === 2 ? state.fields[2] : state.fields[3];
    // AS int() casts: int(NaN) === 0, so invalid text sends the field to the
    // clamped minimum corner — a quirk of the original, preserved here.
    var x = pos.x | 0;
    var y = pos.y | 0;
    if (x < LIMITS.left) { x = LIMITS.left; } else if (x > LIMITS.right) { x = LIMITS.right; }
    if (y < LIMITS.top) { y = LIMITS.top; } else if (y > LIMITS.bottom) { y = LIMITS.bottom; }
    f.x = x;
    f.y = y;
    updatePositionInputs();
    render();
  }

  // RadioButtonGroup.selectedData semantics: no-op when unchanged, otherwise
  // select and fire the change handler (onTopFieldChangedViaRadioButton).
  function setOnTop(value, announceIt) {
    if (state.onTop === value) { return; }
    state.onTop = value;
    syncRadios();
    onTopChanged();
    if (announceIt !== false) {
      if (value === 'none') {
        announce('No star field is on top.');
      } else {
        announce('Starfield ' + value + ' is now on top.');
      }
    }
  }

  // MainTimeline.onTopFieldChangedViaRadioButton()
  function onTopChanged() {
    if (state.onTop === null || state.onTop === 'none') { return; }
    var id = parseInt(state.onTop, 10);
    // setChildIndex(field, numChildren - 1): move to the top of the display list
    state.zOrder.splice(state.zOrder.indexOf(id), 1);
    state.zOrder.push(id);
    render();   // border styles + updateFieldAlphas() are derived in render()
  }

  // MainTimeline.goToNextVisibleField()
  function goToNextVisibleField() {
    if (state.onTop === null || state.onTop === 'none') { return; }
    var next = (parseInt(state.onTop, 10) % 3) + 1;
    for (var k = 0; k < 3; k++) {
      var candidate = ((next + k - 1) % 3) + 1;
      if (state.fields[candidate].visible) {
        setOnTop(String(candidate));
        return;
      }
    }
    setOnTop('none');
  }

  // MainTimeline.onStarFieldVisibilityToggled()
  function onShowToggled(n) {
    var f = state.fields[n];
    f.visible = showBoxes[n].checked;
    if (f.visible) {
      setOnTop(String(n), false);
      announce('Starfield ' + n + ' shown and now on top.');
    } else if (state.onTop === String(n)) {
      goToNextVisibleField();
      announce('Starfield ' + n + ' hidden. ' +
        (state.onTop === 'none' ? 'No star field is on top.' : 'Starfield ' + state.onTop + ' is now on top.'));
    } else {
      announce('Starfield ' + n + ' hidden.');
    }
    radios[n].disabled = !f.visible;
    render();
  }

  /* ================= rendering ========================================== */

  function render() {
    // Canvas covers stage rect (WORK.x, WORK.y, WORK.w, WORK.h); translate once.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, WORK.w, WORK.h);

    // workAreaSP: white fill + 1px #666666 border (inset so it stays visible)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WORK.w, WORK.h);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, WORK.w - 1, WORK.h - 1);

    // starFieldsContainerSP is masked to the work-area rect
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, WORK.w, WORK.h);
    ctx.clip();

    for (var i = 0; i < state.zOrder.length; i++) {
      var id = state.zOrder[i];
      var f = state.fields[id];
      if (!f.visible) { continue; }
      var x = f.x - WORK.x;
      var y = f.y - WORK.y;
      // updateFieldAlphas(): bitmap alpha 0.4 on the top field when selected
      var alpha = (state.useAlpha && state.onTop === String(id)) ? 0.4 : 1;
      ctx.globalAlpha = alpha;
      ctx.drawImage(getFieldCanvas(id), x, y);
      ctx.globalAlpha = 1;
      // starFieldNBorderSP: border stroke is a full-alpha sibling of the bitmap
      var border = (state.onTop === String(id)) ? BORDER_ON_TOP : BORDER_NORMAL;
      ctx.strokeStyle = border.color;
      ctx.lineWidth = border.width;
      ctx.strokeRect(x, y, STARFIELD_W, STARFIELD_H);
    }
    ctx.restore();

    syncProxies();
    updateDescription();
  }

  function syncRadios() {
    for (var n = 1; n <= 3; n++) {
      radios[n].checked = (state.onTop === String(n));
    }
  }

  function syncProxies() {
    for (var n = 1; n <= 3; n++) {
      var f = state.fields[n];
      var p = proxies[n];
      if (!f.visible) {
        p.style.display = 'none';
        continue;
      }
      p.style.display = 'block';
      p.style.left = ((f.x - WORK.x) / WORK.w * 100) + '%';
      p.style.top = ((f.y - WORK.y) / WORK.h * 100) + '%';
      p.style.width = (STARFIELD_W / WORK.w * 100) + '%';
      p.style.height = (STARFIELD_H / WORK.h * 100) + '%';
      p.style.zIndex = String(state.zOrder.indexOf(n) + 1);
      var onTopNote = (state.onTop === String(n)) ? ', on top' : '';
      if (n === 1) {
        p.setAttribute('aria-label',
          'Starfield 1, reference image, fixed position' + onTopNote +
          '. Press Enter to bring it on top.');
      } else {
        var o = offsetsOf(n);
        p.setAttribute('aria-label',
          'Starfield ' + n + ', x offset ' + o.x + ' pixels, y offset ' + o.y +
          ' pixels' + onTopNote + '. Use arrow keys to move it.');
      }
    }
  }

  function updateDescription() {
    var parts = ['The work area shows up to three star field images of the same stars, stacked on top of each other.'];
    for (var n = 1; n <= 3; n++) {
      if (!state.fields[n].visible) {
        parts.push('Starfield ' + n + ' is hidden.');
      } else if (n === 1) {
        parts.push('Starfield 1 is shown at its fixed position' + (state.onTop === '1' ? ' and is on top.' : '.'));
      } else {
        var o = offsetsOf(n);
        parts.push('Starfield ' + n + ' is shown at x offset ' + o.x + ' pixels, y offset ' + o.y +
          ' pixels' + (state.onTop === String(n) ? ' and is on top.' : '.'));
      }
    }
    if (state.onTop === 'none') { parts.push('No star field is on top.'); }
    if (state.useAlpha && state.onTop !== 'none') { parts.push('The top field is drawn partially transparent.'); }
    if (state.inverted) { parts.push('Colors are inverted: stars appear dark on a light background.'); }
    parts.push('The images are aligned when the same stars overlap exactly.');
    desc.textContent = parts.join(' ');
  }

  /* ================= pointer dragging (MainTimeline drag handlers) ====== */

  var draggingId = null;
  var xDraggingOffset = 0, yDraggingOffset = 0;
  var activePointerId = null;

  function stageCoords(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * WORK.w / r.width + WORK.x,
      y: (e.clientY - r.top) * WORK.h / r.height + WORK.y
    };
  }

  // Topmost visible field under the stage point (display-list hit test).
  // The border stroke extends half its width beyond the field rect.
  function hitTestField(sx, sy) {
    for (var i = state.zOrder.length - 1; i >= 0; i--) {
      var id = state.zOrder[i];
      var f = state.fields[id];
      if (!f.visible) { continue; }
      if (sx >= f.x - 1.5 && sx <= f.x + STARFIELD_W + 1.5 &&
          sy >= f.y - 1.5 && sy <= f.y + STARFIELD_H + 1.5) {
        return id;
      }
    }
    return null;
  }

  // MainTimeline.onStarFieldPressed()
  function onPointerDown(e) {
    if (!e.isPrimary) { return; }
    var p = stageCoords(e);
    var id = hitTestField(p.x, p.y);
    if (id === null) { return; }
    e.preventDefault();
    proxies[id].focus();               // click-to-focus for the keyboard path
    setOnTop(String(id));
    if (id !== 1) {
      draggingId = id;
      xDraggingOffset = (p.x - state.fields[id].x) | 0;   // int casts as in AS
      yDraggingOffset = (p.y - state.fields[id].y) | 0;
      activePointerId = e.pointerId;
      stage.setPointerCapture(e.pointerId);
    }
  }

  // MainTimeline.onStarFieldMoved() — including the offset re-anchoring at the limits
  function onPointerMove(e) {
    if (draggingId === null || e.pointerId !== activePointerId) { return; }
    var p = stageCoords(e);
    var x = (p.x - xDraggingOffset) | 0;
    var y = (p.y - yDraggingOffset) | 0;
    if (x < LIMITS.left) {
      x = LIMITS.left;
      xDraggingOffset = (p.x - x) | 0;
    } else if (x > LIMITS.right) {
      x = LIMITS.right;
      xDraggingOffset = (p.x - x) | 0;
    }
    if (y < LIMITS.top) {
      y = LIMITS.top;
      yDraggingOffset = (p.y - y) | 0;
    } else if (y > LIMITS.bottom) {
      y = LIMITS.bottom;
      yDraggingOffset = (p.y - y) | 0;
    }
    state.fields[draggingId].x = x;
    state.fields[draggingId].y = y;
    updatePositionInputs();
    render();
  }

  // MainTimeline.onStarFieldReleased()
  function onPointerUp(e) {
    if (draggingId === null || e.pointerId !== activePointerId) { return; }
    var id = draggingId;
    draggingId = null;
    activePointerId = null;
    announcePosition(id);              // announce on commit, not per move tick
  }

  /* ================= keyboard =========================================== */

  function isTextInput(el) {
    return !!el && el.tagName === 'INPUT' && el.type === 'text';
  }

  function moveFieldBy(id, dx, dy) {
    var f = state.fields[id];
    changeStarFieldPosition(id, { x: f.x + dx, y: f.y + dy });
  }

  // Keyboard path for the draggable fields (focus proxy + arrow keys)
  function onProxyKeyDown(id, e) {
    var handled = false;
    if (id !== 1) {
      var step = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'ArrowLeft':  setOnTop(String(id), false); moveFieldBy(id, -step, 0); handled = true; break;
        case 'ArrowRight': setOnTop(String(id), false); moveFieldBy(id, step, 0);  handled = true; break;
        case 'ArrowUp':    setOnTop(String(id), false); moveFieldBy(id, 0, -step); handled = true; break;
        case 'ArrowDown':  setOnTop(String(id), false); moveFieldBy(id, 0, step);  handled = true; break;
        case 'PageUp':     setOnTop(String(id), false); moveFieldBy(id, 0, -10);   handled = true; break;
        case 'PageDown':   setOnTop(String(id), false); moveFieldBy(id, 0, 10);    handled = true; break;
      }
      if (handled) { announceMoveDebounced(id); }
    }
    if (!handled && (e.key === 'Enter' || e.key === ' ')) {
      setOnTop(String(id));
      handled = true;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // MainTimeline.onKeyDownFunc(): stage-level 'a' shortcut and arrow keys for
  // the on-top field. Scoped so it never fights native control keyboard use:
  // skipped while typing in a text input (caret keys) or on a radio button
  // (arrow keys change the selection there).
  function onGlobalKeyDown(e) {
    var t = e.target;
    if (e.key === 'a' || e.key === 'A') {
      if (!isTextInput(t)) { goToNextVisibleField(); }
      return;
    }
    if (t && t.classList && t.classList.contains('rs-field-proxy')) { return; }
    if (isTextInput(t)) { return; }
    if (t && t.tagName === 'INPUT' && t.type === 'radio') { return; }
    var cur = parseInt(state.onTop, 10);
    if (cur !== 2 && cur !== 3) { return; }
    var handled = true;
    switch (e.key) {
      case 'ArrowLeft':  moveFieldBy(cur, -1, 0); break;
      case 'ArrowUp':    moveFieldBy(cur, 0, -1); break;
      case 'ArrowRight': moveFieldBy(cur, 1, 0);  break;
      case 'ArrowDown':  moveFieldBy(cur, 0, 1);  break;
      default: handled = false;
    }
    if (handled) {
      e.preventDefault();
      announceMoveDebounced(cur);
    }
  }

  /* ================= text inputs ======================================== */

  // TextInput restrict "-0-9", maxChars 3 (maxlength in the markup)
  function restrictInput(e) {
    var el = e.target;
    var cleaned = el.value.replace(/[^\-0-9]/g, '');
    if (cleaned !== el.value) { el.value = cleaned; }
  }

  // MainTimeline.onStarField2ChangeViaTextInput / onStarField3ChangeViaTextInput:
  // both offsets are re-applied from both inputs on enter or focus-out.
  function commitOffsets(n) {
    changeStarFieldPosition(n, {
      x: state.fields[1].x + parseFloat(xInputs[n].value),
      y: state.fields[1].y + parseFloat(yInputs[n].value)
    });
    announcePosition(n);
  }

  /* ================= reset (masthead "sim-reset" event) ================= */

  function resetSim() {
    state.fields = initialFieldState();
    state.zOrder = [1, 2, 3];
    state.onTop = '1';
    state.useAlpha = false;
    state.inverted = false;
    onTopChanged();                    // moves field 1 to the top, as at startup
    for (var n = 1; n <= 3; n++) {
      showBoxes[n].checked = state.fields[n].visible;
      radios[n].disabled = !state.fields[n].visible;
    }
    syncRadios();
    alphaBox.checked = false;
    invertBox.checked = false;
    updatePositionInputs();
    render();
    announce('Simulation reset to its initial state. Starfield 1 is shown and on top; starfields 2 and 3 are hidden.');
  }

  /* ================= init =============================================== */

  function init() {
    canvas = document.getElementById('rs-canvas');
    stage = document.getElementById('rs-stage');
    live = document.getElementById('rs-live');
    desc = document.getElementById('rs-desc');
    advanceButton = document.getElementById('rs-advance');
    alphaBox = document.getElementById('rs-alpha');
    invertBox = document.getElementById('rs-invert');

    for (var n = 1; n <= 3; n++) {
      showBoxes[n] = document.getElementById('rs-show-' + n);
      radios[n] = document.getElementById('rs-ontop-' + n);
      proxies[n] = document.getElementById('rs-proxy-' + n);
      if (n > 1) {
        xInputs[n] = document.getElementById('rs-x-' + n);
        yInputs[n] = document.getElementById('rs-y-' + n);
      }
    }

    // Canvas backing store at stage resolution x devicePixelRatio; CSS scales it.
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(WORK.w * dpr);
    canvas.height = Math.round(WORK.h * dpr);
    ctx = canvas.getContext('2d');

    // Controls
    for (n = 1; n <= 3; n++) {
      (function (id) {
        showBoxes[id].addEventListener('change', function () { onShowToggled(id); });
        radios[id].addEventListener('change', function () {
          if (radios[id].checked) { setOnTop(String(id)); }
        });
        proxies[id].addEventListener('keydown', function (e) { onProxyKeyDown(id, e); });
        if (id > 1) {
          [xInputs[id], yInputs[id]].forEach(function (el) {
            el.addEventListener('input', restrictInput);
            el.addEventListener('blur', function () { commitOffsets(id); });
            el.addEventListener('keydown', function (e) {
              if (e.key === 'Enter') { commitOffsets(id); }
            });
          });
        }
      })(n);
    }

    advanceButton.addEventListener('click', function () {
      goToNextVisibleField();
      if (state.onTop !== 'none') { announce('Starfield ' + state.onTop + ' is now on top.'); }
    });

    alphaBox.addEventListener('change', function () {
      state.useAlpha = alphaBox.checked;   // updateFieldAlphas()
      render();
      announce(alphaBox.checked ? 'The top field is now drawn partially transparent.'
                                : 'The top field is now fully opaque.');
    });

    invertBox.addEventListener('change', function () {
      state.inverted = invertBox.checked;  // GammaTransferFunction.inverted
      render();
      announce(invertBox.checked ? 'Colors inverted: stars now appear dark on a light background.'
                                 : 'Colors restored: stars appear bright on a dark background.');
    });

    // Pointer drag: one Pointer Events path for mouse, touch, and pen
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);

    // Stage-level keyboard shortcuts ('a' + arrows for the on-top field)
    document.addEventListener('keydown', onGlobalKeyDown);

    // Masthead Reset button
    document.addEventListener('sim-reset', resetSim);

    // Startup sequence tail of frame1: field 1 selected on top, then the
    // explicit onTopFieldChangedViaRadioButton() + updatePositionTextInputs()
    onTopChanged();
    updatePositionInputs();
    render();
  }

  // The foundation's kl-unl.js expects sims to redefine klunlInitEqn().
  // This simulation displays no mathematical equations or symbols, so there
  // is nothing to typeset with MathJax; initialization only boots the sim.
  window.klunlInitEqn = function () { /* no equations in this simulation */ };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
