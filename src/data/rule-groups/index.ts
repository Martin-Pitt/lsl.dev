/** Constant groups with a hand-edited order; /constants/groups/<name>/ uses it for its block and table. */
import type { RuleSection } from './types';
import { primParams } from './prim-params';
export type { RuleSection, RuleLine, RuleForm } from './types';
export const ruleGroupOrders: Record<string, RuleSection[]> = { PrimParam: primParams };
