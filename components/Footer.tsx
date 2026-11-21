import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { site, telHref } from "@/lib/site";
import { getContent } from "@/lib/content";
import { getDict } from "@/i18n";
import { fmt, fmtNum, localePath, type Locale } from "@/i18n/config";
import { Logo } from "./Logo";

export function Footer({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const { categories } = getContent(locale);
  const lp = (h: string) => localePath(locale, h);
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer relative mt-24 overflow-hidden bg-primary-900 text-white/80">
      <svg aria-hidden className="absolute -top-px left-0 w-full text-surface" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path fill="currentColor" d="M0,0 L1440,0 L1440,20 C1200,60 960,0 720,24 C480,48 240,6 0,32 Z" />
      </svg>
      <div className="container-x grid gap-12 pb-12 pt-24 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm leading-relaxed text-white/70">{d.site.description}</p>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-white">{d.footer.services}</h3>
          <ul className="mt-4 space-y-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={lp(`/services/${c.slug}`)} className="hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-white">{d.footer.quickLinks}</h3>
          <ul className="mt-4 space-y-2.5">
            {[
              [d.footer.aboutUs, "/about"],
              [d.footer.founder, "/about#founder"],
              [d.footer.ourTeam, "/about#team"],
              [d.footer.blog, "/blog"],
              [d.footer.gallery, "/gallery"],
              [d.footer.admission, "/appointment"],
              [d.footer.contactUs, "/contact"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={lp(h)} className="hover:text-accent">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-white">{d.footer.getInTouch}</h3>
          <ul className="mt-4 space-y-4">
            <li className="flex gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" />
              <a href={site.mapLink} target="_blank" rel="noreferrer" className="hover:text-white">
                {d.site.address}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-1 h-4 w-4 shrink-0 text-accent" />
              <span>
                {site.phones.map((p, i) => (
                  <a key={p} href={telHref(p)} className="hover:text-white">
                    {p}
                    {i < site.phones.length - 1 && <span className="px-1.5 text-white/40">/</span>}
                  </a>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-1 h-4 w-4 shrink-0 text-accent" />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-sm text-white/55 sm:flex-row">
          <p>{fmt(d.footer.rights, { year: fmtNum(locale, year), name: d.site.fullName })}</p>
          <p>{d.site.location}</p>
        </div>
      </div>
    </footer>
  );
}
