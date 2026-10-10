# lsl.dev logo

An S with blue L terminals (reading **L-S-L**) cut out of a script page with an upper-left fold,
plus custom "lsl.dev" lettering. Chosen after four rounds of prototypes: the mark is "33 Left Fold",
the lettering is from "18 Continuous Scroll". The direction and decisions are in
[docs/design/logo-brief.md](../../docs/design/logo-brief.md).

- `generate.mjs`: draws everything from the geometry and palette in the script (16-unit grid).
  Run `bun design/logo/generate.mjs` from the repo root. It writes `assets/` and copies the site's
  files: `src/assets/logo.{light,dark}.svg` (hero), `src/assets/wordmark.{light,dark}.svg`
  (header), `public/favicon.svg` (the 32 px version) and `public/apple-touch-icon.png`.
- `lettering.svg.txt`: the "lsl.dev" letter paths, used by the generator.
- `assets/`: the generated marks, lockups, 16/32 px favicons (the 16 px one drops the blue
  terminals) and the 180 px app icon.

Palette: navy `#16254D`, accent `#3366FF`, tint `#C4D2FF`. The fold is a darker shade of the page
(`#0C1836` on light backgrounds, `#A5B4E0` on dark), never the accent. "light" and "dark" in file
names mean the background the asset sits on.
