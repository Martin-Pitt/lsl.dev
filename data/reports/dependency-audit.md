# Dependency audit (npm)

Run on 2026-10-10 with Node v26.7.0, after the Astro 7 / Starlight 0.42 upgrade.
Raw output: `npm-audit.json` (current) and `npm-audit-pre-astro7.json` (before the
upgrade, kept for comparison).

## Result

`npm audit`: **11 moderate, 0 low, 0 high, 0 critical**.

All 11 entries come from one advisory:

- **GHSA-rj75-hqrm-r3gf**: `postcss-selector-parser` < 7.1.6, quadratic complexity
  when parsing flat selectors (CPU exhaustion).

The other 10 entries are packages that npm flags because they depend on it.

## Dependency chain

```
@astrojs/starlight@0.42.6
└─ astro-expressive-code@0.44.2
   └─ rehype-expressive-code@0.44.2
      └─ expressive-code@0.44.2
         ├─ @expressive-code/core@0.44.2 ─ postcss-nested@6.2.0 ─ postcss-selector-parser@6.1.4
         ├─ @expressive-code/plugin-frames / plugin-shiki / plugin-text-markers (→ core)
@expressive-code/plugin-collapsible-sections@0.44.2 (direct) → core@0.44.2
```

## Disposition

- **Fixed (safe):** `@expressive-code/plugin-collapsible-sections` went from `^0.41.3` to
  `^0.44.2`. It had been installing a second, outdated `@expressive-code/core@0.41.7`. It
  now dedupes onto the 0.44.2 core that Starlight uses. Same plugin API, same package
  family. The advisory count stays the same because the shared root is still there.
- **Not fixed (no compatible fix upstream):** `@expressive-code/core@0.44.2` (latest)
  requires `postcss-nested ^6.0.1`, and postcss-nested 6.x requires
  `postcss-selector-parser ^6`. Only postcss-nested 7+/8 moves to selector-parser 7.
  - `npm audit fix --force` suggests installing `@astrojs/starlight@0.21.5`, a large
    downgrade that is incompatible with Astro 7. Rejected.
  - An `overrides` entry that forces `postcss-selector-parser@^7` (or `postcss-nested@^7`)
    under expressive-code would be a major-version change that the package does not
    declare support for. Rejected as unsafe without upstream testing.
- **Exposure:** build-time only. postcss-selector-parser runs while expressive-code builds
  CSS for its theme at `astro build`/`astro dev` time, on CSS the project controls. It
  does not run on visitor input, and the deployed site is static. Risk: low.
- **Follow-up:** re-run `npm audit` when expressive-code releases a version on
  postcss-nested 7+ (and Starlight picks it up), then update normally.
