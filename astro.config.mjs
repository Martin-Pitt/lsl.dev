// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import { readFileSync } from 'node:fs';
import rehypeInlineLsl from './src/lib/rehype-inline-lsl.ts';
import { loadFeatures } from './scripts/feature-index.mjs';
import { singleMemberCategories } from './src/lib/category-members.mjs';

/** The sidebar is built from the feature pages when this config loads. In dev, reload it when a
 * feature page is added or removed, or when an edit changes what the sidebar shows (titles,
 * sub-pages, categories), so new features appear without restarting the dev server by hand. */
/** @returns {import('astro').AstroIntegration} */
function reloadSidebarOnFeatureChanges() {
	const dir = 'src/content/docs/features';
	const snapshot = () => JSON.stringify(loadFeatures().map(f => [f.id, f.title, f.categories, f.subpages.map(s => [s.title, s.href])]));
	return {
		name: 'reload-sidebar-on-feature-changes',
		hooks: {
			'astro:server:setup': ({ server, logger }) => {
				let last = snapshot();
				const isFeature = (/** @type {string} */ file) => file.replaceAll('\\', '/').includes(dir) && file.endsWith('.mdx');
				const check = (/** @type {string} */ file, /** @type {boolean} */ always) => {
					if (!isFeature(file)) return;
					const next = snapshot();
					if (!always && next === last) return;
					last = next;
					logger.info('Feature pages changed; reloading the sidebar.');
					server.restart();
				};
				server.watcher.on('add', (/** @type {string} */ f) => check(f, true));
				server.watcher.on('unlink', (/** @type {string} */ f) => check(f, true));
				server.watcher.on('change', (/** @type {string} */ f) => check(f, false));
			},
		},
	};
}

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
/** A category with one public member stands in for it: it gets no page, and the sidebar links the
 * member instead (the one allowed sidebar link to an individual API). */
const singleMember = singleMemberCategories(catalog);

const categoryItem = (/** @type {string} */ id) => {
	const one = singleMember.get(id);
	return one ? { label: `${one.label} → ${one.name}`, link: one.href } : { label: categoryLabel.get(id) ?? id, link: `/categories/${id}/` };
};
/** A feature's own category: the one named like the group (Effects › Effects, Math › Math) or its
 * "<Singular> Target" category (Avatars › Avatar Target, Linksets › Linkset Target, Prims › Prim Target). */
const ownCategory = (/** @type {any} */ f) => {
	const singular = f.title.replace(/s$/, '');
	return f.categories.find((/** @type {string} */ id) => [f.title, `${singular} Target`].includes(categoryLabel.get(id)));
};
/** A group of a feature's categories. With an own category, it is a split control: the label opens
 * that category and the chevron lists the others; otherwise a plain collapsible. */
const categoryGroup = (/** @type {any} */ f) => {
	const own = ownCategory(f);
	const rest = f.categories.filter((/** @type {string} */ id) => id !== own).map(categoryItem);
	return own
		? { label: f.title, collapsed: true, items: [{ ...categoryItem(own), attrs: { 'data-sidebar-group-link': '' } }, ...rest] }
		: { label: f.title, collapsed: true, items: rest };
};
/** Categories grouped by their home feature. A feature with only one category gets a plain link,
 * not a collapsible holding a single item; the list is then sorted by label. */
const referenceCategories = features
	.filter(f => f.categories.length > 0)
	.map(f => f.categories.length === 1
		? categoryItem(f.categories[0])
		: categoryGroup(f))
	.sort((a, b) => a.label.localeCompare(b.label));
/** Flat, in slua.dev order (alphabetical by slug): Features Overview, then one entry per feature page.
 * lsl.dev additions beyond slua.dev's set (Inventory) slot in alphabetically. */
const featureItems = features.map(f => f.subpages.length === 0
	? { label: f.title, link: `/features/${f.id}/` }
	: {
		/** A feature with sub-pages (features/<id>/<topic>.mdx) becomes a collapsed group. */
		label: f.title,
		collapsed: true,
		items: [{ label: 'Overview', link: `/features/${f.id}/`, attrs: { 'data-sidebar-group-link': '' } }, ...f.subpages.map(s => ({ label: s.title, link: s.href }))],
	});

export default defineConfig({
	site: 'https://lsl.dev',
	// Inline `code` and links to API pages in Markdown/MDX are highlighted as LSL (see the plugin).
	markdown: { processor: unified({ rehypePlugins: [rehypeInlineLsl] }) },
	integrations: [reloadSidebarOnFeatureChanges(), starlight({
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
			Sidebar: './src/components/starlight/Sidebar.astro',
		},
		// A group's link with the data-sidebar-group-link attribute becomes the group's own label (a link
		// to its overview page beside a separate expand/collapse button), at the top level too, where the
		// label keeps the large heading style; see docs/sidebar.md.
		sidebar: [
			{
				label: 'Fundamentals',
				collapsed: true,
				items: [{ autogenerate: { directory: 'fundamentals' } }],
			},
			{
				label: 'Reference',
				collapsed: true,
				items: [
					{ label: 'Overview', link: '/reference/', attrs: { 'data-sidebar-group-link': '' } },
					{ label: 'Limits', link: '/reference/limits/', attrs: { class: 'is-priority' } },
					{ label: 'Categories', collapsed: true, items: [{ label: 'All categories', link: '/categories/', attrs: { 'data-sidebar-group-link': '' } }, ...referenceCategories] },
					{ label: 'Functions', link: '/functions/' },
					{ label: 'Events', link: '/events/' },
					{
						label: 'Constants',
						collapsed: true,
						items: [
							{ label: 'All constants', link: '/constants/', attrs: { 'data-sidebar-group-link': '' } },
							{ label: 'Constant groups', link: '/constants/groups/' },
						],
					},
					{ label: 'Types', collapsed: true, items: [{ autogenerate: { directory: 'types' } }] },
					{ label: 'Flow control', collapsed: true, items: [{ autogenerate: { directory: 'controls' } }] },
				],
			},
			{ label: 'Features', collapsed: true, items: [{ label: 'Features Overview', link: '/features/', attrs: { 'data-sidebar-group-link': '' } }, ...featureItems] },
			{ label: 'Guides', collapsed: true, items: [{ autogenerate: { directory: 'guides' } }] },
			{ label: 'Recipes', collapsed: true, items: [{ autogenerate: { directory: 'recipes' } }] },
			{ label: 'Wiki archive', link: '/wiki/' },
			{ label: 'About these docs', link: '/about/' },
		],
	})],
});
