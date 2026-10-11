/**
 * Writes src/data/hovercards.json (git-ignored), the slim per-API card data read at build time by
 * src/components/authoring/hovercards/rehype-api-hovercards.ts. It runs before `astro build` and
 * `astro dev` (see package.json). Owned by the hovercards batch agent.
 *
 * Target record shape: { [name]: { k: kind, s: signature, d: oneLine (<= 140 chars), f: flags[] } }
 *
 * Scaffold stub: writes an empty map.
 */
import { writeFileSync } from 'node:fs';

const out = new URL('../src/data/hovercards.json', import.meta.url);
writeFileSync(out, '{}\n');
