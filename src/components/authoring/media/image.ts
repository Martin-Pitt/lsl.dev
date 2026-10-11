/**
 * Shared image rules of the media batch: a string src is a local path under src/ (`~/…` or
 * `/src/…`), an imported image also works, and a remote or unknown src fails the build. The .md
 * route (src/pages/[...page]/index.md.ts) uses the same glob and rules.
 */
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>('/src/**/*.{png,jpg,jpeg,webp,avif,gif,svg}');

export async function resolveImage(src: ImageMetadata | string | undefined, who: string): Promise<ImageMetadata> {
	if (!src) throw new Error(`<${who}>: an image src is required`);
	if (typeof src !== 'string') return src;
	if (/^([a-z]+:)?\/\//i.test(src)) throw new Error(`<${who}>: remote images are not allowed (${src}); add the image to the repository`);
	const load = images[src.replace(/^~\//, '/src/')];
	if (!load) throw new Error(`<${who}>: no image at ${src} (a string src is a path under src/, like ~/assets/x.png)`);
	return (await load()).default;
}

export function requireAlt(alt: unknown, who: string, prop = 'alt'): string {
	if (typeof alt !== 'string') throw new Error(`<${who}>: the ${prop} prop is required (${prop}="" only for a decorative image)`);
	return alt;
}

/** Ids unique within a page (a module counter; pages are rendered one at a time). */
let n = 0;
export const nextId = (prefix: string) => `${prefix}-${(++n).toString(36)}`;
