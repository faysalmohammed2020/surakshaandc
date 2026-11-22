import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../../public-site.css";

import AuthSessionProvider from "@/lib/session-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContent } from "@/lib/content";
import { getNav, site } from "@/lib/site";
import { getDict } from "@/i18n";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Sign-in / sign-up live in the staff panel tree (no locale prefix), but they wear the public
 * site's header, footer and colours so visitors never feel they left the site.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const locale = "en" as const;
  const dict = getDict(locale);
  const { categories, servicesOf } = getContent(locale);
  const menu = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    services: servicesOf(c.slug).map((s) => ({ slug: s.slug, title: s.title })),
  }));

  return (
    <AuthSessionProvider>
      <LocaleProvider locale={locale} dict={dict}>
        <div className="public-site flex min-h-screen flex-col">
          <Header nav={getNav(dict)} menu={menu} phones={site.phones} email={site.email} address={dict.site.address} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer locale={locale} />
        </div>
      </LocaleProvider>
    </AuthSessionProvider>
  );
}
