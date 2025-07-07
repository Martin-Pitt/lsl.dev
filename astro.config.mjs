// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightThemeObsidian from 'starlight-theme-obsidian';


// https://astro.build/config
export default defineConfig({
	integrations: [
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
							// { label: 'Functions', link: '/functions/' },
							{
								label: 'Functions',
								items: [
									{ label: 'Overview', link: '/functions/' },
									{
										label: 'All',
										collapsed: true,
										autogenerate: { directory: 'functions' },
									},
								],
							},
							{
								label: 'Events',
								items: [
									{ label: 'Overview', link: '/events/' },
									{
										label: 'All',
										collapsed: true,
										autogenerate: { directory: 'events' },
									},
								],
							},
							{ label: 'Constants', link: '/constants/' },
							{ label: 'Types', link: '/types/' },
							{ label: 'Flow Control', link: '/controls/' },
						],
					},
					// { Link back to official LSL wiki?
					// 	label: 'LSL Wiki',
					// 	link: 'https://wiki.secondlife.com/wiki/LSL_Portal',
					// 	badge: { text: 'Official', variant: 'success' },
					// },
		  		], {
					topics: {
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
			/*sidebar: [
				{ label: 'Features', link: 'Features' },
				{
					label: 'Reference',
					items: [
						{ label: 'Functions', link: 'functions' },
						{ label: 'Events', link: 'events' },
						{ label: 'Constants', link: 'constants' },
						{ label: 'Types', link: 'types' },
						{ label: 'Flow Control', link: 'controls' },
					]
				},
				{ label: 'Guides', autogenerate: { directory: 'guides' } },
			],*/
		}),
	],
});
