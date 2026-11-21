import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CategoryCard, CtaBand, PageHero, ServiceCard } from "@/components/sections";
import { categoryIcons } from "@/components/ui";
import { getContent } from "@/lib/content";
import { getDict } from "@/i18n";
import { hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { ...getDict(locale).meta.services, alternates: alternates(locale, "/services") };
}

export default async function ServicesPage({ params }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const { categories, servicesOf } = getContent(locale);

  return (
    <>
      <PageHero
        title={d.services.heroTitle}
        eyebrow={d.services.heroEyebrow}
        sub={d.services.heroSub}
        crumbs={[{ label: d.common.breadcrumbHome, href: localePath(locale, "/") }, { label: d.common.breadcrumbServices }]}
      />

      <section className="container-x mt-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <CategoryCard key={c.slug} c={c} i={i} count={servicesOf(c.slug).length} locale={locale} />
          ))}
        </div>
      </section>

      <section className="container-x mt-24 space-y-16">
        {categories.map((c) => {
          const Icon = categoryIcons[c.slug];
          const list = servicesOf(c.slug);
          return (
            <div key={c.slug} id={c.slug} className="scroll-mt-28">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-line pb-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-on-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p lang={locale === "en" ? "bn" : "en"} className="text-sm text-secondary-700">{c.nameBn}</p>
                    <h2 className="text-2xl font-bold text-ink md:text-3xl">{c.name}</h2>
                  </div>
                </div>
                <Link href={localePath(locale, `/services/${c.slug}`)} className="flex items-center gap-1 font-semibold text-primary-700">
                  {d.common.overview} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {list.map((s, i) => (
                  <ServiceCard key={s.slug} s={s} i={i} locale={locale} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <CtaBand locale={locale} />
    </>
  );
}
