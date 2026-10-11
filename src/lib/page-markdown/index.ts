/**
 * Registry of the page-markdown case files, one per component batch. Integrator-owned: batch
 * agents edit only their own case file, never this list.
 */
import type { CaseFile, MarkdownPage, Attrs, Context } from './types';
import core from './core';
import asides from './asides';
import recipe from './recipe';
import hovercards from './hovercards';
import guide from './guide';
import media from './media';
import scene from './scene';

export const caseFiles: Record<string, CaseFile> = { core, asides, recipe, hovercards, guide, media, scene };

type SelfClosing = (a: Attrs, page: MarkdownPage, ctx: Context) => string | undefined;
type Paired = (a: Attrs, page: MarkdownPage, ctx: Context) => [string, string];
type Transform = (children: string, a: Attrs, page: MarkdownPage, ctx: Context) => string;

export const selfClosingCases = new Map<string, SelfClosing>();
export const pairedCases = new Map<string, Paired>();
export const transformCases = new Map<string, Transform>();
/** Tag name to the case file that handles it; a tag claimed by two files is a build error. */
export const handledBy = new Map<string, string>();

for (const [file, cases] of Object.entries(caseFiles)) {
	const claim = (tag: string) => {
		const other = handledBy.get(tag);
		if (other && other !== file) throw new Error(`page-markdown: <${tag}> is handled by both ${other}.ts and ${file}.ts`);
		handledBy.set(tag, file);
	};
	for (const [tag, fn] of Object.entries(cases.selfClosing ?? {})) { claim(tag); selfClosingCases.set(tag, fn); }
	for (const [tag, fn] of Object.entries(cases.paired ?? {})) { claim(tag); pairedCases.set(tag, fn); }
	for (const [tag, fn] of Object.entries(cases.transform ?? {})) { claim(tag); transformCases.set(tag, fn); }
	for (const tag of cases.passthrough ?? []) claim(tag);
}
