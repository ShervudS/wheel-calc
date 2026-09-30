export type FieldId = 'D' | 'W' | 'ET' | 'X' | 'B' | 'TW' | 'TA';

export interface Form {
  /** Copies the state into the fields, leaving the skip field untouched. */
  fill(skip: FieldId | null): void;
}
