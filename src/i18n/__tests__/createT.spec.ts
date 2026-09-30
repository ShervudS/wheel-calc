import { describe, expect, it } from 'vitest';
import { createT } from '../createT.ts';

describe('createT', () => {
  it('takes text from the language dictionary and fills in parameters', () => {
    expect(createT('ru')('x.hintMax', { value: 44.6 })).toBe(
      'Максимум при такой ширине и вылете — 44.6 мм',
    );
    expect(createT('en')('unit.inValue', { value: 17 })).toBe('17"');
  });
});
