import { describe, expect, it } from 'vitest';
import { tireWarning } from '../fit.ts';

describe('warnings by sr', () => {
  const tw = 250;
  const at = (sr: number) => tireWarning(sr * tw, tw);

  it('normal fit has no warning', () => {
    expect(at(0.8)).toBeNull();
    expect(at(1)).toBeNull();
    expect(at(0.68)).toBeNull();
  });

  it('sr > 1.12: red, too strong a stretch', () => {
    const w = at(1.2);
    expect(w).toMatchObject({ level: 'bad', kind: 'stretchBad' });
    expect(w?.ratio).toBeCloseTo(1.2, 10);
    expect(w?.diff).toBeCloseTo(0.2 * tw, 10);
  });

  it('1 < sr ≤ 1.12: yellow, stretch', () => {
    expect(at(1.12)).toMatchObject({ level: 'warn', kind: 'stretch' });
    expect(at(1.01)).toMatchObject({ level: 'warn', kind: 'stretch' });
  });

  it('sr < 0.60: red, rim too narrow', () => {
    const w = at(0.5);
    expect(w).toMatchObject({ level: 'bad', kind: 'narrowBad' });
    expect(w?.diff).toBeCloseTo(0.5 * tw, 10);
  });

  it('0.60 ≤ sr < 0.68: yellow, tire a bit wide', () => {
    expect(at(0.6)).toMatchObject({ level: 'warn', kind: 'wide' });
    expect(at(0.67)).toMatchObject({ level: 'warn', kind: 'wide' });
  });

  it('values exactly at the thresholds', () => {
    expect(tireWarning(112, 100)?.kind).toBe('stretch');
    expect(tireWarning(100, 100)).toBeNull();
    expect(tireWarning(60, 100)?.kind).toBe('wide');
    expect(tireWarning(68, 100)).toBeNull();
  });
});
