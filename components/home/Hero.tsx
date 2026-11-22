import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarHeart, HeartHandshake } from "lucide-react";
import type { HomeCopy } from "@/data/home";
import { Hearts, Loop, Rays, Wave } from "@/components/decor";
import { assets } from "@/data/assets";

export function Hero({ c, lp }: { c: HomeCopy["hero"]; lp: (h: string) => string }) {
  return (
    <section className="hx-hero">
      <Hearts preset="hero" />
      <Loop className="hx-hero-loop" />
      <div className="container-x hx-hero-grid">
        <div className="hx-hero-copy">
          <p className="hx-hero-kicker">{c.kicker}</p>
          <h1>
            <span className="hx-mark">{c.titleHi}</span> {c.titleRest}
          </h1>
          <p className="hx-hero-text">{c.text}</p>
          <div className="hx-hero-actions">
            <Link href={lp("/appointment")} className="hx-btn hx-btn-mint">
              <CalendarHeart size={19} /> {c.book}
            </Link>
            <Link href={lp("/services")} className="hx-link-light">
              {c.services} <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="hx-hero-visual">
          <Rays className="hx-hero-rays" />
          <div className="hx-hero-blob">
            <Image
              src={assets.therapistBlocks}
              alt=""
              fill
              priority
              sizes="(min-width:1024px) 50vw, 92vw"
              className="object-cover"
            />
          </div>
          <div className="hx-hero-badge">
            <span>
              <HeartHandshake size={22} />
            </span>
            <div>
              <strong>{c.badgeTop}</strong>
              <small>{c.badgeBottom}</small>
            </div>
          </div>
          <span className="hx-dot hx-dot-a" />
          <span className="hx-dot hx-dot-b" />
        </div>
      </div>
      <Wave className="hx-hero-wave" />
    </section>
  );
}
