import type { FieldId } from './types.ts';

/** Number from an input; empty or non-numeric gives NaN. */
export const numberOf = (el: HTMLInputElement) => parseFloat(el.value);

/** Update options: keep the field being edited, commit to history after a pause. */
export const deferredCommit = (skip: FieldId) => ({ skip, commit: 'later' as const });
