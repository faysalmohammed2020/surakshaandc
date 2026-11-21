type HeaderReader = { get(name: string): string | null };

/** Best-effort client IP from proxy headers; null when none is present. */
export function getClientIp(headers: HeaderReader): string | null {
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const c of candidates) {
    const ip = c?.trim().slice(0, 64);
    if (ip) return ip;
  }
  return null;
}
