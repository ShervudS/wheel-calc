/** Element by id; a missing element is a markup bug, not a runtime case. */
export function byId<T extends Element = HTMLElement>(doc: Document, id: string): T {
  const el = doc.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as unknown as T;
}

export function qs<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`${selector} not found`);
  return el as T;
}
