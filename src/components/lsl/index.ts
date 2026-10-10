/**
 * Components for the hand-editable API pages in src/content/docs/{functions,events,constants}.
 * They read the structured facts from the LSL definitions at build time, so the MDX holds
 * only prose and a sync of the YAML updates every page.
 */
export { default as LSLFunction } from './LSLFunction.astro';
export { default as LSLEvent } from './LSLEvent.astro';
export { default as LSLConstant } from './LSLConstant.astro';
export { default as ConstantGroup } from './ConstantGroup.astro';
export { default as WikiSource } from './WikiSource.astro';
export { default as InlineSyntax } from '../../content/templates/InlineSyntax.astro';
