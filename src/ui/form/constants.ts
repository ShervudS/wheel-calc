import type { WarningKind } from '../../core/tire/types.ts';
import type { RuntimeKey } from '../../i18n/types.ts';

export const WARN_KEYS: Readonly<Record<WarningKind, { title: RuntimeKey; body: RuntimeKey }>> = {
  stretchBad: { title: 'warn.stretchBad.title', body: 'warn.stretchBad.body' },
  stretch: { title: 'warn.stretch.title', body: 'warn.stretch.body' },
  narrowBad: { title: 'warn.narrowBad.title', body: 'warn.narrowBad.body' },
  wide: { title: 'warn.wide.title', body: 'warn.wide.body' },
};
