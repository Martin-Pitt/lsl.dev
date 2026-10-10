// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync } from 'node:fs';
import rehypeInlineLsl from './src/lib/rehype-inline-lsl.ts';
import { loadFeatures, featureRedirects } from './scripts/feature-index.mjs';

/**
 * Navigation mirrors slua.dev: Fundamentals, Reference, Features, Guides, plus the wiki archive.
 * The Reference sidebar goes down to categories, grouped by feature, but never lists
 * individual functions or constants; those are reached from category pages, the filtered
 * catalogs and search.
 */
/** Feature pages are src/content/docs/features/*.mdx; categories come from each page's <FeatureFooter>. */
const features = loadFeatures();
/** @type {any} */
const catalog = JSON.parse(readFileSync('./src/data/catalog.json', 'utf-8'));
const categoryLabel = new Map(catalog.categories.map((/** @type {any} */ c) => [c.id, c.label]));

const referenceCategories = features
	.filter(f => f.categories.length > 0)
	.map(f => ({
		label: f.title,
		collapsed: true,
		items: f.categories.map(id => ({ label: categoryLabel.get(id) ?? id, link: `/categories/${id}/` })),
	}));
/** Flat, in slua.dev order: Features Overview, then one entry per feature page. */
const featureItems = features.map(f => f.subpages.length === 0
	? { label: f.title, link: `/features/${f.id}/` }
	: {
		/** A feature with sub-pages (features/<id>/<topic>.mdx) becomes a collapsed group. */
		label: f.title,
		collapsed: true,
		items: [{ label: 'Overview', link: `/features/${f.id}/` }, ...f.subpages.map(s => ({ label: s.title, link: s.href }))],
	});
/** Retired feature-cluster slugs keep working (`redirectFrom` in each page's frontmatter). */
const redirects = Object.fromEntries(Object.entries(featureRedirects(features)).map(([from, to]) => [`/features/${from}/`, `/features/${to}/`]));

export default defineConfig({
	site: 'https://lsl.dev',
	redirects,
	// Inline `code` and links to API pages in Markdown/MDX are highlighted as LSL (see the plugin).
	markdown: { rehypePlugins: [rehypeInlineLsl] },
	integrations: [starlight({
		title: 'LSL Dev',
		favicon: '/favicon.svg',
		description: 'Unofficial developer documentation for the Linden Scripting Language (LSL) of Second Life.',
		defaultLocale: 'root',
		locales: { root: { label: 'English', lang: 'en' } },
		social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Martin-Pitt/lsl.dev' }],
		tableOfContents: false,
		pagination: false,
		// Breadcrumbs and meta description of the MDX API pages.
		routeMiddleware: ['./src/route-middleware.ts', './src/routeData.ts'],
		customCss: ['./src/styles/slua-base.css', './src/styles/custom.css'],
		components: {
			Header: './src/components/starlight/Header.astro',
			PageFrame: './src/components/starlight/PageFrame.astro',
			Hero: './src/components/starlight/Hero.astro',
			Footer: './src/components/starlight/Footer.astro',
			PageTitle: './src/components/starlight/PageTitle.astro',
		},
		sidebar: [
			{
				label: 'Fundamentals',
				collapsed: true,
				items: [
					{ label: 'Learn LSL', link: '/guides/' },
					{ label: 'Language types', link: '/types/' },
					{ label: 'Flow control', link: '/controls/' },
				],
			},
			{
				label: 'Reference',
				collapsed: true,
				items: [
					{ label: 'Overview', link: '/reference/' },
					{ label: 'Categories', collapsed: true, items: [{ label: 'All categories', link: '/categories/' }, ...referenceCategories] },
					{ label: 'Functions', link: '/functions/' },
					{ label: 'Events', link: '/events/' },
					{
						label: 'Constants',
						collapsed: true,
						items: [
							{ label: 'All constants', link: '/constants/' },
							{ label: 'Constant groups', link: '/constants/groups/' },
						],
					},
					{ label: 'Types', collapsed: true, items: [{ autogenerate: { directory: 'types' } }] },
					{ label: 'Flow control', collapsed: true, items: [{ autogenerate: { directory: 'controls' } }] },
				],
			},
			{ label: 'Features', collapsed: true, items: [{ label: 'Features Overview', link: '/features/' }, ...featureItems] },
			{ label: 'Wiki archive', collapsed: true, items: [{ label: 'Archive index', link: '/wiki/' }] },
			{ label: 'About these docs', link: '/about/' },
		],
	})],
});
