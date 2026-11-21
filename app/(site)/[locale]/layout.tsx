import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/baloo-da-2/600.css";
import "@fontsource/baloo-da-2/700.css";
import "@fontsource/baloo-da-2/800.css";
import "../../globals.css";
import { Header } from "@/components/Header";
import { SiteMotion } from "@/components/SiteMotion";
import { Footer } from "@/components/Footer";
import { Suspense } from "react";
import { FloatingContact } from "@/components/FloatingContact";
import { ChatWidget } from "@/components/ChatWidget";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import AnalyticsTracker from "@/components/admin/AnalyticsTracker";
import { getContent } from "@/lib/content";
import { getNav, site } from "@/lib/site";
import { getDict } from "@/i18n";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { hasLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

type P = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<P, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDict(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: d.meta.defaultTitle, template: `%s | ${d.site.name}` },
    description: `${d.site.description} ${d.meta.defaultDescriptionExtra}`,
    alternates: alternates(locale, "/"),
    openGraph: {
      type: "website",
      siteName: d.site.fullName,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].ogLocale),
      images: [{ url: site.images.hero }],
    },
    icons: { icon: site.images.logo },
  };
}

export const viewport: Viewport = { themeColor: "#0e7c86" };

export default async function RootLayout({ children, params }: P) {
  const { locale: raw } = await params;
  if (!hasLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDict(locale);
  const { categories, servicesOf } = getContent(locale);

  const menu = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    services: servicesOf(c.slug).map((s) => ({ slug: s.slug, title: s.title })),
  }));

  return (
    <html lang={localeMeta[locale].htmlLang} suppressHydrationWarning>
      <body className="public-site min-h-screen">
        <LocaleProvider locale={locale} dict={dict}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
            {dict.common.skipToContent}
          </a>
          <Header nav={getNav(dict)} menu={menu} phones={site.phones} email={site.email} address={dict.site.address} />
          <main id="main">{children}</main>
          <SiteMotion />
          <Footer locale={locale} />
          <FloatingContact phone={site.phones[0]} />
          <WhatsAppButton number={site.whatsapp} />
          <ChatWidget />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </LocaleProvider>
      </body>
    </html>
  );
}
