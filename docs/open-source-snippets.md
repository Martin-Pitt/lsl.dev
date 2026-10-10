# Open-source code in guides

Some guides are built around ready-made functions from open-source LSL libraries, such as
[NexiiLSL](https://github.com/Martin-Pitt/NexiiLSL). This page is the policy for bringing such code
onto the site.

Where it goes:

- **Guides** (`src/content/docs/guides/`) are long-form articles and tutorials. Open-source code
  goes here, as a guide built around a small set of related functions (e.g. `guides/link-numbers.mdx`).
- **Recipes** (`src/content/docs/recipes/`) are short step-by-step how-tos for one task ("make a
  door"). Don't turn a library file into a recipe.
- There is no separate script library section.

## What we accept

- Generally useful code that many scripters would otherwise write themselves, such as finding links
  by name or converting pixel coordinates to texture offsets. Leave out project-specific helpers,
  hard-coded asset keys and one-off constants.
- Correct code. Read every line, check it against the API pages, and work through the maths. Fix
  bugs instead of copying them, and list each fix (see below). If a function can't be made correct
  with a small change, leave it out.
- Code under a licence that allows modification and reuse with attribution (MIT, BSD, CC BY,
  public domain or similar).
- Be picky. Three solid functions beat ten doubtful ones.

## No preprocessor

lsl.dev is for everyone, including people without Firestorm's preprocessor. Code must compile as
plain LSL:

- Every `#define` macro becomes a normal function or a formula written out where it is used. A
  macro that expanded to several comma-separated values becomes a function returning a `list`
  (e.g. `[repeats, offsets]`) that can be added into a parameter list.
- Macro loop boilerplate (a macro that wraps your code in a loop) becomes a plain example loop the
  reader copies and edits.
- No `#include`, `#ifdef`, `switch` or other preprocessor extensions.

## Writing the guide

- Explanatory prose may only restate what the code and its comments establish, plus facts from the
  catalog (our API pages) or the local wiki import. Don't add tutorial narrative the sources don't
  support; keep it tight.
- Structure: one paragraph on the purpose, then the code in fenced ` ```lsl ` blocks (long helper
  sections may be folded with expressive-code's `collapse={…}`), then usage, then notes and limits
  (return values when nothing is found, edge cases, permissions).
- Identifiers in code (`` `LinkByName` ``), parameter names in bold (**needle**), and the first
  mention of each LSL function, event or constant linked to its API page. Every API name must exist
  in the catalog.

## Attribution

End each guide with a "Source and licence" section:

```md
From [`file.lsl`](https://github.com/<owner>/<repo>/blob/<commit>/file.lsl) in
[Repo](https://github.com/<owner>/<repo>) by Author Name, © Year, under the
[MIT licence](https://github.com/<owner>/<repo>/blob/<commit>/LICENSE), at commit `<commit>`.

Changes from the original:

- ...
```

Link the specific file at a fixed commit, never a branch, so the link keeps pointing at the code
that was reviewed.

## Changes and bug fixes

Under "Changes from the original", list every change beyond formatting:

- each macro converted, and what it became;
- each bug fixed, in bold, with what was wrong and why (e.g. "`SPRITESHEET2` used `digit` instead
  of `icon`");
- anything added (a helper the original used but did not define) or left out.

## Linking

Add the guide to the list in `guides/index.mdx`, and link it from each relevant feature page with
a `<SeeAlso>` item such as `"/guides/link-numbers/|Guide: working with link numbers"`, replacing
any matching `<Planned>` entry. Then run `bun run test:data`, `check`, `build`, `test:links` and
`test:sidebar`.
