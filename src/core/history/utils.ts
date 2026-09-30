/** JSON-based structural comparison; fine for plain state objects. */
export function structuralEquals<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
