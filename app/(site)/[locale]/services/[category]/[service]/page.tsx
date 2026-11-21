import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarHeart, Phone } from "lucide-react";
import { Blocks, CtaBand, PageHero, ServiceCard } from "@/components/sections";
import { ImgFrame, categoryIcons } from "@/components/ui";
import { getContent, slugs } from "@/lib/content";
import { site, telHref } from "@/lib/site";
import { getDict } from "@/i18n";
import { hasLocale, locales, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

type P = { params: Promise<{ locale: string; category: string; service: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => slugs.services.map((s) => ({ locale, ...s })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, category, service } = await params;
  if (!hasLocale(locale)) return {};
  const s = getContent(locale).getService(service);
  if (!s) return {};
  return {
    title: s.title,
    description: s.excerpt.slice(0, 158),
    alternates: alternates(locale, `/services/${category}/${service}`),
    openGraph: { images: s.image ? [s.image] : [] },
  };
}

export default async function ServicePage({ params }: P) {
  const { locale, category, service } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const lp = (h: string) => localePath(locale, h);
  const { categories, services, getCategory, getService, servicesOf } = getContent(locale);
  const s = getService(service);
  const c = getCategory(category);
  if (!s || !c || s.category !== c.slug) notFound();
  const siblings = servicesOf(c.slug);
  const ci = categories.findIndex((x) => x.slug === c.slug);
  const related = [1, 2]
    .map((k) => categories[(ci + k) % categories.length])
    .map((cat) => services.find((x) => x.category === cat.slug)!)
    .filter(Boolean);

  return (
    <>
      <PageHero
        title={s.title}
        eyebrow={c.name}
        crumbs={[
          { label: d.common.breadcrumbHome, href: lp("/") },
          { label: d.common.breadcrumbServices, href: lp("/services") },
          { label: c.name, href: lp(`/services/${c.slug}`) },
          { label: s.title },
        ]}
      />

      <section className="container-x mt-14 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <article>
          {s.image && (
            <ImgFrame className="mb-10 aspect-[16/9] rounded-[2.25rem] shadow-soft">
              <Image src={s.image} alt={s.title} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </ImgFrame>
          )}
          <Blocks blocks={s.blocks} />
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2rem] border-2 border-line bg-white p-5">
            <p className="px-2 font-display text-lg font-bold text-ink">{c.name}</p>
            <ul className="mt-3 space-y-1">
              {siblings.map((x) => (
                <li key={x.slug}>
                  <Link
                    href={lp(`/services/${c.slug}/${x.slug}`)}
                    className={`block rounded-xl px-3 py-2.5 text-[0.95rem] font-medium transition ${
                      x.slug === s.slug ? "bg-primary text-on-primary" : "text-ink-soft hover:bg-primary-50 hover:text-primary-700"
                    }`}
                  >
                    {x.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] bg-secondary p-6 text-on-secondary">
            <CalendarHeart className="h-8 w-8" />
            <p className="mt-3 font-display text-2xl font-bold leading-tight">{d.services.bookTitle}</p>
            <Link
              href={lp(`/appointment?service=${s.slug}`)}
              className="mt-5 flex h-12 items-center justify-center rounded-full bg-white font-semibold text-secondary-700 transition hover:-translate-y-0.5"
            >
              {d.common.bookAppointment}
            </Link>
            <a href={telHref(site.phones[0])} className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold opacity-90">
              <Phone className="h-4 w-4" /> {site.phones[0]}
            </a>
          </div>

          <div className="rounded-[2rem] bg-primary-50 p-5">
            <p className="px-2 font-display text-lg font-bold text-ink">{d.services.otherProgrammes}</p>
            <ul className="mt-3 space-y-1">
              {categories
                .filter((x) => x.slug !== c.slug)
                .map((x) => {
                  const Icon = categoryIcons[x.slug];
                  return (
                    <li key={x.slug}>
                      <Link href={lp(`/services/${x.slug}`)} className="flex items-center gap-3 rounded-xl px-2 py-2 text-[0.95rem] text-ink-soft hover:bg-white hover:text-primary-700">
                        <Icon className="h-4 w-4 text-primary" /> {x.name}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        </aside>
      </section>

      <section className="container-x mt-20">
        <h2 className="text-2xl font-bold text-ink">{d.services.related}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {related.map((x, i) => (
            <ServiceCard key={x.slug} s={x} i={i + 1} locale={locale} />
          ))}
        </div>
      </section>

      <CtaBand locale={locale} />
    </>
  );
}
