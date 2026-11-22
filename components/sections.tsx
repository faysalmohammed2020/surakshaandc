import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarHeart, ChevronRight, Phone } from "lucide-react";
import type { Block, Category, Service } from "@/data/types";
import { site, telHref } from "@/lib/site";
import { getDict } from "@/i18n";
import { fmt, fmtNum, localePath, type Locale } from "@/i18n/config";
import { ImgFrame, categoryIcons } from "./ui";
import { Heart, Hearts, Loop, Rays, Wave } from "./decor";

/* ---------- Page hero with breadcrumb ---------- */
export function PageHero({
  title,
  sub,
  crumbs,
  eyebrow,
  image,
}: {
  title: string;
  sub?: string;
  eyebrow?: string;
  crumbs: { label: string; href?: string }[];
  /** Optional photo shown in a ring of colourful arcs on the right (desktop/tablet). */
  image?: string;
}) {
  return (
    <section className={`care-page-hero ${image ? "has-image" : ""}`}>
      <Hearts preset="hero" />
      <Loop className="ph-loop" />
      <Rays className="ph-rays" />
      <div className="container-x ph-inner">
        <nav aria-label="Breadcrumb" className="ph-crumbs">
          {crumbs.map((c, i) => (
            <span key={i}>
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              {i < crumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
            </span>
          ))}
        </nav>
        {eyebrow && <p lang={/[ঀ-৿]/.test(eyebrow) ? "bn" : undefined} className="ph-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {sub && <p className="ph-sub">{sub}</p>}
        {image && (
          <div className="ph-photo" aria-hidden>
            <svg viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="94" pathLength={100} strokeDasharray="22 78" transform="rotate(200 100 100)" stroke="#ffc23d" />
              <circle cx="100" cy="100" r="94" pathLength={100} strokeDasharray="12 88" transform="rotate(320 100 100)" stroke="#e8479a" />
              <circle cx="100" cy="100" r="82" pathLength={100} strokeDasharray="18 82" transform="rotate(40 100 100)" stroke="#1fa8e0" />
              <circle cx="100" cy="100" r="82" pathLength={100} strokeDasharray="10 90" transform="rotate(130 100 100)" stroke="#3fd29b" />
            </svg>
            <div>
              <Image src={image} alt="" fill priority sizes="(min-width:1024px) 22rem, 40vw" className="object-cover" />
            </div>
          </div>
        )}
      </div>
      <Wave className="ph-wave" />
    </section>
  );
}

/* ---------- Category card ---------- */
export function CategoryCard({ c, i, count, locale }: { c: Category; i: number; count: number; locale: Locale }) {
  const d = getDict(locale);
  const Icon = categoryIcons[c.slug];
  return (
    <Link href={localePath(locale, `/services/${c.slug}`)} className={`care-category t${i % 6}`}>
      <div className="cc-top">
        <span className="cc-icon">
          <Icon strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span className="hx-chip">{fmt(d.cards.programmes, { n: fmtNum(locale, count) })}</span>
      </div>
      <h3>{c.name}</h3>
      <p className="cc-desc">{c.description}</p>
      <span className="cc-cta">
        {d.common.explore} <ArrowRight className="h-4 w-4" />
      </span>
      <Heart className="cc-heart" />
    </Link>
  );
}

/* ---------- Service card ---------- */
export function ServiceCard({ s, i = 0, locale }: { s: Service; i?: number; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/services/${s.category}/${s.slug}`)}
      className={`care-service-card t${i % 6} group flex gap-4 p-3`}
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
    <section className="container-x cta-wrap">
      <div className="care-cta">
        <Hearts preset="soft" />
        <div className="cta-grid">
          <div>
            <p lang={locale} className="cta-eyebrow">
              <Heart className="h-4 w-4" /> {d.cta.eyebrow}
            </p>
            <h2>{d.cta.title}</h2>
            <p className="cta-text">{d.cta.text}</p>
          </div>
          <div className="cta-actions">
            <Link href={localePath(locale, "/appointment")} className="hx-btn hx-btn-sun">
              <CalendarHeart className="h-5 w-5" /> {d.cta.book}
            </Link>
            <a href={telHref(site.phones[0])} className="hx-btn hx-btn-glass">
              <Phone className="h-4 w-4" /> {fmt(d.common.callPhone, { phone: site.phones[0] })}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
