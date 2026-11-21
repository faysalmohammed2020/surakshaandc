const cache = new Map<string, { country: string | null; at: number }>();
const TTL = 6 * 60 * 60_000;

const isPrivate = (ip: string) =>
  ip === "::1" || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);

/** Country lookup through a free GeoIP service; null when unknown/offline. */
export async function lookupCountry(ip: string): Promise<string | null> {
  if (isPrivate(ip)) return null;
  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < TTL) return hit.country;
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`, {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    const j = (await res.json()) as { status?: string; countryCode?: string };
    const country = j.status === "success" && j.countryCode ? j.countryCode : null;
    cache.set(ip, { country, at: Date.now() });
    return country;
  } catch {
    return null;
  }
}
