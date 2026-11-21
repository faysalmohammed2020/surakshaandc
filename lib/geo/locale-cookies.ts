/** Country (ISO-3166 alpha-2) from host-provided geo headers, or null. */
export function countryFromHeaders(headers: { get(name: string): string | null }): string | null {
  const v =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("cloudfront-viewer-country") ||
    headers.get("x-country-code");
  const c = v?.trim().toUpperCase();
  return c && /^[A-Z]{2}$/.test(c) ? c : null;
}
