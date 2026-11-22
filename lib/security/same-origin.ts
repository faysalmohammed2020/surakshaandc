type HeaderSource = Headers | Record<string, string | string[] | undefined>;

function header(headers: HeaderSource, name: string): string | undefined {
  if (headers instanceof Headers) return headers.get(name) ?? undefined;
  const v = headers[name];
  return (Array.isArray(v) ? v[0] : v)?.split(",")[0]?.trim() || undefined;
}

/**
 * CSRF / WebSocket origin check. Accepts the configured public origin (NEXTAUTH_URL) and
 * the host the request actually reached (Host / X-Forwarded-Host), so it works behind a
 * reverse proxy, on the custom Node server and on Vercel preview URLs alike.
 * Browsers cannot forge Origin, and cross-site pages cannot set X-Forwarded-Host.
 */
export function isAllowedOrigin(origin: string | null | undefined, headers: HeaderSource, requestUrl?: string) {
  if (!origin) return false;
  let originHost: string;
  try { originHost = new URL(origin).host; } catch { return false; }
  const allowed = new Set<string>();
  try { if (process.env.NEXTAUTH_URL) allowed.add(new URL(process.env.NEXTAUTH_URL).host); } catch { /* ignore bad env */ }
  const forwarded = header(headers, "x-forwarded-host");
  const host = header(headers, "host");
  if (forwarded) allowed.add(forwarded);
  if (host) allowed.add(host);
  try { if (requestUrl) allowed.add(new URL(requestUrl).host); } catch { /* ignore */ }
  return allowed.has(originHost);
}

/** Same-origin check for state-changing API requests. */
export function isSameOrigin(request: Request) {
  return isAllowedOrigin(request.headers.get("origin"), request.headers, request.url);
}
