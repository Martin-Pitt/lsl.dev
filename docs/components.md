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
import { Caveat, Gotcha, Performance, Limit, LimitsTable, Details, FAQ, Since } from '~/components/authoring';
```

**Asides.** All asides share one look: a left rule and a tint in a semantic colour. Starlight's
own (`:::note`, `:::tip`, `:::caution`, `:::danger`, `<Aside>`) are restyled to match. Note,
Caveat and Limit are neutral gray-blue, tip and Performance green, caution and Gotcha orange,
danger red. Accent blue is kept for links. Each takes an optional `title`.

```mdx
<Caveat>Figures come from the wiki and may be out of date.</Caveat>
<Gotcha>`llSetTimerEvent(0)` stops the timer, but a pending event may still fire once.</Gotcha>
<Performance>Avoid `llSleep` in busy event handlers.</Performance>
```

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

RecipeMeta, Prerequisites, ScriptFile, Requires, Linkset, Steps and BuildStep. Showcase:
`/meta/components/#showcase-recipe`.

```mdx
import { RecipeMeta, Prerequisites, Requires, Linkset, Steps, BuildStep, ScriptFile } from '~/components/authoring';
```

**`<RecipeMeta>`**: the summary strip at the top of a recipe: `scripts` (default 1) and an optional
free-text `time`. Prims are shown by `<Linkset>` and permissions by `<Requires>`, so they aren't repeated here.

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

**`<Linkset>`**: a linked object as a plain nested Markdown list. The first item is the root,
marked "root"; nested items are child prims (`title` adds a caption). Child link numbers aren't
shown: they depend on link order (the root is just the last prim selected when linking), so
refer to prims by name instead. Put inventory as text on the
prim's line; a script name in inline code with an `.lsl`, `.slua` or `.luau` extension links to the
`<ScriptFile>` of that name, so only use the extension for scripts shown on the page.

```mdx
<Linkset title="Door">
- **Door frame**: `door.lsl`, notecard `config`
  - **Door panel**
    - **Handle**: sound `creak`
</Linkset>
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

Param, Params, Returns. Showcase: `/meta/components/#showcase-guide`.

Document the parameters and return value of a function a guide defines (not an API function:
those have their own pages). The type is highlighted as LSL and links to its `/types/` page when
there is one.

```mdx
import { Param, Params, Returns } from '~/components/authoring';

<Params title="Parameters">
<Param name="t" type="float" required>Position along the segment, from `0.0` to `1.0`.</Param>
<Param name="tens" type="float" default="0.0">Tension. `1.0` gives sharp corners.</Param>
<Param name="old" type="integer" deprecated>Use `tens` instead.</Param>
<Returns type="float">The interpolated value.</Returns>
</Params>
```

| Component | Props |
|---|---|
| `<Param>` | `name` (required), `type` (required), `required`, `default="…"`, `deprecated` |
| `<Returns>` | `type` (required) |
| `<Params>` | `title?`; optional bordered group around consecutive Param/Returns |

- Keep each description on the same line as its tag; the Markdown export puts it straight after
  the list bullet: ``- `t` (float, required): Position…`` and ``**Returns** (float): …``.
- Inline Markdown (code, links) works in the description. For nested fields, put a
  `<Details>` inside the description.
- Without `<Params>`, a run of entries still gets dividing rules.

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
children) opens in a popover anchored to the marker. Click, Enter or Space opens it, and a click
outside or Escape closes it. CSS anchor positioning flips the popover to stay on screen. Each
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
name for the group.

```mdx
<Gallery label="Texture swatches">
<Figure src="~/assets/sky.png" alt="Blue gradient swatch" caption="Sky" zoom />
<Figure src="~/assets/grass.png" alt="Green gradient swatch" caption="Grass" zoom />
</Gallery>
```

Export: each figure's image and caption, one after another.

## Deferred

CodeGroup (LSL ⇄ SLua tabs) and StateFlow/EventFlow diagrams are planned but not scheduled. Use
Starlight Tabs for code tabs in the meantime.
