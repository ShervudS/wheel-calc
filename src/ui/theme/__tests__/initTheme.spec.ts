// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { $, mount } from '../../__tests__/mount.ts';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

const visibleIcons = () =>
  [...document.querySelectorAll('#tt .icon:not([hidden])')].map((i) => i.getAttribute('data-icon'));

describe('theme', () => {
  it('toggling sets data-theme, is remembered and changes the label', () => {
    mount();
    const tt = $('#tt');
    expect(tt.textContent).toBe('Тёмная тема');
    tt.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('wc-theme')).toBe('dark');
    expect(tt.textContent).toBe('Светлая тема');
    tt.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('the icon matches the label: moon for dark, sun for light', () => {
    mount();
    expect(visibleIcons()).toEqual(['moon']);
    $('#tt').click();
    expect(visibleIcons()).toEqual(['sun']);
  });

  it('the saved theme is applied on load', () => {
    localStorage.setItem('wc-theme', 'dark');
    mount();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect($('#tt').textContent).toBe('Светлая тема');
  });
});
