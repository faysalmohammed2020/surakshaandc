"use client";

/**
 * Tiny stand-in for `next-intl` used by the staff panel. Same hook names, so the
 * admin components stay untouched; strings come from ./messages (English).
 * Supports dotted keys and `{name}` placeholders.
 */
import { createContext, useContext, type ReactNode } from "react";
import { translate } from "./translate";

type Messages = Record<string, unknown>;
const Ctx = createContext<{ locale: string; messages: Messages }>({ locale: "en", messages: {} });

export function NextIntlClientProvider({
  locale = "en",
  messages = {},
  children,
}: {
  locale?: string;
  messages?: Messages;
  children: ReactNode;
}) {
  return <Ctx.Provider value={{ locale, messages }}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx).locale;
}

export function useTranslations(namespace?: string) {
  const { messages } = useContext(Ctx);
  return (key: string, params?: Record<string, string | number>) => translate(messages, namespace, key, params);
}
