import { describe, expect, it } from 'vitest';
import { basePath } from '../basePath.ts';

describe('basePath', () => {
  it('custom domain — root', () => {
    expect(basePath('https://wheels.example')).toBe('/');
    expect(basePath('https://wheels.example/')).toBe('/');
  });

  it('GitHub Pages project site — subfolder with a trailing slash', () => {
    expect(basePath('https://user.github.io/wheel-calc')).toBe('/wheel-calc/');
    expect(basePath('https://user.github.io/wheel-calc/')).toBe('/wheel-calc/');
  });

  it('nested subfolder', () => {
    expect(basePath('https://example.com/tools/wheel-calc')).toBe('/tools/wheel-calc/');
  });
});
