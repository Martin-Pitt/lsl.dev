import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { readFile } from 'fs/promises';


export default {
	shiki: {
		langs: [
			JSON.parse(await readFile('./src/content/data/lsl_grammar.json', 'utf-8'))
		],
	},
	tabWidth: 0,
	plugins: [
		pluginCollapsibleSections(),
	],
};