/**
 * Allowlist sanitizer for admin-authored blog HTML (Jodit output).
 * Keeps basic formatting, links and images; drops scripts, event handlers,
 * styles and unsafe URL schemes.
 */
const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "s", "sub", "sup",
  "blockquote", "ul", "ol", "li", "a", "img", "span", "div", "pre", "code",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "figure", "figcaption",
]);
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

const safeUrl = (v: string, allowMailto: boolean) => {
  const u = v.trim().replace(/[\u0000-\u001f\u007f\s]+/g, "");
  if (/^(https?:|\/(?!\/)|#)/i.test(u)) return true;
  return allowMailto && /^(mailto:|tel:)/i.test(u);
};

export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  // Remove dangerous blocks together with their content.
  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|noscript|template|svg|math|form)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|link|meta|base|input|button|textarea|select)\b[^>]*>/gi, "");

  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (full.startsWith("</")) return `</${tag}>`;
    const allowed = ALLOWED_ATTRS[tag] ?? [];
    const attrs: string[] = [];
    for (const m of rawAttrs.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
      const name = m[1].toLowerCase();
      const value = (m[2] ?? m[3] ?? m[4] ?? "").trim();
      if (!allowed.includes(name)) continue;
      if ((name === "href" || name === "src") && !safeUrl(value, name === "href")) continue;
      attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
    }
    if (tag === "a" && attrs.some((a) => a.startsWith("target="))) attrs.push('rel="noopener noreferrer"');
    return `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}>`;
  });
  return out;
}
