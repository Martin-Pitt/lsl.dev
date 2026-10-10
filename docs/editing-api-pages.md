# Editing API pages

Every public function, event and constant has one hand-editable MDX page:

```
src/content/docs/functions/<name>.mdx    -> /functions/<name>/
src/content/docs/events/<name>.mdx       -> /events/<name>/
src/content/docs/constants/<name>.mdx    -> /constants/<name>/
```

The pages were generated once from the local wiki export and **now belong to people**. Edit
them like any other Markdown file; nothing regenerates them behind your back.

## What lives where

| Part of the page | Comes from | Edit it in |
| --- | --- | --- |
| Breadcrumbs, category and feature chips | definitions + feature pages | `data/sources/lsl_definitions.yaml` (via sync), feature pages |
| Signature, parameters, return type, delay, energy, permission, flags | LSL definitions | the YAML (never in the MDX) |
| One-line description under the signature (only with the `description` flag, on pages without wiki prose) and the meta description | the definition's `tooltip` | the YAML |
| "Replaces deprecated …" note | `deprecated: {use: …}` in the YAML | the YAML |
| Constant groups (on constant pages) and `<ConstantGroup>` blocks | `member-of` in the YAML | the YAML |
| Everything else: prose, Specification tables, caveats, examples, notes, see also | the MDX | the `.mdx` file |
| Attribution footer | the page's `source` frontmatter | the `.mdx` frontmatter |

`bun run import:data` turns the YAML into `src/data/catalog.json`, which the components read
at build time. After a definitions sync the signatures on every page update without any MDX
change.

## Anatomy of a page

```mdx
---
title: "llDialog"
slug: "functions/llDialog"          # keeps the URL's case; do not change
category: functions
source:                              # provenance of the wiki-derived prose (CC BY-SA 3.0)
  wiki: "LlDialog"
  url: https://wiki.secondlife.com/wiki/LlDialog
  revision: 1216157                  # the article's imported revision (provenance; links stay live)
  date: 2024-01-31                   # newest date among `sources`
  contributor: "Wulfie Reanimator"
  license: "Content from the Second Life Wiki articles LlDialog (revision 1216157, 2024-01-31), Template:Issues/VWR-17064 (revision 754023, 2010-02-25), ... and Template:LSL Function/chat (revision 1192932, 2014-08-23), CC BY-SA 3.0."
  sources:                           # the article plus every page/template the importer transcluded
    - { wiki: "LlDialog", revision: 1216157, date: 2024-01-31 }
    - { wiki: "Template:Issues/VWR-17064", revision: 754023, date: 2010-02-25 }
    - { wiki: "Template:LSL Function/chat", revision: 1192932, date: 2014-08-23 }
---
import { LSLFunction, WikiSource } from '~/components/lsl';

<LSLFunction name="llDialog" />

Lead prose: plain paragraphs, no heading.

```lsl title="How to use" frame="terminal"
llDialog(NULL_KEY, "", [], 0);
```

## Specification
## Caveats
## Examples
## Notes
## See also

<WikiSource />
```

Keep the `source` block while the page still contains wiki text: it drives the CC BY-SA
attribution. If you rewrite a page completely in your own words you may remove it (and
`<WikiSource />`).

## Components

All are imported from `~/components/lsl`.

| Component | Use |
| --- | --- |
| `<LSLFunction name="…" />`, `<LSLEvent name="…" />`, `<LSLConstant name="…" />` | The data-driven page header. One per page, right after the imports. The build fails if the name is not a public API (renamed, removed or deprecated). Add `description` (`<LSLConstant name="REZ_POS" description />`) to show the definitions' one-line description when the page has no prose of its own; otherwise the prose below is the description. |
| `<ConstantGroup name="RezParam" />` | slua.dev-style at-a-glance block: one highlighted LSL line per group member. Types, values (`integer REZ_POS = 1;`) and argument shapes (`[ REZ_POS, vector position, integer relative, integer at_root ]`) are code, taken from the definitions; the comment is only the first sentence of the description, with any restated shape removed. Long groups are sub-grouped by name. Put it at the top of a Specification section for rule lists. Long rule lists get `order={…}` and `mode="get"`; see [Grouping a long rules list](#grouping-a-long-rules-list). Group names are the YAML `member-of`/`param-semantics` names; `/constants/groups/` lists them. |
| `<InlineSyntax code="REZ_POS, vector pos" />` | Highlighted inline LSL where backticks are not enough (inside HTML tables, after a link). |
| `<WikiSource />` | The "original wiki source" note and attribution footer, from the frontmatter. Last line of the page. |

Plain Markdown covers the rest:

- Parameter names of the page's own signature are **bold** (`**msg**`); constants, functions and
  code are inline code or links.
- `` `llListen` `` and other inline code are highlighted as LSL at build time, and API names
  inside link to their pages. A Markdown link to an API page whose text is the name,
  `[llListen](/functions/llListen/)`, is shown as highlighted code too.
- Examples: a fenced ` ```lsl ` block. Long scaffolding can be folded with expressive-code
  metadata, e.g. ` ```lsl collapse={1-5, 25-46} `; `title="…"` and `frame="terminal"` work as well.
  The generator wraps each wiki example in `<details>` with its introducing sentence as the
  `<summary>`; the first one is `open`.
- Caveats and notes: Markdown lists; Starlight asides (`:::note`, `:::caution`, `:::tip`).
- Tables: Markdown tables. Tables Markdown cannot express (nested tables, cells with several
  paragraphs) are HTML elements, one per line, with Markdown inside the cells. Leave a blank
  line around block content inside a `<td>`.
- MDX specials: write `\{`, `\}` and `&lt;` for literal braces and `<` in prose.

Links: point at our own pages (`/functions/…/`, `/constants/groups/…/`, `/categories/…/`,
`/features/…/`) or at the live wiki (`https://wiki.secondlife.com/wiki/…`). Never link API
pages to the `/wiki/` archive; its templates are only partly rendered (`bun run test:links`
and `bun run test:data` fail on such links).

## Grouping a long rules list

A rules list with dozens of entries (`PRIM_*`, `PSYS_*`, `OBJECT_*`) reads best like slua.dev's
math library page: one code block, sorted and grouped by everyday usage and related functionality,
each group headed by a comment. Keep it compact: the shape and a short comment usually say enough. The PRIM_* rules
on [llSetLinkPrimitiveParamsFast](/functions/llSetLinkPrimitiveParamsFast/),
[llGetLinkPrimitiveParams](/functions/llGetLinkPrimitiveParams/),
[llGetPrimitiveParams](/functions/llGetPrimitiveParams/) and `/constants/groups/PrimParam/` are the
worked example.

1. **Order data.** Add `src/data/rule-groups/<name>.ts` exporting `RuleSection[]` (types in
   `types.ts`): sections in order of usefulness, each `{ title, id, rules }`, most useful rule first.
   A rule is its name, or `{ rule, args?, note?, getNote?, forms? }`:
   - `args`: typed arguments, e.g. `"integer face, vector color, float alpha"`. Leave it out when the
     YAML `values` already define the shape (or the YAML description quotes `[RULE, type name, …]`).
     Otherwise take the names from the wiki's rules template (`data/derived/wiki-source/template-lsl-constants-*`).
     Never invent a shape; leave the line without arguments and say so in the commit.
   - `setOnly: true`: getter pages show `[ RULE ]` and the note, with no return list (`PRIM_PROJECTOR`).
   - `forms`: one line per form for a multi-form rule (`PRIM_TYPE` → `PRIM_TYPE_BOX`, …, `PRIM_TYPE_SCULPT`).
   - `note` / `getNote`: at most one short comment, and only what the code cannot say: a limit,
     a unit, a constant family (`PRIM_TEXGEN_*`), a get/set difference (`set only`). Never restate a
     parameter name or type.
   - `id` must equal Starlight's slug of the section heading (`Position and orientation` →
     `position-and-orientation`).

   The build fails if a public member of the group is missing, listed twice, or not in the group, so
   new rules in the YAML cannot be silently dropped.
2. **Block.** In the Specification section:

   ```mdx
   import { primParams } from '~/data/rule-groups/prim-params';

   ## Specification

   {/* Sorted/grouped based on everyday usage and related functionality. */}
   <ConstantGroup name="PrimParam" order={primParams} />
   ```

   Getter pages add `mode="get"`. Notation: `[ RULE, request arguments ] → [ returned values ]`; the
   request arguments are `face` (YAML `access: arg`) and `link_target`, everything else is returned.
   A rule with no request arguments reads `PRIM_NAME → string name`. Lines carry no list brackets.
3. **Sections, only when needed.** Most groups need nothing below the block: put what matters in the
   shape and a short comment. Only a group the block can't explain (e.g. Shape, with its `PRIM_TYPE`
   forms) gets `details: true` and a `### <title>` section with the exact wiki wording; its header
   then links there. Don't add a detail table per group.
4. **Group page.** Register the order in `src/data/rule-groups/index.ts` so `/constants/groups/<name>/`
   uses the same block and splits its constants table under the same `###` ids.
5. **Check.** `bun run test:links` fails if a header link has no matching section.

Converted so far: `PrimParam`, `ParticleParam`, `GLTFOverride`, `PrimMediaParam`, `ObjectDetailsParam`,
`ParcelDetailsParam`, `CameraParam`, `RezParam`, `CharacterParam`, `HTTPRequestParam`, `GroundTextureParam`,
`EnvironmentParam` / `EnvironmentParamReadOnly` and `ParcelMediaCommand` / `ParcelMediaQuery`. Getter groups
(listed in `getterGroups` in `index.ts`) use getter notation on their group page too. Where the wiki gives a type
but no name, the line carries the type only (`PARCEL_DETAILS_AREA → integer`). `bun run test:data`
(`scripts/lib/test_rule_groups.py`) checks every order.

## Adding a page

New APIs arrive with a definitions sync. Run

```sh
bun run import:data        # if the YAML or wiki export changed
bun run generate:mdx       # creates the pages that are missing, nothing else
```

and edit the new file. To start a page by hand instead, copy a similar page and change the
frontmatter, the component name and the prose. A page whose name is not a public API makes
the build fail; deprecated and private entries stay out of the reference.

## The generator: what it does and does not overwrite

`bun run generate:mdx` (`python scripts/generate-mdx.py`):

- **Creates** a page for every public API that has none, converted from the local wiki export
  (`data/derived/api-wiki.json`, written by the importer).
- **Never overwrites** an existing page. The only exception is a page named with
  `--force NAME` (repeatable), which is regenerated from scratch, losing its edits.
- **Never deletes** a page. Pages for APIs that were removed or deprecated are reported as
  orphaned; move or delete them yourself.
- **Reports drift** and writes it to `data/reports/mdx-drift.json`:
  - `missing`: public APIs without a page (only with `--check`; otherwise they are created)
  - `orphaned`: pages with no public API
  - `drift`: pages whose API changed signature or parameter names, or whose wiki revision
    changed, since the page was generated. The signature block is already current; check that
    the prose still matches, then run `bun run generate:mdx -- --accept NAME` (or `--accept all`).
- `--check` creates nothing and exits with 1 if anything is missing or orphaned (CI runs this).

`src/data/mdx-pages.json` records the signature and wiki revision each page was generated
from or last accepted against. It is maintained by the generator; do not edit it by hand.

## Deprecated names

Deprecated entries whose YAML `deprecated.use` names a replacement in the same context get a
"Replaces deprecated …" line on the modern page, so searching the old name finds it. They get
no page or redirect of their own.

Constants qualify only when the old and new constant share a `member-of` group, belong to
groups taken by the same function argument, or are ungrouped siblings of one name family.
Private entries never do. `data/reports/import-report.json` lists the skipped mappings
(`deprecatedAliasesSkipped`) with the reason for each.
