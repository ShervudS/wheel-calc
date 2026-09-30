export interface History<T> {
  readonly past: readonly T[];
  readonly present: T;
  readonly future: readonly T[];
}

export type Equals<T> = (a: T, b: T) => boolean;
