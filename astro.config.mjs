// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
export default defineConfig({
  site: 'https://lsl.dev',
  integrations: [starlight({
    title: 'lsl.dev', favicon: '/favicon.svg',
    description: 'A modern Linden Scripting Language reference for Second Life creators.',
    defaultLocale: 'root', locales: { root: { label: 'English', lang: 'en' } },
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Martin-Pitt/lsl.dev' }],
    pagination: false, tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
    customCss: ['./src/styles/custom.css'],
    components: { Header: './src/components/site/Header.astro', Hero: './src/components/site/Hero.astro' },
    sidebar: [
      { label: 'Start here', items: [
        { label: 'Overview', link: '/' }, { label: 'Learning guides', link: '/guides/' },
        { label: 'Language types', link: '/types/' }, { label: 'Flow control', link: '/controls/' },
      ] },
      { label: 'Language reference', items: [
        { label: 'Reference overview', link: '/reference/' }, { label: 'Functions', link: '/functions/' },
        { label: 'Events', link: '/events/' }, { label: 'Constants', link: '/constants/' },
        { label: 'Browse by category', link: '/categories/' },
      ] },
      { label: 'Knowledge library', items: [
        { label: 'Wiki archive', link: '/wiki/' }, { label: 'SLua documentation ↗', link: 'https://slua.dev' },
      ] },
    ],
  })],
});
