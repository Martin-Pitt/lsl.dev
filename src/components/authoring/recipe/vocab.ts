/** Shared vocabulary and validation for the recipe batch (used by the components and recipe.ts). */
import { catalog, apiHref } from '../../../lib/catalog';

const constants = new Set((catalog.constants as any[]).map(c => c.name));

/** Permissions that always show the owner a dialog (never auto-granted by sitting or attaching). */
export const PROMPTING = new Set([
	'PERMISSION_DEBIT', 'PERMISSION_CHANGE_LINKS', 'PERMISSION_TELEPORT', 'PERMISSION_RETURN_OBJECTS',
	'PERMISSION_SILENT_ESTATE_MANAGEMENT', 'PERMISSION_CHANGE_JOINTS', 'PERMISSION_CHANGE_PERMISSIONS',
	'PERMISSION_RELEASE_OWNERSHIP', 'PERMISSION_REMAP_CONTROLS',
]);

export function permission(name: string, where: string) {
	if (typeof name !== 'string' || !/^PERMISSION_[A-Z_]+$/.test(name) || !constants.has(name)) throw new Error(`${where}: unknown permission "${name}" (use a PERMISSION_* constant from the catalog)`);
	return { name, href: apiHref('constant', name), prompts: PROMPTING.has(name) };
}

/** Default heading of <Prerequisites> (also used by its Markdown export). */
export const PREREQ_TITLE = 'What you need to know';

export const LAND: Record<string, string> = { build: 'build rights', scripts: 'script rights', owner: 'land owner', group: 'land group' };

/** Boolean Requires flags: [prop, text used in the badge and in the Markdown export]. */
export const REQUIRE_FLAGS: [string, string][] = [['experience', 'an experience'], ['attachment', 'attached'], ['seated', 'seated'], ['owner', 'owner only']];

/** Throws for a prop outside the allowed set, so a typo fails the build. */
export function onlyProps(props: object, allowed: string[], where: string) {
	for (const k of Object.keys(props)) if (!allowed.includes(k)) throw new Error(`${where}: unknown prop "${k}" (allowed: ${allowed.join(', ')})`);
}

/** Requires: validated labels in display order (permissions first). */
export function requirements(p: Record<string, any>) {
	onlyProps(p, ['permissions', 'experience', 'land', 'attachment', 'seated', 'owner'], 'Requires');
	const perms = (p.permissions ?? []).map((n: string) => permission(n, 'Requires'));
	if (p.land !== undefined && !LAND[p.land]) throw new Error(`Requires: land must be one of ${Object.keys(LAND).join(', ')} (got "${p.land}")`);
	for (const [k] of REQUIRE_FLAGS) if (p[k] !== undefined && typeof p[k] !== 'boolean') throw new Error(`Requires: ${k} is a bare boolean attribute`);
	const flags = REQUIRE_FLAGS.filter(([k]) => p[k]).map(([, t]) => t);
	if (p.land) flags.splice(p.experience ? 1 : 0, 0, LAND[p.land]);
	if (!perms.length && !flags.length) throw new Error('Requires: give at least one requirement');
	return { perms: perms as ReturnType<typeof permission>[], flags };
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const scriptId = (name: string) => `script-${slug(name)}`;
