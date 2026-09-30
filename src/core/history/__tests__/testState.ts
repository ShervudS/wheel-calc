export interface S {
  v: number;
}

export const eq = (a: S, b: S) => a.v === b.v;
export const s = (v: number): S => ({ v });
