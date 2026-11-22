export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** English lives at "/", Bangla at "/bn". */
export function localePath(locale: Locale, href: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  if (locale === defaultLocale) return href;
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}

/** Removes a leading "/bn" so the path can be matched against route names. */
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(en|bn)(\/.*)?$/);
  return m ? m[2] || "/" : pathname;
}

export const localeMeta: Record<Locale, { htmlLang: string; ogLocale: string; intl: string; label: string }> = {
  en: { htmlLang: "en", ogLocale: "en_BD", intl: "en-GB", label: "English" },
  bn: { htmlLang: "bn", ogLocale: "bn_BD", intl: "bn-BD", label: "বাংলা" },
};

export function fmtDate(locale: Locale, d: string): string {
  return new Date(d).toLocaleDateString(localeMeta[locale].intl, { day: "numeric", month: "long", year: "numeric" });
}

export function fmtNum(locale: Locale, n: number): string {
  return new Intl.NumberFormat(localeMeta[locale].intl, { useGrouping: false }).format(n);
}

/** Shows ASCII digits in the page language (Bangla: ০-৯). Use for display only, never in tel: links. */
export function digits(locale: Locale, s: string): string {
  return locale === "bn" ? s.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : s;
}

/** Replaces {placeholders} in a dictionary string. */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
