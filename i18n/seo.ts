import type { Metadata } from "next";
import { locales, localePath, type Locale } from "./config";

/** canonical + hreflang alternates for a page path (path is locale-less, e.g. "/about"). */
export function alternates(locale: Locale, path: string): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, localePath(l, path)]));
  languages["x-default"] = localePath("en", path);
  return { canonical: localePath(locale, path), languages };
}
