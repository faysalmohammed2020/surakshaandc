import Link from "next/link";
import { CalendarHeart, Mail, MapPin, Phone } from "lucide-react";
import { site, telHref } from "@/lib/site";
import { getContent } from "@/lib/content";
import { getDict } from "@/i18n";
import { fmt, fmtNum, localePath, type Locale } from "@/i18n/config";
import { Logo } from "./Logo";
import { Heart, Hearts } from "./decor";

export function Footer({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const { categories } = getContent(locale);
  const lp = (h: string) => localePath(locale, h);
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      {/* Curved top edge: two layered arcs in brand colours, then the plum footer. */}
      <svg aria-hidden className="ft-curve" viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path className="ft-curve-a" d="M0 140V70C240 10 480-6 720 14s480 70 720 40v86z" />
        <path className="ft-curve-b" d="M0 140V96C260 40 520 26 760 46s460 60 680 30v64z" />
        <path className="ft-curve-c" d="M0 140v-26c260-50 520-58 760-38s460 56 680 30v34z" />
      </svg>
      <div className="ft-body">
        <Hearts preset="section" />
        <div className="container-x ft-cta">
          <p>
            <Heart className="ft-cta-heart" />
            {d.cta.eyebrow}
          </p>
          <Link href={lp("/appointment")} className="hx-btn hx-btn-sun">
            <CalendarHeart size={18} /> {d.cta.book}
          </Link>
        </div>
        <div className="container-x ft-grid">
          <div>
            <Logo light />
            <p className="ft-desc">{d.site.description}</p>
            <div className="ft-dots" aria-hidden>
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div>
            <h3>{d.footer.services}</h3>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={lp(`/services/${c.slug}`)}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>{d.footer.quickLinks}</h3>
            <ul>
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
                  <Link href={lp(h)}>{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>{d.footer.getInTouch}</h3>
            <ul className="ft-contact">
              <li>
                <span className="ic pink">
                  <MapPin size={16} />
                </span>
                <a href={site.mapLink} target="_blank" rel="noreferrer">
                  {d.site.address}
                </a>
              </li>
              <li>
                <span className="ic sky">
                  <Phone size={16} />
                </span>
                <span>
                  {site.phones.map((p, i) => (
                    <a key={p} href={telHref(p)}>
                      {p}
                      {i < site.phones.length - 1 && <span className="ft-sep">/</span>}
                    </a>
                  ))}
                </span>
              </li>
              <li>
                <span className="ic sun">
                  <Mail size={16} />
                </span>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="ft-bottom">
          <div className="container-x">
            <p>{fmt(d.footer.rights, { year: fmtNum(locale, year), name: d.site.fullName })}</p>
            <p>
              {d.site.location} <Heart className="ft-mini-heart" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
