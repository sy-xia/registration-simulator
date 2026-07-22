# Registration Simulator (Accessible HTML5)

**This simulation must be served over HTTP — it will NOT run from a double-clicked
`index.html` (`file://`) path.**

## Why

The KL-UNL masthead component (`foundation/kl-unl-masthead.js`) loads the
simulation title and the Help/About text with `fetch('foundation/contents.json')`.
For security (the same-origin policy), browsers block `fetch()` of local files
under the `file://` protocol, so opening `index.html` directly from the file
system shows an empty or broken masthead. Served over HTTP the fetch succeeds
and the sim loads normally.

## How to run locally

Run one of these from **inside the `html5/` folder**, then open the printed URL:

```
# Python
python3 -m http.server 8123        # then open http://localhost:8123/

# Node
npx serve                          # or: npx http-server

# VS Code
Use the "Live Server" extension on index.html
```

Note the sim is at the server root when you serve from inside `html5/`, so the
URL is `http://localhost:8123/` — not `.../html5/index.html`.

## Production

When deployed to the cloud host (served over HTTP/HTTPS) it just works; the
`file://` limitation only affects local double-clicking.

## Contents

| File | Purpose |
| --- | --- |
| `index.html` | KL-UNL shell: masthead + Work Area / Starfield Controls / Appearance Options panels |
| `simulation.js` | All simulation logic (faithful port of the decompiled ActionScript) |
| `styles/styles.css` | Sim-specific styles layered on the foundation (foundation files untouched) |
| `foundation/` | KL-UNL foundation files, copied unchanged (only this sim's `contents.json` entry edited) |
| `CONVERSION_NOTES.md` | Behavior model, AS→HTML5 mapping, quirks, deviations |
| `ACCESSIBILITY.md` | WCAG affordances, keyboard map, screen-reader wording |
