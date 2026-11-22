import Link from "next/link";
import { CalendarHeart, Phone } from "lucide-react";
import type { HomeCopy } from "@/data/home";
import { site, telHref } from "@/lib/site";
import { Brush, Heart } from "@/components/decor";

export function BookSection({ c, lp }: { c: HomeCopy["book"]; lp: (h: string) => string }) {
  return (
    <section className="hx-book container-x" id="book">
      <div className="hx-book-head">
        <p className="hx-book-eyebrow">{c.eyebrow}</p>
        <h2>{c.title}</h2>
        <p>{c.text}</p>
      </div>
      <div className="hx-book-grid">
        <div className="hx-book-col">
          <h3>{c.onlineTitle}</h3>
          <Brush className="hx-brush purple" />
          <p>{c.onlineText}</p>
          <Link href={lp("/appointment")} className="hx-btn hx-btn-purple">
            <CalendarHeart size={18} /> {c.onlineCta}
          </Link>
        </div>
        <div className="hx-book-hearts" aria-hidden>
          <Heart className="h1" />
          <Heart className="h2" />
          <Heart className="h3" />
        </div>
        <div className="hx-book-col">
          <h3>{c.callTitle}</h3>
          <Brush className="hx-brush sky" />
          <p>{c.callText}</p>
          <div className="hx-book-phones">
            {site.phones.map((p) => (
              <a key={p} href={telHref(p)} className="hx-btn hx-btn-sky">
                <Phone size={17} /> {p}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
