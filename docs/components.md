# Authoring components

The MDX components for guides, recipes, feature pages and API pages, built on Starlight. Design:
[design/components-plan.md](design/components-plan.md). Every component is shown, in every state,
on the hidden showcase page `/meta/components/`
(`src/content/docs/meta/components.mdx`; not in the sidebar, search or sitemap).

Import what you use from the single barrel:

```mdx
import { Gotcha, RecipeMeta, Param } from '~/components/authoring';
```

Starlight's own components (Aside, Tabs, Steps, FileTree, Card, Badge, Icon) and Expressive Code
features (titles, markers, collapse) still work as before.

Rules that apply to every component:

- Props are strings, numbers, booleans or short string lists (`{["a","b"]}`). Boolean props are
  bare attributes.
- Children are Markdown. You never need HTML.
- Every component exports to readable Markdown for the page's `.md` version (Copy page, View as
  Markdown). The build fails if an authoring component has no Markdown form.
- Pages need a current evergreen browser (see the required-features note in
  `src/components/authoring/shared/tokens.css`). Nothing needs JavaScript to show its content.

<!-- Each batch fills only its own section below. -->

## Asides and disclosure

Caveat, Gotcha, Performance, Limit, LimitsTable, Details, FAQ, Since. Showcase:
`/meta/components/#showcase-asides`.

```mdx
import { Caveat, Gotcha, Experimental, Performance, Limit, LimitsTable, Details, FAQ, Since } from '~/components/authoring';
```

**Asides.** All asides share one look: a left rule and a tint in a semantic colour. Starlight's
own (`:::note`, `:::tip`, `:::caution`, `:::danger`, `<Aside>`) are restyled to match. Note,
Caveat and Limit are neutral gray-blue, tip and Performance green, caution, Gotcha and Experimental orange,
danger red. Accent blue is kept for links. Each takes an optional `title`.

```mdx
<Caveat>Figures come from the wiki and may be out of date.</Caveat>
<Gotcha>`llSetTimerEvent(0)` stops the timer, but a pending event may still fire once.</Gotcha>
<Performance>Avoid `llSleep` in busy event handlers.</Performance>
```

**Experimental.** `<Experimental feature="Game control" />` marks a feature Linden Lab may still
change, with a default sentence (or your own body). API pages in a category listed in
`src/components/authoring/asides/experimental.ts` get one automatically under the header.

Export: `> **Gotcha:** body`, with the whole body (every paragraph, list and code block) in the quote.

**Limits.** The figures on `/reference/limits/` live in `src/data/limits.yaml`, one entry per
table row (119 rows in 17 sections). Each entry has an `id`, `section` and `label`; `value`, or
`lower` and `upper`; `notes`; `related` (the "More coverage" cell); and `apis`/`features`. Every
text field is Markdown, copied word for word from the wiki. The row's id is its anchor
(`/reference/limits/#scripting-max-active-listeners-per-script`). Don't rename ids, since pages
link to them. An unknown id or section fails the build.

```mdx
A chat message is at most <Limit id="communication-length-chat-message-truncated" />.
<Limit id="scripting-max-active-listeners-per-script" note />
<Limit id="building-count-prims-linkset" note title="Linkset size">Extra Markdown after the note.</Limit>
<LimitsTable section="scripting" />
```

- `<Limit id>` puts the value inline (the upper limit, or "lower to upper"), linked to its row.
  With `note`, it becomes a callout with the label, the value and the row's note. Children are
  only allowed together with `note`.
- `<LimitsTable section>` renders one section's table with its own columns. It is used on the
  Limits page, and you can reuse it on other pages.
- To change a figure, edit the YAML, not `limits.mdx`. The page keeps its own prose, asides and
  footnotes.
- Export: `[value](/reference/limits/#id)`, a quoted callout, or a Markdown table.

**Details and FAQ.** These are native `<details>` elements, closed by default, and need no
JavaScript. The id defaults to a slug of the summary, and a link to `#id` opens the item.
`<FAQ exclusive>` gives its items a shared `name`, so only one is open at a time.

```mdx
<Details summary="Why does my timer drift?">Timers are throttled under sim lag.</Details>
<FAQ title="Timers" exclusive>
<Details summary="Why does my timer drift?">…</Details>
<Details summary="Can I use llSleep instead?" open id="sleep">…</Details>
</FAQ>
```

Props: Details `summary` (required), `open`, `id`; FAQ `title`, `exclusive`. Export:
`**Summary**` followed by the body; inside a FAQ each question is `### Summary` followed by the
answer, and the FAQ title is `### Title`.

**Figure.** Images moved to the media batch: see [Media](#media) (Figure, zoom, Compare, Hotspots, Gallery).

**Since.** A small outline badge reading "Since Nov 2022". `date` is `YYYY-MM` or `YYYY-MM-DD`.
An optional `note` opens as a hint popover on hover, focus or click.

```mdx
## llLinksetDataWrite <Since date="2022-11" />
<Since date="2022-11-04" note="Server 2022-11-04" />
```

Export: `(since 2022-11)`.

## Recipe kit

RecipeMeta, Prerequisites, ScriptFile, Requires, Steps and BuildStep. Showcase:
`/meta/components/#showcase-recipe`.

```mdx
import { RecipeMeta, Prerequisites, Requires, Steps, BuildStep, ScriptFile } from '~/components/authoring';
```

**`<RecipeMeta>`**: the summary at the top of a recipe, an inline row of two small labelled chips
(`SCRIPTS 1` `TIME 15 min`, a `<dl>` with one `<div>` per fact; wraps on a phone): `scripts`
(default 1) and an optional free-text `time`. Exports as `**Scripts:** 1 · **Time:** 15 min`. Prims are shown by `<Scene>` (with `<Inventory>` for their contents; see [Scene](#scene)) and permissions by `<Requires>`, so they aren't repeated here.

```mdx
<RecipeMeta scripts={1} time="15 min" />
```

**`<Prerequisites>`**: a "What you need to know" box for recipes and guides. Children are an
ordinary Markdown list of links (they get inline-code styling and hover cards like any link);
`title` is optional and defaults to "What you need to know". Renders as
`<aside class="au-prereq" aria-label="…">` with a visible label; no JS. Exports to Markdown as
`**What you need to know**` (or the title) followed by the list.

```mdx
<Prerequisites>
- [States and events](/fundamentals/states-and-events/)
- [`llSetLinkPrimitiveParamsFast`](/functions/llSetLinkPrimitiveParamsFast/)
</Prerequisites>
```

**`<Requires>`**: static badges for what a script needs. Closed vocabulary: `permissions`
(`PERMISSION_*` constants), `experience`, `land` (`build`, `scripts`, `owner` or `group`),
`attachment`, `seated`, `owner` (owner only). Any other prop or value fails the build. Permissions
that always ask the owner, such as `PERMISSION_DEBIT`, get the caution colour.

```mdx
<Requires permissions={["PERMISSION_ATTACH"]} experience land="build" attachment />
```

**`<ScriptFile>`**: says which prim a script goes in. Wrap exactly one code block, and give the
fence a `title` equal to `name` (the build fails otherwise). Copy comes from the code block. The
block gets the anchor `#script-<name>`, e.g. `#script-door-lsl`.

````mdx
<ScriptFile name="door.lsl" in="Door frame (root)">
```lsl title="door.lsl"
default { touch_start(integer n) { llSay(0, "Hi"); } }
```
</ScriptFile>
````

**`<Steps>` and `<BuildStep>`**: `Steps` is Starlight's Steps, so a plain numbered list works as
before. Inside it you can instead write `<BuildStep title>` blocks; they become one numbered list.
The title is bold text, not a heading (it stays out of the table of contents), and the step gets
the anchor `#step-<slug of title>` (override with `id`). For long builds, put `##` sections
between several `Steps`.

```mdx
<Steps>
<BuildStep title="Rez and link the prims">
Select the frame last before you link, so it becomes the root.
</BuildStep>
<BuildStep title="Add the script">
Drop `door.lsl` into the frame.
</BuildStep>
</Steps>
```

## API hover cards

Automatic on links to API pages. Opt out with `<NoCard>` or frontmatter `hoverCards: false`.
Showcase: `/meta/components/#showcase-hovercards`.

There is nothing to write: every link to `/functions/…/`, `/events/…/` or `/constants/…/` in a
Markdown or MDX page gets a card with the signature (LSL-highlighted), the first sentence of
the description and chips for sleep, non-default energy, required permissions, experience,
god mode and SLua status. The link itself doesn't change and still navigates on click and tap.

How it works:

- `scripts/build-hovercards.ts` (run by `bun run dev` and `bun run build`) slims
  `src/data/catalog.json` into the git-ignored `src/data/hovercards.json` (about 270 KB, read
  at build time only, never shipped).
- `hovercards/rehype-api-hovercards.ts` runs after `rehype-inline-lsl`. It emits **one card per
  API per file** (the page, or an imported MDX partial): a `<span popover="hint" class="au-popover hc"
  id="hc<file hash>-<name>">` appended at the end of that file's content. Every link to the API in
  the file gets `interestfor` pointing at that one card. The card is `aria-hidden`,
  `data-pagefind-ignore` and holds no links.
- The card anchors to whichever link opened it: an invoker is the popover's implicit anchor, so
  there's no `anchor-name` on the links. CSS anchor positioning places it below that link and flips
  it when there's no room. It lives in the top layer, so tables and scroll containers never clip it.
- Browsers with `interestfor` open it on hover and focus natively. Elsewhere a small inline
  script (`hovercards/PageEnd.astro`, under 1 KB) does the same with a 300 ms hover delay; Esc
  closes. It opens the card with `showPopover({ source: link })` and also sets `anchor-name` on the
  active link (the card's `position-anchor`) for engines without `source`. Touch never opens a card.
- Only APIs with a reference page get a card or a link: deprecated or private names such as
  `llSetPrimitiveParams` (in the catalog's `deprecated` list, no page) are shown as highlighted
  code without a link, even when written as `[llSetPrimitiveParams](/functions/llSetPrimitiveParams/)`.
- Skipped: links to the page itself, links in headings and code blocks, and the sidebar.
- Markdown export: cards exist only in the HTML, so the `.md` export shows plain links.

Opt out for one link or a run of text:

```mdx
import { NoCard } from '~/components/authoring';

<NoCard>[llSay](/functions/llSay/)</NoCard>
```

Opt out for a whole page (use rarely, e.g. a page that is a dense list of links):

```yaml
hoverCards: false
```

## Guide kit

FunctionSignature, Param, Returns, Params. Showcase: `/meta/components/#showcase-guide`.

Document a function a guide defines (not an API function: those have their own pages).
`<FunctionSignature>` is the usual form: an LSL-highlighted code block of the signature, one parameter per
line, with each explanation as a full-width row under its line (like a code editor's inline hints).

```mdx
import { FunctionSignature, Param, Returns } from '~/components/authoring';

<FunctionSignature returns="float" name="InterpolateFloatHermite">
<Param type="float" name="a">Point before the segment.</Param>
<Param type="float" name="t">Position along the segment, `0.0` to `1.0`.</Param>
<Returns>The interpolated value.</Returns>
</FunctionSignature>
```

| Component | Props |
|---|---|
| `<FunctionSignature>` | `name` (required), `returns?` (omit or `void` for none); children are `<Param>`s and one optional `<Returns>` |
| `<Param>` | `type` (required), `name` (required), `deprecated` |
| `<Returns>` | `type` (required outside a FunctionSignature; inside, the FunctionSignature's `returns` is used) |
| `<Params>` | `title?`; optional bordered group around standalone Param/Returns entries |

- Type comes first, as in LSL (`integer channel`). There is no `required` or `default`: LSL has no
  optional parameters, so say in the description what to pass for the usual behaviour
  ("Pass `0.0` for none.").
- Rendering: same highlighting and colours as the API pages' syntax block (inline-lsl, types
  linked to their `/fundamentals/types/` page). The code lines are `float InterpolateFloatHermite(`, one indented
  `type name,` line per Param, then `)`; the Returns row sits under the first line wherever it is
  written. Rows are faint accent bands in the body font and take any inline Markdown (code, links,
  hover cards); keep each description on the same line as its tag.
- Copying: the Copy button (added by the guide PageEnd script) copies the plain signature, and a
  selection that spans an explanation row copies only the code lines.
- Accessibility: each Param is a one-entry `<dl>` (code line in `<dt>`, explanation in `<dd>`), the
  block is a `role="group"` labelled "Signature of …"; "deprecated" is a text badge.
- Export: the signature as an ` ```lsl ` fence, then a list: ``- `float a`: Point before…`` and
  ``- **Returns** `float`: The interpolated value.``
- Standalone `<Param>`/`<Returns>` (optionally inside `<Params>`) still work for things that are
  not one function, such as the fields of a link message: `type name` with the description below.
  Export: ``- `key target`: Avatar to follow.`` and ``**Returns** `integer`: …``.

Coming later (deferred, see the Deferred section): `<CodeGroup>` LSL ⇄ SLua tabs, and the
`<StateFlow>` / `<EventFlow>` diagrams.

## Media

Figure, Compare, Hotspots, Hotspot, Gallery, and zoom (`<Figure zoom>`). Showcase:
`/meta/components/#showcase-media`.

```mdx
import { Figure, Compare, Hotspots, Hotspot, Gallery } from '~/components/authoring';
```

Shared rules: every image is local. A string `src` (or `before`/`after`) is a path under `src/`
(`~/assets/…`), and an imported image (`src={img}`) also works. A remote or missing image fails
the build. Alt text is required (`alt=""` only for a purely decorative image). Captions are
optional. Without JavaScript everything stays visible. Only Compare uses JS, and only to move its
slider (`media/PageEnd.astro`, about 320 bytes inline).

**Figure.** Just a local image, with an optional caption given as a prop or as Markdown children.

```mdx
<Figure src="~/assets/door-linkset.png" alt="Door linkset in edit mode" caption="The root prim is highlighted yellow." />
<Figure src="~/assets/door-linkset.png" alt="…" width={320}>Caption with **Markdown**.</Figure>
```

Export: `![alt](/_astro/…)` (the built image URL) followed by the caption. If the src can't be
resolved (an imported image passed as `src={img}`), `*[Figure: alt]*` instead.

**Zoom.** Add `zoom` to a Figure to make it click-to-enlarge. The thumbnail (usually with a
`width`) becomes a button named "Enlarge: <alt>". It opens a popover with the full-size image,
fitted to the viewport over a dark backdrop. Escape, a click outside and the close button all
close it. No JS: `popovertarget` and `popover="auto"`.

```mdx
<Figure src="~/assets/build-floater.png" alt="The Build floater" width={240} caption="Click to enlarge." zoom />
```

Export: the image at its full-size URL, then the caption.

**Compare.** Two images of the same aspect ratio (otherwise the build fails), stacked, with a
slider revealing `before` on the left over `after` on the right. The slider is a native range
input (named "Reveal: Plain (left) and Textured (right)"). It covers the image, so a drag
anywhere or the arrow keys move it. A divider with a grip and the two labels in the top corners
show where it is. `start` is the initial split in percent (default 50). The labels default to
"Before" and "After". Without JS the two images sit side by side, each with its label.

```mdx
<Compare before="~/assets/plain.png" after="~/assets/textured.png"
  beforeAlt="A plain grey cube" afterAlt="The same cube with a wood texture"
  beforeLabel="Plain" afterLabel="Textured" caption="Drag to compare." start={30} />
```

Export: `**Plain**`, its image, `**Textured**`, its image, then the caption.

**Hotspots.** Numbered markers over an image, one per `<Hotspot>` child. `x` and `y` are
percentages from the top-left corner of the image, and `label` is required. The note (Markdown
children) opens in a hint popover anchored to the marker when you hover it or focus it with the
keyboard (`interestfor`, with a small fallback script elsewhere), with no click needed. A click,
Enter or Space also opens it and keeps it open. On touch a tap opens it and a second tap closes
it. A click outside or Escape closes it. CSS anchor positioning flips the popover to stay on screen. Each
marker is named "1: label", for example. The same notes are listed below the image as a
numbered list, for screen readers, print and readers without popovers. Keep one-paragraph notes
on the same line as the tag. For several paragraphs, put blank lines inside the tag.

```mdx
<Hotspots src="~/assets/build-floater.png" alt="The Build floater, Object tab" caption="The Object tab.">
<Hotspot x="15%" y="21%" label="Object tab">Prim properties: position, size, rotation.</Hotspot>
<Hotspot x="44%" y="31%" label="Position">Region coordinates, read with [llGetPos](/functions/llGetPos/).</Hotspot>
</Hotspots>
```

Props: Hotspots `src`, `alt`, `caption?`, `width?`; Hotspot `x`, `y`, `label`. Export: the image,
then `1. **label**: note` for each hotspot, then the caption.

**Gallery.** A responsive grid of zoomable figures. It has 2 columns, 3 from a width of 30rem and
4 from 48rem (container queries on the gallery's own width), and 1 when it is very narrow. Each
child is a `<Figure … zoom />`; the build fails if a Figure inside lacks `zoom`. Thumbnails are
cropped to 4:3, and the enlarged view shows the whole image. `label` is an optional accessible
name for the group. In the enlarged view, previous/next buttons at the sides and the Left/Right
arrow keys move through the images (Home/End go to the first and last). Navigation wraps
around: next on the last image shows the first. The view shows its position ("3 / 6"), its
accessible name ends in "(3 of 6)", and focus stays inside it (Tab cycles close, previous and
next). Escape or a click outside closes it and returns focus to that image's thumbnail.

```mdx
<Gallery label="Texture swatches">
<Figure src="~/assets/sky.png" alt="Blue gradient swatch" caption="Sky" zoom />
<Figure src="~/assets/grass.png" alt="Green gradient swatch" caption="Grass" zoom />
</Gallery>
```

Export: each figure's image and caption, one after another.

## Scene

Scene, Prim, Model, Inventory and Item: an interactive 3D view of an object or linkset, and a
prim's contents. Showcase: `/meta/components/#showcase-scene`.

```mdx
import { Scene, Prim, Model, Inventory, Item } from '~/components/authoring';
```

**`<Scene>`** holds `<Prim>` and `<Model>` parts, exactly one of them `root`. Props: `caption`
(required; it also names the canvas for screen readers), `explode` (adds an Explode toggle) and
`grid` (a subtle ground grid under the object).

```mdx
<Scene caption="A hinged door" explode grid>
<Prim name="Door frame" root shape="box" size="1.3, 0.14, 0.12" pos="0, 0, 2.16" inventory="door-frame" />
<Prim name="Door panel" shape="box" size="1.04, 0.05, 2.06" pos="0, 0, -1.11" color="#8a6" note="Rotates around its hinge edge" />
<Prim name="Handle" shape="cylinder" size="0.04, 0.04, 0.15" pos="0.4, 0.06, -1.16" rot="90, 0, 0" />
<Model name="Knob" src="~/assets/knob.glb" pos="0.4, -0.06, -1.16" />
</Scene>
```

Units and axes are Second Life's: metres, Z up, and `rot` in Euler degrees applied in LSL order
(X, then Y, then Z, as `llEuler2Rot`). Vectors are three numbers, `"x, y, z"` (angle brackets are
allowed). The root's `pos` places the object above the ground. Every other part's `pos` and `rot`
are local to the root, like `PRIM_POS_LOCAL` and `PRIM_ROT_LOCAL`, and turn with it.

**`<Prim>`** props: `name` (required, unique in the scene), `shape` (`box`, `cylinder`, `sphere`,
`torus` or `prism`, oriented as in SL: a cylinder's axis is Z, a torus revolves around X with hole
size 0.25, and a prism is a triangle in XY extruded along Z), `size` (0.01 to 64 m per axis,
default `0.5, 0.5, 0.5`), `pos`, `rot`, `root`, `color` (hex), `alpha` (0 to 1), `texture` (a local
image under `src/`, png, jpg or webp), `note` and `inventory` (the `id` of an `<Inventory>`).

**`<Model>`** is a local binary glTF (`.glb` under `src/`), placed like a prim: `src`, `name`,
`pos`, `rot`, `scale` (default `1, 1, 1`), `root`, `note`, `inventory`. It is turned from glTF's
Y-up to Z-up.

The build fails on an unknown shape or prop, a malformed vector or colour, a size out of range,
no root or more than one, two parts with the same name, or a missing or remote model or texture.

How it behaves:

- **Loading.** three.js is bundled locally and fetched only when a scene scrolls near the
  viewport (an IntersectionObserver and a dynamic import). Pages without a scene ship none of it.
  The viewer chunk is about 144 KB gzipped. GLTFLoader is a further 13 KB, fetched only for scenes
  with a `<Model>`. The loader script on scene pages is under 0.5 KB.
- **Controls.** Drag to orbit, and scroll or pinch to zoom. SL-style alt-cam: Alt+drag orbits
  around the point you click, Ctrl+Alt+drag pans, Shift+Alt+drag zooms (right or middle drag and
  two fingers also pan). The **Turn** slider (a native range, so it works from the keyboard) sets
  the view's rotation, and **Reset view** restores the first view. With the canvas focused, the
  arrow keys orbit (Shift for bigger steps), `+`/`-` zoom and Home resets.
- **Explode.** The toggle (`aria-pressed`) moves each part away from the root along its offset
  and frames the result. It then labels every part with its name and note, with a leader line.
  Labels are DOM boxes placed by JS from projected 3D points, nudged apart so they don't overlap.
  In narrow scenes (under 30rem) the labels show names only.
- **Motion.** The view spins slowly until the first interaction. Under
  `prefers-reduced-motion` there is no spin and the explode is instant.
- **Theme.** The canvas is transparent over a CSS background, and the lights and grid follow the
  light or dark theme.
- **Accessibility and fallbacks.** The canvas is `role="img"`, labelled "3D view: caption", and
  described by the controls hint. A collapsible **Parts** table (name, shape, size, position,
  rotation, notes, a link to the contents) is always in the page. Without JS, the stage says the
  view needs JavaScript and WebGL. Without WebGL it says so and opens the table.

Export: the caption in bold, then one line per part, like
`- **Handle**: cylinder; size 0.04, 0.04, 0.15 m; pos 0.4, 0.06, -1.16 m; rot 90, 0, 0°; contents: \`door-frame\``.

**`<Inventory>`** lists one prim's contents: `id` (letters, digits, dashes; the anchor is
`#inv-<id>`, which a Prim's `inventory` links to) and `title`, both required. Each `<Item>` has a
`type` and a `name`. The types are `script`, `notecard`, `sound`, `texture`, `animation`, `object`,
`landmark`, `clothing`, `bodypart`, `gesture`, `material` and `settings`, and each has a small
inline SVG icon. A script's name links to the `<ScriptFile>` of the same name when one is on the
page (a tiny script adds the link only then). Export: the title in bold, then `- type: name` per
item.

```mdx
<Inventory id="door-frame" title="Door frame contents">
<Item type="script" name="door.lsl" />
<Item type="notecard" name="config" />
<Item type="sound" name="creak" />
</Inventory>
```

## Diagrams

Diagram: a static SVG diagram picked by name from a registry.

```mdx
import { Diagram } from '~/components/authoring';
```

```mdx
<Diagram name="frames/root-child" />
<Diagram name="frames/tank" caption="The turret on a sloped hull." />
<Diagram name="frames/hud">Caption with **Markdown**.</Diagram>
<Diagram name="frames/hud" caption="" />
```

The caption is the diagram's own by default, or the `caption` prop, or Markdown children;
`caption=""` shows none. The SVG is drawn at build time, with no client JS. It is `role="img"`,
labelled by the diagram's title and description. Colours follow the theme through `light-dark()`,
with axes coloured as in the Second Life build tool: X red, Y green, Z blue. Below a minimum width
(34rem) the diagram keeps its size and scrolls horizontally. An unknown name fails the build.

Names: `frames/region-global`, `frames/root-child`, `frames/rotate-vector`, `frames/attachment`,
`frames/local-flag`, `frames/hud`, `frames/st-uv`, `frames/texture-transforms`, `frames/tank`,
`frames/tank-steps`.

Markdown export: `*[Diagram: title]* description`, then the caption in italics (Markdown children
as they are).

To add a diagram, add a `DiagramDef` (`width`, `height`, `title`, `desc`, optional `caption`, and
a `build(svg)` function) to a module under `src/components/authoring/diagrams/`, and register the
module's record in `registry.ts`.

## Deferred

CodeGroup (LSL ⇄ SLua tabs) and StateFlow/EventFlow diagrams are planned but not scheduled. Use
Starlight Tabs for code tabs in the meantime.
