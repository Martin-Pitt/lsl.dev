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

Not built yet.

## API hover cards

Automatic on links to API pages. Opt out with `<NoCard>` or frontmatter `hoverCards: false`.
Showcase: `/meta/components/#showcase-hovercards`.

Not built yet.

## Guide kit

Param, Params, Returns. Showcase: `/meta/components/#showcase-guide`.

Not built yet.

## Deferred

CodeGroup (LSL ⇄ SLua tabs) and StateFlow/EventFlow diagrams are planned but not scheduled. Use
Starlight Tabs for code tabs in the meantime.
