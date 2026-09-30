/** Browser window with global constructors (setTimeout, DOMPoint…). */
export type Win = Window & typeof globalThis;

export interface InitOptions {
  /** Removes document and window listeners (for tests that remount the page). */
  signal?: AbortSignal;
}
