import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';


const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() });
const functions = defineCollection({
	loader: glob({ pattern: '*.{md,mdx}', base: './src/content/docs/functions'}),
	schema: z.object({
		title: z.string(),
	})
});

export const collections = { docs, functions };

/*

Notes
-----

Language Reference
- Types
- Variables
- Flow Control
- Operators
- States
- Events
- Constants
- Functions


Implementation Lifecycle for a function/event/constant:
* Proposed
* Experimental
* Production
	* Recently Added
	* Recently Updated
* Deprecated
* Removed
* Broken


Editorial Lifecycle
* Undocumented
* Draft
* Published


i18n Lifecycle
- Not translated
- Partially translated
- Translation up to date
- Content changed since translation


Script to backfill undocumented pages from keywords.xml?
Collections in general for all functions/events/constants
Collections by feature category, e.g. communications, attachments, etc.
Cross-sectional feature categories?
Taxonomies

Technical documentation that emphasises muscle memory - muscle memory is not literal per se,
it can be knowing *where* to find something. Minimising the hunt and peck of looking through a big list.

Two modes of navigation:
- Search
- Exploration

Probably need to look into MCP integration (Model Context Process)

Opensource / Community resources?
- Should all of these be on external doc sites?
Probably, depends on the scale of the contribution.
E.g. the geometric library and nexiilsl code stuff, makes sense to have external, because Astro is ez
For smaller contributions something like a single repo with a readme.md and file is fine
What could be instead be done on the wiki is maybe something like a curated list?
Or maybe a good search/navigable interface?

*/