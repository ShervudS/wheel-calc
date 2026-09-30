export type WarningLevel = 'warn' | 'bad';
export type WarningKind = 'stretchBad' | 'stretch' | 'narrowBad' | 'wide';

export interface TireWarning {
  level: WarningLevel;
  kind: WarningKind;
  ratio: number;
  /** Absolute difference between rim and tire width, mm. */
  diff: number;
}
