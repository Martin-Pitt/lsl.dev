// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync } from 'node:fs';

/**
 * Navigation mirrors slua.dev: Fundamentals, Reference, Features, Guides, plus the wiki archive.
 * The Reference sidebar goes down to categories, grouped by feature, but never lists
 * individual functions or constants; those are reached from category pages, the filtered
 * catalogs and search.
 */
/** @type {any} */
const features = JSON.parse(readFileSync('./src/data/feature-clusters.json', 'utf-8'));
/** @type {any} */
const catalog = JSON.parse(readFileSync('./src/data/catalog.json', 'utf-8'));
const categoryLabel = new Map(catalog.categories.map((/** @type {any} */ c) => [c.id, c.label]));

const referenceCategories = features.features
	.filter((/** @type {any} */ f) => f.categories.length > 0)
	.map((/** @type {any} */ f) => ({
		label: f.title,
		collapsed: true,
		items: f.categories.map((/** @type {string} */ id) => ({ label: categoryLabel.get(id) ?? id, link: `/categories/${id}/` })),
	}));
/** Flat, in slua.dev order: Features Overview, then one entry per feature page. */
const featureItems = features.features.map((/** @type {any} */ f) => ({ label: f.title, link: `/features/${f.id}/` }));
/** Retired feature-cluster slugs keep working. */
const redirects = Object.fromEntries(Object.entries(features.redirects).map(([from, to]) => [`/features/${from}/`, `/features/${to}/`]));

export default defineConfig({
	site: 'https://lsl.dev',
	redirects,
	integrations: [starlight({
		title: 'LSL Dev',
		favicon: '/favicon.svg',
		description: 'Unofficial developer documentation for the Linden Scripting Language (LSL) of Second Life.',
		defaultLocale: 'root',
		locales: { root: { label: 'English', lang: 'en' } },
		social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Martin-Pitt/lsl.dev' }],
		tableOfContents: false,
		pagination: false,
		customCss: ['./src/styles/slua-base.css', './src/styles/custom.css'],
		components: {
			Header: './src/components/starlight/Header.astro',
			PageFrame: './src/components/starlight/PageFrame.astro',
			Hero: './src/components/starlight/Hero.astro',
			Footer: './src/components/starlight/Footer.astro',
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
