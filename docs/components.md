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

Caveat, Gotcha, Performance, Limit, LimitsTable, Details, FAQ, Figure, Since. Showcase:
`/meta/components/#showcase-asides`.

```mdx
import { Caveat, Gotcha, Performance, Limit, LimitsTable, Details, FAQ, Figure, Since } from '~/components/authoring';
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

Export: `> **Gotcha:** body`. Only the first paragraph is quoted, so keep asides short.

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
`**Summary**` followed by the body, and the FAQ title as `### Title`.

**Figure.** A local image in a frame, with a caption given as a prop or as Markdown children.
`alt` is required (use `alt=""` only for decorative images). A string `src` is a path under `src/`
(`~/assets/…`); `src={importedImage}` also works. A remote or missing image fails the build.

```mdx
<Figure src="~/assets/door-linkset.png" alt="Door linkset in edit mode" caption="The root prim is highlighted yellow." />
<Figure src="~/assets/door-linkset.png" alt="…" hint="Edit mode" width={320}>Caption with **Markdown**.</Figure>
```

Export: `*[Figure: alt]*` followed by the caption.

**Since.** A small outline badge reading "Since Nov 2022". `date` is `YYYY-MM` or `YYYY-MM-DD`.
An optional `note` opens as a hint popover on hover, focus or click.

```mdx
## llLinksetDataWrite <Since date="2022-11" />
<Since date="2022-11-04" note="Server 2022-11-04" />
```

Export: `(since 2022-11)`.

## Recipe kit

RecipeMeta, ScriptFile, Requires, Linkset, Steps and BuildStep. Showcase:
`/meta/components/#showcase-recipe`.

```mdx
import { RecipeMeta, Requires, Linkset, Steps, BuildStep, ScriptFile } from '~/components/authoring';
```

**`<RecipeMeta>`**: the summary strip at the top of a recipe. `difficulty` is `beginner`,
`intermediate` or `advanced` (required); `prims` and `scripts` default to 1; `permissions` are
`PERMISSION_*` constants and link to their pages; `time` is optional free text.

```mdx
<RecipeMeta difficulty="beginner" prims={3} scripts={1} permissions={["PERMISSION_TAKE_CONTROLS"]} time="15 min" />
```

**`<Requires>`**: static badges for what a script needs. Closed vocabulary: `permissions`
(`PERMISSION_*` constants), `experience`, `land` (`build`, `scripts`, `owner` or `group`),
`attachment`, `seated`, `owner` (owner only). Any other prop or value fails the build. Permissions
that always ask the owner, such as `PERMISSION_DEBIT`, get the caution colour.

```mdx
<Requires permissions={["PERMISSION_ATTACH"]} experience land="build" attachment />
```

**`<Linkset>`**: a linked object as a plain nested Markdown list. The first item is the root
(link 1); nested items are child prims, numbered depth-first (`numbers={false}` hides the
numbers; `title` adds a caption). Don't write link numbers yourself. Put inventory as text on the
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
- `hovercards/rehype-api-hovercards.ts` runs after `rehype-inline-lsl`. For each API link it
  inserts one `<span popover="hint" class="au-popover hc">` right after the link (after the
  inline `<code>` when the link is inside one) and gives the link `interestfor` plus an inline
  `anchor-name`. The card is `aria-hidden`, `data-pagefind-ignore` and holds no links.
- CSS anchor positioning places the card below the link, flipping when there's no room. It
  lives in the top layer, so tables and scroll containers never clip it.
- Browsers with `interestfor` open it on hover and focus natively. Elsewhere a small inline
  script (`hovercards/PageEnd.astro`, under 1 KB) does the same with a 300 ms hover delay; Esc
  closes. Touch never opens a card.
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

## Deferred

CodeGroup (LSL ⇄ SLua tabs) and StateFlow/EventFlow diagrams are planned but not scheduled. Use
Starlight Tabs for code tabs in the meantime.
