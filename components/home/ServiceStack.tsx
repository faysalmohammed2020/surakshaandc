"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { categoryIcons } from "@/components/ui";
import { Hearts } from "@/components/decor";

export type StackItem = {
  slug: string;
  name: string;
  alt: string;
  description: string;
  image: string;
  href: string;
  services: string[];
  count: string;
  num: string;
};

/**
 * Pinned, scroll-driven carousel: the section sticks to the viewport while the page scrolls
 * through it. One card sits full in the middle with neighbours half-visible on each side;
 * each scroll step slides the row one card to the right (the next card enters from the left).
 * After the last card the page simply continues to the next section.
 */
export function ServiceStack({
  items,
  copy,
}: {
  items: StackItem[];
  copy: { eyebrow: string; title: string; sub: string; explore: string; includes: string };
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }
    const n = items.length;
    let target = 0;
    let current = 0;
    let raf = 0;
    let lastActive = -1;

    const readTarget = () => {
      const r = section.getBoundingClientRect();
      const sticky = section.firstElementChild as HTMLElement;
      const travel = r.height - sticky.offsetHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      target = progress * (n - 1);
    };

    const paint = () => {
      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        const o = current - i; // 0 = centred, >0 = moved right, <0 = waiting on the left
        el.style.setProperty("--o", o.toFixed(4));
        el.style.zIndex = String(100 - Math.round(Math.abs(o) * 10));
        el.setAttribute("aria-hidden", Math.abs(o) > 0.5 ? "true" : "false");
        el.tabIndex = Math.abs(o) > 0.5 ? -1 : 0;
      });
      const active = Math.round(current);
      if (active !== lastActive) {
        lastActive = active;
        dotsRef.current.forEach((d, i) => d?.classList.toggle("on", i === active));
        if (counterRef.current) counterRef.current.textContent = String(active + 1).padStart(2, "0");
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${n > 1 ? current / (n - 1) : 1})`;
    };

    const tick = () => {
      const diff = target - current;
      current = Math.abs(diff) < 0.0008 ? target : current + diff * 0.1;
      paint();
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      readTarget();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    readTarget();
    current = target;
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  const jump = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const sticky = section.firstElementChild as HTMLElement;
    const travel = section.offsetHeight - sticky.offsetHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (travel * i) / (items.length - 1) + 2, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="hx-stack" style={{ "--n": items.length } as React.CSSProperties}>
      <div className="hx-stack-sticky">
        <Hearts preset="soft" />
        <div className="container-x hx-stack-head">
          <div>
            <p className="hx-eyebrow">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
          </div>
          <div className="hx-stack-meta">
            <p>{copy.sub}</p>
            <div className="hx-stack-counter">
              <span ref={counterRef}>01</span>
              <i>
                <span ref={barRef} />
              </i>
              <span>{String(items.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        <div className="hx-stack-track">
          {items.map((it, i) => {
            const Icon = categoryIcons[it.slug];
            return (
              <article
                key={it.slug}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className={`hx-scard t${i % 6}`}
                style={{ "--o": -i } as React.CSSProperties}
              >
                <div className="hx-scard-img">
                  <Image src={it.image} alt="" fill sizes="(min-width:1024px) 28vw, 80vw" className="object-cover" />
                  <span className="hx-scard-num">{it.num}</span>
                </div>
                <div className="hx-scard-body">
                  <div className="hx-scard-top">
                    <span className="hx-scard-icon">{Icon && <Icon size={24} strokeWidth={1.8} />}</span>
                    <span className="hx-chip">{it.count}</span>
                  </div>
                  <p className="hx-scard-alt">{it.alt}</p>
                  <h3>{it.name}</h3>
                  <p className="hx-scard-desc">{it.description}</p>
                  <p className="hx-scard-inc">{copy.includes}</p>
                  <ul>
                    {it.services.slice(0, 4).map((s) => (
                      <li key={s}>
                        <Check size={15} strokeWidth={3} /> {s}
                      </li>
                    ))}
                  </ul>
                  <Link href={it.href} className="hx-scard-cta">
                    {copy.explore} <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hx-stack-dots">
          {items.map((it, i) => (
            <button
              key={it.slug}
              type="button"
              aria-label={it.name}
              onClick={() => jump(i)}
              className={`t${i % 6}`}
            >
              <span
                ref={(el) => {
                  dotsRef.current[i] = el;
                }}
                className={i === 0 ? "on" : ""}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
