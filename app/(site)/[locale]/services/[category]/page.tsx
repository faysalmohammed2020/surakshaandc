import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CtaBand, PageHero, ServiceCard } from "@/components/sections";
import { ImgFrame, categoryIcons } from "@/components/ui";
import { getContent, slugs } from "@/lib/content";
import { getDict } from "@/i18n";
import { fmt, fmtNum, hasLocale, locales, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

type P = { params: Promise<{ locale: string; category: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => slugs.categories.map((category) => ({ locale, category })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, category } = await params;
  if (!hasLocale(locale)) return {};
  const c = getContent(locale).getCategory(category);
  if (!c) return {};
  return {
    title: c.name,
    description: c.description,
    alternates: alternates(locale, `/services/${category}`),
    openGraph: { images: [c.image] },
  };
}

export default async function CategoryPage({ params }: P) {
  const { locale, category } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const { getCategory, servicesOf } = getContent(locale);
  const c = getCategory(category);
  if (!c) notFound();
  const list = servicesOf(c.slug);
  const Icon = categoryIcons[c.slug];

  return (
    <>
      <PageHero
        title={c.name}
        eyebrow={c.nameBn}
        sub={c.description}
        crumbs={[
          { label: d.common.breadcrumbHome, href: localePath(locale, "/") },
          { label: d.common.breadcrumbServices, href: localePath(locale, "/services") },
          { label: c.name },
        ]}
      />
      <section className="container-x mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ImgFrame className="aspect-square rounded-[2.5rem] shadow-lift">
            <Image src={c.image} alt={c.name} fill sizes="(min-width:1024px) 35vw, 90vw" className="object-cover" />
            <span className="absolute bottom-5 left-5 grid h-14 w-14 place-items-center rounded-2xl bg-white text-primary shadow-soft">
              <Icon className="h-7 w-7" />
            </span>
          </ImgFrame>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-ink">{fmt(d.services.categoryServicesTitle, { name: c.name })}</h2>
          <p className="mt-2 text-ink-soft">{fmt(d.services.categoryCount, { n: fmtNum(locale, list.length) })}</p>
          <div className="mt-8 grid gap-4">
            {list.map((s, i) => (
              <ServiceCard key={s.slug} s={s} i={i} locale={locale} />
            ))}
          </div>
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
