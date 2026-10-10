/**
 * Hand-editable grouping for long rule lists (see docs/editing-api-pages.md, "Grouping a long
 * rules list"). A page passes one of these to <ConstantGroup order={…} />; the component renders
 * the sections in this order, each header linking to the `###` section with the same `id`.
 */
export interface RuleForm {
	/** The form's leading constant, e.g. PRIM_TYPE_BOX. */
	name: string;
	/** Typed arguments after the form constant; default: the form constant's definition values. */
	args?: string;
}
export interface RuleLine {
	rule: string;
	/** Typed arguments, e.g. "integer face, vector color, float alpha". Default: the definition's values, else a `[RULE, …]` shape quoted in its description. */
	args?: string;
	/** Short trailing comment: only what the shape cannot say (a limit, a unit, a get/set difference). */
	note?: string;
	/** Comment used instead of `note` on getter pages (mode="get"). */
	getNote?: string;
	/** Set-only rule: getter pages show `[ RULE ]` and the note, with no return list. */
	setOnly?: boolean;
	/** One line per form for multi-form rules (PRIM_TYPE → PRIM_TYPE_BOX, …). */
	forms?: RuleForm[];
}
export interface RuleSection {
	title: string;
	/** Anchor of the `###` section below the block (Starlight's slug of the heading). */
	id: string;
	rules: (string | RuleLine)[];
}
