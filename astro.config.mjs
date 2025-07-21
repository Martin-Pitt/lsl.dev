// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightThemeObsidian from 'starlight-theme-obsidian';
import { astroExpressiveCode } from '@astrojs/starlight/expressive-code';
import { readFile } from 'fs/promises';



// https://astro.build/config
export default defineConfig({
	integrations: [
		astroExpressiveCode({
			shiki: {
				langs: [
					JSON.parse(await readFile('./src/content/data/lsl_grammar.json', 'utf-8'))
				],
			},
			tabWidth: 0,
		}),
		starlight({
			title: 'LSL Dev',
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Martin-Pitt/lsl.slua.dev' }],
			editLink: { baseUrl: 'https://github.com/Martin-Pitt/lsl.dev/edit/main/' },
			lastUpdated: true,
			customCss: [
				'./src/styles/custom.css',
			],
			components: {
				// PageFrame: './src/components/PageFrame.astro',
				Sidebar: './src/components/Sidebar.astro',
			},
			plugins: [
				starlightThemeObsidian(),
				starlightSidebarTopics([
					{
						label: 'Guides',
						id: 'guides',
						link: '/guides/',
						icon: 'right-arrow',
						items: [],
						badge: {
							text: 'WIP',
							variant: 'danger',
						}
					},
					{
						label: 'Features',
						id: 'features',
						link: '/features/',
						icon: 'open-book',
						items: [],
						badge: {
							text: 'WIP',
							variant: 'danger',
						}
					},
					{
						label: 'Reference',
						id: 'reference',
						link: '/reference/',
						icon: 'list-format',
						items: [
							{
								label: 'Functions',
								collapsed: true,
								autogenerate: { directory: 'functions' },
							},
							{
								label: 'Events',
								collapsed: true,
								autogenerate: { directory: 'events' },
							},
							{
								label: 'Constants',
								collapsed: true,
								autogenerate: { directory: 'constants' },
							},
							{
								label: 'Types',
								collapsed: true,
								autogenerate: { directory: 'types' },
							},
							{
								label: 'Flow Control',
								collapsed: true,
								autogenerate: { directory: 'controls' },
							},
						],
					},
					// { Link back to official LSL wiki?
					// 	label: 'LSL Wiki',
					// 	link: 'https://wiki.secondlife.com/wiki/LSL_Portal',
					// 	badge: { text: 'Official', variant: 'success' },
					// },
		  		], {
					topics: {
						guides: [
							'/guides/**',
						],
						features: [
							'/features/**',
						],
						reference: [
							'/functions/**',
							'/events/**',
							'/constants/**',
							'/types/**',
							'/controls/**',
						],
					},
				}),
			],
			tableOfContents: false,
		}),
	],
});
