/** Look up `namespace.key` in a nested messages object and fill `{placeholders}`. Falls back to the key. */
export function translate(
  messages: Record<string, unknown>,
  namespace: string | undefined,
  key: string,
  params?: Record<string, string | number>,
): string {
  const path = [...(namespace ? namespace.split(".") : []), ...key.split(".")];
  let cur: unknown = messages;
  for (const p of path) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[p];
    else return key;
  }
  if (typeof cur !== "string") return key;
  return params ? cur.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`)) : cur;
}
