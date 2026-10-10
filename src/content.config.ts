import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

/** Provenance of an API page's wiki-derived prose (written by scripts/generate-mdx.py). */
const source = z.object({
	wiki: z.string(),
	url: z.string().startsWith('https://wiki.secondlife.com/'),
	revision: z.coerce.string(),
	date: z.coerce.string(),
	contributor: z.string().optional(),
	raw: z.string().optional(),
	license: z.string(),
});

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({ extend: z.object({ category: z.string().optional(), source: source.optional() }) }),
	}),
};
