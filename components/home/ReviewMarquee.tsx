import { Quote, Star } from "lucide-react";
import type { HomeCopy } from "@/data/home";
import { Heart } from "@/components/decor";

function Row({ items, reverse }: { items: HomeCopy["reviews"]["items"]; reverse?: boolean }) {
  // Content is duplicated so the loop is seamless; the copy is hidden from screen readers.
  return (
    <div className={`hx-marquee ${reverse ? "rev" : ""}`}>
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1 || undefined}>
          {items.map((r, i) => (
            <li key={r.name} className={`hx-review t${i % 6}`}>
              <div className="hx-review-top">
                <span className="hx-review-stars" aria-hidden>
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star key={s} size={15} fill="currentColor" strokeWidth={0} />
                  ))}
                </span>
                <Quote size={26} className="hx-review-q" aria-hidden />
              </div>
              <p>{r.text}</p>
              <strong>
                <Heart className="hx-review-heart" /> {r.name}
              </strong>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function ReviewMarquee({ c }: { c: HomeCopy["reviews"] }) {
  const half = Math.ceil(c.items.length / 2);
  return (
    <section className="hx-reviews">
      <div className="container-x hx-head hx-head-center">
        <p className="hx-eyebrow">{c.eyebrow}</p>
        <h2>{c.title}</h2>
      </div>
      <Row items={c.items.slice(0, half).concat(c.items.slice(half))} />
      <Row items={c.items.slice(half).concat(c.items.slice(0, half))} reverse />
    </section>
  );
}
