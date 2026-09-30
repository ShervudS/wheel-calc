import { describe, expect, it } from 'vitest';
import { scriptJson } from '../escape.ts';

describe('scriptJson', () => {
  it('plain JSON that parses back', () => {
    const v = { a: 'Ø 17″ — ok', b: [1, 2] };
    expect(JSON.parse(scriptJson(v))).toEqual(v);
  });

  it('"<" is escaped: the string cannot close <script>', () => {
    const out = scriptJson({ x: '</script><b>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ x: '</script><b>' });
  });
});
