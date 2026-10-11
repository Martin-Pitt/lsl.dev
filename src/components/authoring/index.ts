/**
 * The single import barrel for authoring components in MDX:
 *
 *   import { Gotcha, RecipeMeta, Param } from '~/components/authoring';
 *
 * Integrator-owned and stable: it only re-exports each batch's own index.ts, so batch agents add
 * their exports there and never edit this file. Reference: docs/components.md.
 */
export * from './asides/index';
export * from './recipe/index';
export * from './hovercards/index';
export * from './guide/index';
export * from './media/index';
