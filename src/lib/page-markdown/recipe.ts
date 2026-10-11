/**
 * Markdown export cases for Batch 2 (recipe kit): RecipeMeta, Prerequisites, Steps/BuildStep, Linkset, ScriptFile, Requires.
 * Owned by the recipe batch agent. Each component gets a case here; see ./types.ts and
 * docs/design/components-plan.md for the agreed Markdown form of each component.
 */
import { PREREQ_TITLE, requirements } from '../../components/authoring/recipe/vocab';
import { code, indent } from './util';
import type { CaseFile } from './types';

export default {
	selfClosing: {
		RecipeMeta: a => [`**Scripts:** ${a.scripts ?? 1}`, a.time && `**Time:** ${a.time}`].filter(Boolean).join(' · '),
		Requires: a => {
			const { perms, flags } = requirements(a);
			return `**Requires:** ${[...perms.map(p => code(p.name)), ...flags].join(', ')}`;
		},
	},
	paired: {
		Prerequisites: a => [`\n\n**${a.title ?? PREREQ_TITLE}**\n\n`, '\n\n'],
		ScriptFile: a => [`\n\n**${a.name}**${a.in ? ` (put in: ${a.in})` : ''}\n\n`, '\n\n'],
		Linkset: a => [a.title ? `\n\n**${a.title}** (linkset; the first item is the root, link 1)\n\n` : '\n\n', '\n\n'],
	},
	transform: {
		/** `1. **Title**` and the body indented under it, so its fences stay inside the list item. */
		BuildStep: (children, a) => `\n\n1. **${a.title}**${children.trim() ? `\n\n   ${indent(children.trim(), 3)}` : ''}\n\n`,
	},
	passthrough: ['Steps'], // Starlight Steps; the recipe kit wraps it
} satisfies CaseFile;
