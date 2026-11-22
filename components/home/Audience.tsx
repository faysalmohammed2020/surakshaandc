import Image from "next/image";
import Link from "next/link";
import { Award, HandHeart, Puzzle, UsersRound } from "lucide-react";
import type { HomeCopy } from "@/data/home";
import { Heart } from "@/components/decor";
import type { Locale } from "@/i18n/config";
import { CountUp } from "./CountUp";

const statIcons = [Puzzle, HandHeart, UsersRound, Award];

export function Audience({
  c,
  values,
  locale,
  lp,
}: {
  c: HomeCopy["audience"];
  values: number[];
  locale: Locale;
  lp: (h: string) => string;
}) {
  return (
    <section className="hx-aud">
      <div className="container-x">
        <div className="hx-head hx-head-center">
          <p className="hx-eyebrow">{c.eyebrow}</p>
          <h2>{c.title}</h2>
        </div>
        <div className="hx-aud-cards">
          {c.cards.map((card, i) => (
            <Link key={card.title} href={lp(card.href)} className="hx-aud-card" data-reveal>
              <div className="hx-aud-img">
                <Image src={card.image} alt="" fill sizes="(min-width:768px) 30vw, 90vw" className="object-cover" />
              </div>
              <p>
                <Heart className={`hx-aud-heart t${i}`} />
                {card.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
      <div className="hx-aud-panel">
        <div className="container-x hx-stats">
          {c.stats.map((label, i) => {
            const Icon = statIcons[i];
            return (
              <div key={label} className="hx-stat">
                <Icon strokeWidth={1.5} />
                <div>
                  <strong>
                    <CountUp to={values[i]} locale={locale} suffix={i === 3 ? "+" : ""} duration={1600 + i * 250} />
                  </strong>
                  <span className="hx-stat-label">{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
