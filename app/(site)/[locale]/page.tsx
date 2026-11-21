import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarHeart,
  ClipboardList,
  HeartHandshake,
  Home as HomeIcon,
  LineChart,
  Phone,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { CategoryCard, CtaBand } from "@/components/sections";
import { Blob, Button, ImgFrame, SectionHeading } from "@/components/ui";
import { getContent } from "@/lib/content";
import { excerpt, getRecentBlogs } from "@/lib/blog";
import { bilingual, site, teamRoles, telHref, therapies, whyUs } from "@/lib/site";
import { getDict } from "@/i18n";
import { fmt, fmtDate, fmtNum, hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

// Latest blog posts come from the database, so refresh the page cache every minute.
export const revalidate = 60;

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { alternates: alternates(locale, "/") };
}

const whyIcons = [BadgeCheck, HeartHandshake, Stethoscope, Sparkles, ShieldCheck];
const journeyIcons = [ClipboardList, Puzzle, Sparkles, HomeIcon, LineChart];

export default async function HomePage({ params }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const h = d.home;
  const lp = (href: string) => localePath(locale, href);
  const { categories, services, servicesOf } = getContent(locale);
  const posts = await getRecentBlogs(3).catch(() => []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: d.site.fullName,
    url: locale === "en" ? site.url : `${site.url}/bn`,
    inLanguage: locale,
    logo: site.images.logo,
    image: site.images.hero,
    telephone: site.phones.map((p) => `+88${p.replace(/\D/g, "")}`),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Road # 10, House # 16, Rupnagar R/A, Mirpur",
      addressLocality: "Dhaka",
      postalCode: "1216",
      addressCountry: "BD",
    },
    medicalSpecialty: ["Pediatric", "SpeechPathology", "Neurologic", "PhysicalTherapy"],
    availableService: services.map((s) => ({ "@type": "MedicalTherapy", name: s.title })),
  };

  const statValues = [categories.length, services.length, teamRoles.length, site.founder.years].map((n) => fmtNum(locale, n));
  statValues[3] += "+";
  const journey = h.journey.map(([title, text], i) => ({ title, text, icon: journeyIcons[i] }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-y-0 right-0 w-1/2 opacity-50 [mask-image:radial-gradient(closest-side,black,transparent)]" />
        <div className="container-x relative grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-16">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-secondary-200 bg-secondary-50 px-4 py-1.5 text-sm font-semibold text-secondary-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
              </span>
              {h.open}
            </p>
            <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.05] text-ink sm:text-6xl lg:text-[4.1rem]">
              {h.heroA}
              <span className="squiggle text-primary">{h.heroEm}</span>
              {h.heroB}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">{d.site.description}</p>
            <p lang={locale === "en" ? "bn" : "en"} className="mt-3 max-w-xl text-base text-subtle">{d.site.descriptionAlt}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={lp("/appointment")} variant="secondary" size="lg">
                <CalendarHeart className="h-5 w-5" /> {d.cta.book}
              </Button>
              <Button href={lp("/services")} variant="outline" size="lg">
                {h.exploreServices} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <a href={telHref(site.phones[0])} className="mt-6 inline-flex items-center gap-3 text-ink-soft hover:text-primary-700">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary">
                <Phone className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-subtle">{d.common.callUs}</span>
                <span className="font-semibold text-ink">{site.phones.join("  ·  ")}</span>
              </span>
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-xl animate-fade-up [animation-delay:150ms]">
            <Blob className="absolute -left-10 -top-10 h-40 w-40 animate-float text-accent-200" />
            <Blob className="absolute -bottom-12 -right-6 h-48 w-48 animate-float text-secondary-100 [animation-delay:2s]" />
            <ImgFrame className="relative aspect-[4/4.2] rounded-[3rem] shadow-lift ring-8 ring-white">
              <Image src={site.images.hero} alt={h.heroImgAlt} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
            </ImgFrame>
            {/* floating badges */}
            <div className="absolute -left-4 bottom-10 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lift sm:-left-10">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-on-accent">
                <Star className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-2xl font-extrabold text-ink">{fmt(h.yrs, { n: fmtNum(locale, site.founder.years) })}</span>
                <span className="text-xs text-subtle">{h.experience}</span>
              </span>
            </div>
            <div className="absolute -right-2 top-10 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lift sm:-right-8">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-on-primary">
                <Users className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-2xl font-extrabold text-ink">{h.oneToOne}</span>
                <span className="text-xs text-subtle">{h.oneToOneLabel}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="container-x">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-line bg-line shadow-soft md:grid-cols-4">
          {h.stats.map(([l, alt], i) => (
            <div key={l} className="bg-white p-6 text-center md:p-8">
              <p className="font-display text-4xl font-extrabold text-primary md:text-5xl">
                {statValues[i]}
              </p>
              <p className="mt-1 font-semibold text-ink">{l}</p>
              <p lang={locale === "en" ? "bn" : "en"} className="text-sm text-subtle">{alt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="container-x mt-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            align="left"
            eyebrow={h.servicesEyebrow}
            title={<>{h.servicesTitleA}<span className="squiggle">{h.servicesTitleEm}</span></>}
            sub={h.servicesSub}
          />
          <Button href={lp("/services")} variant="ghost">
            {fmt(h.viewAll, { n: fmtNum(locale, services.length) })} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <CategoryCard key={c.slug} c={c} i={i} count={servicesOf(c.slug).length} locale={locale} />
          ))}
        </div>
      </section>

      {/* ================= WHY US ================= */}
      <section className="mt-28 bg-primary-50 py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <ImgFrame className="aspect-[5/4] rounded-[2.5rem] shadow-lift">
              <Image src={site.images.about} alt={h.whyImgAlt} fill sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />
            </ImgFrame>
            <div className="absolute -bottom-8 right-6 max-w-[16rem] rounded-3xl bg-secondary p-5 text-on-secondary shadow-lift">
              <p lang="bn" className="font-display text-lg font-bold leading-snug">{h.quote}</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading align="left" eyebrow={h.whyEyebrow} title={h.whyTitle} sub={d.site.description} />
            <ul className="mt-8 grid gap-3">
              {whyUs.map((w, i) => {
                const Icon = whyIcons[i];
                const [primary, secondary] = bilingual({ en: w.title, bn: w.bn }, locale);
                return (
                  <li key={w.title} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-100 text-primary-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{primary}</span>
                      <span lang={locale === "en" ? "bn" : "en"} className="text-sm text-subtle">{secondary}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ================= JOURNEY ================= */}
      <section className="container-x mt-28">
        <SectionHeading eyebrow={h.journeyEyebrow} title={h.journeyTitle} sub={h.journeySub} />
        <ol className="relative mt-14 grid gap-6 md:grid-cols-5">
          <div aria-hidden className="absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-primary-200 md:block" />
          {journey.map((j, i) => (
            <li key={j.title} className="relative text-center">
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-primary shadow-soft ring-4 ring-surface">
                <j.icon className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent">
                  {fmtNum(locale, i + 1)}
                </span>
              </span>
              <h3 className="mt-5 text-xl font-bold text-ink">{j.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{j.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ================= TEAM + THERAPIES ================= */}
      <section className="container-x mt-28 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2.5rem] bg-primary-900 p-8 text-white md:p-12">
          <p className="eyebrow !text-accent">{h.teamEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{h.teamTitle}</h2>
          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {teamRoles.map((r) => {
              const [primary, secondary] = bilingual(r, locale);
              return (
                <li key={r.en} className="rounded-xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
                  <span className="block font-semibold">{primary}</span>
                  <span lang={locale === "en" ? "bn" : "en"} className="text-sm text-white/60">{secondary}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-[2.5rem] bg-secondary-50 p-8 md:p-12">
          <p lang="bn" className="eyebrow">{h.therapiesEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">{h.therapiesTitle}</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {therapies.map((t, i) => (
              <span
                key={t.en}
                className={`rounded-full px-5 py-3 font-semibold shadow-soft ${
                  ["bg-white text-ink", "bg-primary text-on-primary", "bg-accent text-on-accent"][i % 3]
                }`}
              >
                {bilingual(t, locale)[0]}
              </span>
            ))}
          </div>
          <div className="mt-10 rounded-3xl bg-white p-6 shadow-soft" id="founder">
            <p className="text-sm font-semibold text-secondary-700">{h.founderLabel}</p>
            <p lang="bn" className="mt-1 font-display text-2xl font-bold text-ink">{site.founder.nameBn}</p>
            <p className="text-ink-soft">
              {fmt(h.founderLine, { role: d.site.founderRole, n: fmtNum(locale, site.founder.years) })}
            </p>
            <Link href={lp("/about")} className="mt-4 inline-flex items-center gap-1 font-semibold text-primary-700">
              {h.readStory} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= BLOG ================= */}
      {posts.length > 0 && (
      <section className="container-x mt-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading align="left" eyebrow={h.blogEyebrow} title={h.blogTitle} />
          <Button href={lp("/blog")} variant="ghost">
            {h.allPosts} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-10 grid gap-6">
          {posts.map((p) => (
            <Link key={p.slug} href={lp(`/blog/${p.slug}`)} className="group grid overflow-hidden rounded-[2rem] bg-white shadow-soft transition hover:shadow-lift md:grid-cols-[1fr_1.2fr]">
              <ImgFrame className="aspect-[16/10] md:aspect-auto md:min-h-72">
                <Image src={p.image} alt="" fill unoptimized sizes="(min-width:768px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </ImgFrame>
              <div className="flex flex-col justify-center p-8 md:p-10">
                <time className="text-sm font-semibold text-secondary-700">{fmtDate(locale, p.date.toISOString())}</time>
                <h3 className="mt-2 text-2xl font-bold leading-snug text-ink group-hover:text-primary-700 md:text-3xl">{p.title}</h3>
                <p className="mt-3 line-clamp-3 leading-relaxed text-ink-soft">{excerpt(p.summary, 200)}</p>
                <span className="mt-5 inline-flex items-center gap-1 font-semibold text-primary-700">
                  {d.common.readMore} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

      <CtaBand locale={locale} />

      {/* ================= MAP ================= */}
      <section className="container-x mt-24">
        <div className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-soft lg:grid-cols-[1fr_1.6fr]">
          <div className="p-8 md:p-12">
            <SectionHeading align="left" eyebrow={h.visitEyebrow} title={h.visitTitle} />
            <p className="mt-6 text-lg text-ink-soft">{d.site.address}</p>
            <div className="mt-6 space-y-2">
              {site.phones.map((p) => (
                <a key={p} href={telHref(p)} className="flex items-center gap-3 font-semibold text-ink hover:text-primary-700">
                  <Phone className="h-4 w-4 text-primary" /> {p}
                </a>
              ))}
            </div>
            <Button href={lp("/contact")} variant="primary" className="mt-8">
              {h.contactUs}
            </Button>
          </div>
          <iframe
            title={h.mapTitle}
            src={site.mapEmbed}
            className="h-80 w-full border-0 lg:h-full lg:min-h-[26rem]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
