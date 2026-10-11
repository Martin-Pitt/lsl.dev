/**
 * Markdown export cases for the scene batch: Scene, Prim, Model, Inventory, Item.
 *
 * - Scene: `**caption** (3D scene; positions are relative to the root, Z up, metres)` and a list
 *   of its parts.
 * - Prim/Model: `- **name** (root): box; size 1, 2, 3 m; pos 0, 0, 1 m; rot 0, 0, 90°; note;
 *   contents: id` (the id of an Inventory).
 * - Inventory: `**title**` and a list of `type: name`.
 */
import type { CaseFile } from './types';
import { code } from './util';

const part = (a: Record<string, any>, what: string) => {
	const facts = [
		what,
		a.size && `size ${a.size} m`,
		a.scale && `scale ${a.scale}`,
		a.pos && `pos ${a.pos} m`,
		a.rot && `rot ${a.rot}°`,
		a.color && `colour ${a.color}`,
		a.alpha !== undefined && `alpha ${a.alpha}`,
		a.note,
		a.inventory && `contents: ${code(a.inventory)}`,
	].filter(Boolean);
	return `- **${a.name}**${a.root ? ' (root)' : ''}: ${facts.join('; ')}`;
};

export default {
	// transform, not selfClosing: a self-closing result is padded with blank lines, and these are tight list items.
	transform: {
		Prim: (_, a) => part(a, a.shape ?? 'box'),
		Model: (_, a) => part(a, 'mesh'),
		Item: (_, a) => `- ${a.type}: ${a.type === 'script' ? code(a.name) : a.name}`,
	},
	paired: {
		Scene: a => [`\n\n**${a.caption}** (3D scene; child positions are relative to the root, metres, Z up)\n`, '\n\n'],
		Inventory: a => [`\n\n**${a.title}** (contents, id ${code(a.id)})\n`, '\n\n'],
	},
} satisfies CaseFile;
