/**
 * All <Diagram> names. Each module exports a record of DiagramDef keyed by "<group>/<name>".
 * Shared by Diagram.astro and the Markdown export (src/lib/page-markdown/diagrams.ts).
 */
import { frames, type DiagramDef } from './frames';

export const diagrams: Record<string, DiagramDef> = { ...frames };

export function diagram(name: string): DiagramDef {
	const def = diagrams[name];
	if (!def) throw new Error(`<Diagram>: unknown name "${name}". Known: ${Object.keys(diagrams).join(', ')}`);
	return def;
}
