"use client";

import { createContext, useContext, type ReactNode } from "react";
import { localePath, type Locale } from "./config";
import type { Dict } from "./en";

type Ctx = { locale: Locale; dict: Dict };
const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ locale, dict, children }: Ctx & { children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>;
}

function useCtx(): Ctx {
  const c = useContext(LocaleContext);
  if (!c) throw new Error("LocaleProvider is missing");
  return c;
}

export const useLocale = () => useCtx().locale;
export const useDict = () => useCtx().dict;
/** Returns a function that prefixes internal links with the current locale. */
export function useLp() {
  const { locale } = useCtx();
  return (href: string) => localePath(locale, href);
}
