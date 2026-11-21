import Image from "next/image";
import Link from "next/link";
import { CalendarHeart, ChevronRight, Phone } from "lucide-react";
import type { Block, Category, Service } from "@/data/types";
import { site, telHref } from "@/lib/site";
import { getDict } from "@/i18n";
import { fmt, fmtNum, localePath, type Locale } from "@/i18n/config";
import { Blob, Button, ImgFrame, categoryIcons, tones } from "./ui";

/* ---------- Page hero with breadcrumb ---------- */
export function PageHero({
  title,
  sub,
  crumbs,
  eyebrow,
}: {
  title: string;
  sub?: string;
  eyebrow?: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <section className="care-page-hero relative overflow-hidden bg-primary-50">
      <div className="dot-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Blob className="absolute -right-24 -top-24 h-80 w-80 text-secondary-100" />
      <Blob className="absolute -bottom-32 -left-20 h-72 w-72 text-accent-100" />
      <div className="container-x relative py-14 md:py-20">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-subtle">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {c.href ? (
                <Link href={c.href} className="hover:text-primary-700">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
            </span>
          ))}
        </nav>
        {eyebrow && <p lang={/[\u0980-\u09FF]/.test(eyebrow) ? "bn" : undefined} className="eyebrow mt-6">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold text-ink sm:text-5xl">{title}</h1>
        {sub && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{sub}</p>}
      </div>
    </section>
  );
}

/* ---------- Category card ---------- */
export function CategoryCard({ c, i, count, locale }: { c: Category; i: number; count: number; locale: Locale }) {
  const d = getDict(locale);
  const Icon = categoryIcons[c.slug];
  const t = tones[i % tones.length];
  return (
    <Link
      href={localePath(locale, `/services/${c.slug}`)}
      className={`care-category group relative flex flex-col overflow-hidden rounded-[var(--radius-blob)] border-2 border-transparent bg-card p-3 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${t.ring}`}
    >
      <div className="care-service-symbol"><Icon strokeWidth={1.4} aria-hidden="true" /><span>{fmt(d.cards.programmes, { n: fmtNum(locale, count) })}</span></div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        {locale === "en" && <p lang="bn" className="text-sm font-medium text-secondary-700">{c.nameBn}</p>}
        <h3 className="mt-1 text-2xl font-bold text-ink">{c.name}</h3>
        <p className="care-category-description mt-2 flex-1 leading-relaxed text-ink-soft">{c.description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-semibold">
          <span className="text-subtle">{fmt(d.cards.programmes, { n: fmtNum(locale, count) })}</span>
          <span className="flex items-center gap-1 text-primary-700">
            {d.common.explore}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Service card ---------- */
export function ServiceCard({ s, i = 0, locale }: { s: Service; i?: number; locale: Locale }) {
  const t = tones[i % tones.length];
  return (
    <Link
      href={localePath(locale, `/services/${s.category}/${s.slug}`)}
      className={`care-service-card group flex gap-4 rounded-3xl border-2 border-line bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft ${t.ring}`}
    >
      <ImgFrame className="aspect-square w-24 shrink-0 rounded-2xl sm:w-28">
        {s.image && (
          <Image src={s.image} alt={s.title} fill sizes="112px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
        )}
      </ImgFrame>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2">
        <h3 className="text-lg font-bold leading-snug text-ink group-hover:text-primary-700">{s.title}</h3>
        <p className="mt-1 line-clamp-2 text-[0.92rem] leading-relaxed text-ink-soft">{s.excerpt}</p>
      </div>
    </Link>
  );
}

/* ---------- Rich content renderer (from scraped blocks) ---------- */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-suraksha">
      {blocks.map((b, i) => {
        if (b.type === "list") {
          return (
            <ul key={i} className="my-5 grid gap-3">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3 rounded-2xl bg-primary-50/70 p-4">
                  <span className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                      <path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="leading-relaxed text-ink-soft">
                    {it.label && <strong className="font-semibold text-ink">{it.label}: </strong>}
                    {it.text}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
        if (b.type === "h3") return <h3 key={i}>{b.text}</h3>;
        if (b.type === "lead") return <p key={i} className="lead">{b.text}</p>;
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}

/* ---------- CTA band ---------- */
export function CtaBand({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  return (
    <section className="container-x mt-24">
      <div className="care-cta relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-14 text-on-primary sm:px-12 md:py-16">
        <Blob className="absolute -right-16 -top-20 h-72 w-72 text-white/10" />
        <Blob className="absolute -bottom-28 right-1/4 h-56 w-56 text-accent/20" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p lang="bn" className="font-medium opacity-80">{d.cta.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              {d.cta.title}
            </h2>
            <p className="mt-4 max-w-xl text-lg opacity-85">
              {d.cta.text}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
            <Button href={localePath(locale, "/appointment")} variant="accent" size="lg">
              <CalendarHeart className="h-5 w-5" /> {d.cta.book}
            </Button>
            <a
              href={telHref(site.phones[0])}
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 border-current/30 px-7 font-semibold transition hover:bg-white/10"
            >
              <Phone className="h-4 w-4" /> {fmt(d.common.callPhone, { phone: site.phones[0] })}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
