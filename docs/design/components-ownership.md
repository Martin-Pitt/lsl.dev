# Authoring components: file ownership

Who may edit what while the batches of [components-plan.md](components-plan.md) are built in
parallel. Phase 0 (the scaffold) registered every shared hook, so a batch agent never needs to
edit a shared file. If one really does, it stops and asks the integrator, and says exactly which
change it needs.

`<batch>` is one of `asides`, `recipe`, `hovercards`, `guide`, `media`.

## Every batch owns

| File | Purpose |
|---|---|
| `src/components/authoring/<batch>/**` | the batch's components and helpers |
| `src/components/authoring/<batch>/index.ts` | the batch's exports (the barrel re-exports it) |
| `src/components/authoring/<batch>/<batch>.css` | the batch's styles (loaded site-wide via `authoring.css`) |
| `src/components/authoring/<batch>/PageEnd.astro` | an optional tiny per-page inline script |
| `src/components/authoring/<batch>/Showcase.mdx` | the batch's section of the hidden showcase page |
| `src/lib/page-markdown/<batch>.ts` | the Markdown-export cases for the batch's components |
| the batch's section of `docs/components.md` | the author reference (only between its own heading and the next one) |

## Batch-specific files

| Batch | Components (phase) | Also owns |
|---|---|---|
| asides | Caveat, Gotcha, Performance, Limit, LimitsTable, Details, FAQ, Since (phase 1) | `src/data/limits.yaml`; the table conversion in `src/content/docs/reference/limits.mdx` (tables only: its prose, asides and attribution stay as they are); the global restyle of Starlight's built-in asides, written in `asides/asides.css` |
| recipe | RecipeMeta, ScriptFile, Requires as static badges (phase 1); Linkset as a styled nested list, Steps/BuildStep (phase 3) | the `Steps` passthrough entry already in `src/lib/page-markdown/recipe.ts` |
| hovercards | NoCard, the cards themselves (phase 2) | `src/components/authoring/hovercards/rehype-api-hovercards.ts` (already registered in `astro.config.mjs`); `scripts/build-hovercards.ts` (already run by `bun run dev` and `bun run build`); the generated `src/data/hovercards.json` (git-ignored) |
| guide | Param, Params, Returns (phase 1) | nothing else |
| media | Figure (moved from asides, with `zoom`), Compare, Hotspots/Hotspot, Gallery | the placeholder images in `media/demo/`; the shared image rules in `media/image.ts`. The image scan in `src/pages/[...page]/index.md.ts` (which tags and props get a built URL) stays integrator-owned: ask there when a new media component takes an image prop |

Deferred and not assigned: CodeGroup (LSL ⇄ SLua), StateFlow and EventFlow.

## Integrator only

| File | What it holds |
|---|---|
| `src/components/authoring/index.ts` | the barrel (re-exports each `<batch>/index.ts`) |
| `src/components/authoring/authoring.css` | the CSS entry (imports `shared/*` and each `<batch>.css`) |
| `src/components/authoring/PageEnd.astro` | mounts each `<batch>/PageEnd.astro` |
| `src/components/authoring/shared/**` | `tokens.css`, `popover.css`, `icons.ts` (a batch keeps its own icons until two batches need one) |
| `src/lib/page-markdown.ts` | the scanner and the authoring-component guard |
| `src/lib/page-markdown/index.ts`, `types.ts`, `util.ts`, `core.ts` | the case registry, shared types and helpers, existing components |
| `src/content/docs/meta/components.mdx` | the showcase page shell |
| `astro.config.mjs`, `ec.config.mjs`, `src/content.config.ts` | site config, the rehype slot, the sitemap filter, the `hoverCards` frontmatter |
| `src/components/starlight/**` | Starlight overrides (the Footer mounts `PageEnd.astro`) |
| `src/styles/custom.css`, `src/styles/slua-base.css` | site styles |
| `package.json`, `bun.lock`, `.gitignore` | dependencies and scripts (ask for a dependency; don't add it) |
| `docs/design/components-plan.md`, this file, the shell of `docs/components.md` | the plan and the maps |

Any other repo file (other content pages, `scripts/`, `src/lib/`, other components) is outside
the batches. Leave it alone.

## Rules for batch agents

- Commit only your own files, path-limited (`git commit -- <paths>`), on `main`. Don't push.
- Use bun. No network except localhost and, if truly needed, the npm registry (ask the
  integrator to add the dependency).
- Leave any dev server on port 4321 alone. Build into a temporary outDir outside the repo
  (`bun run build -- --outDir <dir>`) and delete it afterwards.
- Run builds one at a time. Two `astro build` runs in the same checkout share Astro's build
  scratch space even with different `--outDir`s: the `.prerender/` staging directory (under
  `build.server`, which defaults into `.astro/`) and `cacheDir` (content data store and image cache,
  by default `node_modules/.astro/`). They break each other's output. For a concurrent build, give
  it its own outDir, cacheDir **and** `build.server` through a throwaway config in the git-ignored
  `node_modules/` (`--config` resolves from the repo root), with the temp folder on the **same
  drive** as the repo (Astro renames `.prerender` into the outDir, which fails across drives):

  ```js
  // node_modules/.my-build.config.mjs, run: bun scripts/build-hovercards.ts && bunx astro build --config node_modules/.my-build.config.mjs
  import base from '../astro.config.mjs';
  const tmp = 'D:/tmp/my-build'; // outside the repo, same drive
  export default { ...base, cacheDir: `${tmp}/cache`, outDir: `${tmp}/out`, build: { ...base.build, server: `${tmp}/server` } };
  ```

  Delete the config and the temp folder afterwards. Separate git worktrees also work. The normal
  `bun run build` stays as it is.
- Check your work before handing it back: `bun run check`, the build, `bun run test:links <dir>`
  and `bun run test:sidebar <dir>`, plus your showcase section by eye. Don't commit test suites
  (decision 6). The build fails if one of your components has no case in
  `src/lib/page-markdown/<batch>.ts`.
- Use the `--au-*` tokens from `shared/tokens.css`. Keep your CSS in `@layer authoring`, and guard
  motion with `prefers-reduced-motion`.
- Component names are unique across batches. A tag claimed by two case files fails the build.
