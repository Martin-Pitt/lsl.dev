import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

/** YAML reads `2024-01-31` as a Date; keep it as the plain YYYY-MM-DD string it was written as. */
const day = z.union([z.date(), z.string()]).transform((d) => (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10));
/** One wiki page or template the prose was built from, at the revision that was imported. */
const wikiPage = z.object({ wiki: z.string(), revision: z.coerce.string(), date: day });

/**
 * Provenance of an API page's wiki-derived prose (written by scripts/generate-mdx.py).
 * `url` is the live article (never an old revision); `revision` is that article's imported revision;
 * `date` is the newest date among `sources`, which lists the article and every page or template
 * it transcludes. `redirectFrom` is a wrapper page that only redirects to or transcludes `wiki`.
 */
const source = z.object({
	wiki: z.string(),
	url: z.string().startsWith('https://wiki.secondlife.com/'),
	revision: z.coerce.string(),
	date: day,
	contributor: z.string().optional(),
	license: z.string(),
	sources: z.array(wikiPage).min(1).optional(),
	redirectFrom: wikiPage.optional(),
});

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({ extend: z.object({
			category: z.string().optional(),
			source: source.optional(),
			/** `false` turns off API hover cards on the page (docs/components.md). */
			hoverCards: z.boolean().optional(),
		}) }),
	}),
};
