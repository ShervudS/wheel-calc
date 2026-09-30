import type { WheelState } from '../../core/types/wheelState.ts';
import type { Unit } from '../../core/units/types.ts';
import type { Preset } from '../../data/presets.ts';
import type { Lang, Translate } from '../../i18n/types.ts';
import type { FieldId } from '../form/types.ts';
import type { HotKey } from './hotKey.ts';

export type CommitMode = 'now' | 'later' | 'none';

export interface UpdateOptions {
  /** Field being edited: its value is not overwritten. */
  skip?: FieldId | null;
  commit?: CommitMode;
}

/** State and actions shared by all UI parts. */
export interface Controller {
  readonly lang: Lang;
  readonly t: Translate;
  readonly state: WheelState;
  readonly unit: Unit;
  readonly xLimited: boolean;
  /** Current diagram scale (intermediate during the animation). */
  readonly scale: number;
  update(patch: Partial<WheelState>, opts?: UpdateOptions): void;
  refresh(): void;
  setUnit(u: Unit): void;
  setHot(k: HotKey | null): void;
  commit(): void;
  later(): void;
  undo(): void;
  redo(): void;
  reset(): void;
  applyPreset(p: Preset): void;
}
