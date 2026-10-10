# lsl.dev logo brief

Paste everything below the line into the design tool.

---

Design a logo for **lsl.dev**, an unofficial, community-made documentation site for **LSL (Linden
Scripting Language)**, the scripting language of the virtual world **Second Life**. Its sister site
is **slua.dev** (docs for SLua, Second Life's Luau-based language); the two should feel like a family.

Please produce **12–16 distinct prototypes**, exploring different directions, for example:

- Abstract marks built from code punctuation (curly braces, semicolon, angle brackets `<x, y, z>`
  which is LSL's vector syntax).
- A monogram or ligature of "LSL".
- Ideas from scripted objects in Second Life: a prim (a basic 3D shape such as a cube or sphere),
  a linkset (several linked shapes), a rotation or quaternion, an event or state.
- A clean wordmark "lsl.dev" with a small symbol.

Requirements:

- **Colour:** primary accent **#3366FF** (hsl 224, 100%, 60%), light tint **#B3C6FF**, and dark
  navy **#16254D** (hsl 224, 54%, 20%). Neutral greys are fine. No gradients needed; flat works best.
- **Two variants of each:** one for **dark backgrounds** and one for **light backgrounds**.
- **Must work small:** each concept needs a **favicon** version that stays legible at
  **16×16 and 32×32 px**, plus an **app icon at 180×180 px** (iOS touch icon). It's fine if the
  favicon simplifies the mark (e.g. drops the wordmark).
- **Format:** **SVG** (clean vector paths, no embedded raster images, text converted to outlines
  or limited to a system font). Square artboard for the mark; a wide version for mark + wordmark.
- **Style:** simple, geometric, technical and friendly. Avoid Linden Lab's or Second Life's own
  logos and trademarks (the site is unofficial and must not look official), and avoid generic
  clip-art "code" icons.

For each prototype give: a name, a one-line idea, the dark and light SVGs, the 16/32/180 px
favicon versions, and the wordmark lockup.

---

## Hand-off

Save the results under `design/logo-prototypes/<NN>-<name>/` in this repo (any file names), then ask
Claude to build the comparison page. That page shows each prototype on light and dark, at favicon
sizes, in the site header and next to slua.dev's logo. The chosen design then replaces
`src/assets/logo.{light,dark}.svg` and `public/favicon.svg`, and a PNG apple-touch-icon is added.

## Decisions so far

- **Wordmark:** the custom lettering from prototype 18 (Continuous Scroll): curled L feet, a flowing
  S and a round dot (`design/logo-prototypes/18-continuous-scroll/wordmark-{light,dark}.svg`).
  Pair it with whichever mark is chosen.
- **Mark direction:** 18's idea of L-shaped terminals standing in for the S's serifs (reading
  L-S-L), drawn the way 17 (Serpentine Page) draws its S: as a cutout through a dog-eared script
  page. Round three (22–29) explores this; 22, 26 and 27 are the closest so far. 12 (Script Fold)
  was the round-one favourite.
- **Favicon:** expect a simplified version of the mark at 16 px, because the L serifs disappear at
  that size.

## Final

Prototype **33 Left Fold** with **18**'s lettering, kept in [design/logo/](../../design/logo/) with
its generator. The prototype folders were retired after the choice was made.
