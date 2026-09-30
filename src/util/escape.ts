/** Escaping for HTML/SVG text and attributes. */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** JSON for embedding in <script>: "<" is escaped so the text can't close the tag. */
export function scriptJson(v: object): string {
  return JSON.stringify(v).replace(/</g, '\\u003c');
}
