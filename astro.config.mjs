// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';


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
			editLink: { baseUrl: 'https://github.com/Martin-Pitt/lsl.dev/edit/main/docs/' },
			lastUpdated: true,
			customCss: [
				'./src/styles/custom.css',
			],
			sidebar: [
				{ label: 'Portal', link: '/' },
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
				
				/*{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},*/
			],
		}),
	],
});
