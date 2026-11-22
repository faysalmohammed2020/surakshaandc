"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { categoryIcons } from "@/components/ui";
import { Hearts } from "@/components/decor";

export type StackItem = {
  slug: string;
  name: string;
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
 * On phones (< 768px) there is no pinning: the same row becomes a swipe slider.
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

  // Phones get a swipe slider; larger screens keep the scroll-pinned version.
  const [swipe, setSwipe] = useState(false);
  const goTo = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setSwipe(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }
    section.classList.toggle("is-swipe", swipe);
    const n = items.length;
    let target = 0;
    let current = 0;
    let raf = 0;
    let lastActive = -1;
    const clamp = (v: number) => Math.min(n - 1, Math.max(0, v));
    // Desktop: the next card waits on the LEFT and the row slides right as you scroll.
    // Phones: the next card waits on the RIGHT, so swiping left brings it in (natural swipe).
    const dir = swipe ? -1 : 1;

    const paint = () => {
      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        const o = dir * (current - i); // 0 = centred; sign says which side the card waits on
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
      current = Math.abs(diff) < 0.0008 ? target : current + diff * (swipe ? 0.16 : 0.1);
      paint();
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const run = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* ---------- Phones: swipe / drag the row ---------- */
    if (swipe) {
      const track = section.querySelector<HTMLElement>(".hx-stack-track");
      if (!track) return;
      // One card width + gap in px = how far a finger travels to change one card.
      const step = () => (cardsRef.current[0]?.offsetWidth ?? 300) + 16;
      let startX = 0;
      let startY = 0;
      let startCur = 0;
      let dragging = false;
      let decided = false;
      let moved = false;
      let lastX = 0;
      let lastT = 0;
      let vel = 0;

      const down = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        startX = lastX = e.clientX;
        startY = e.clientY;
        startCur = current;
        lastT = performance.now();
        vel = 0;
        dragging = true;
        decided = false;
        moved = false;
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!decided) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          decided = true;
          // Mostly vertical: it's a page scroll, not a swipe.
          if (Math.abs(dy) > Math.abs(dx)) {
            dragging = false;
            return;
          }
          track.setPointerCapture(e.pointerId);
        }
        moved = true;
        const now = performance.now();
        // Positive velocity = moving towards the NEXT card (finger going left).
        vel = (lastX - e.clientX) / Math.max(1, now - lastT);
        lastX = e.clientX;
        lastT = now;
        // Cards follow the finger, with a little resistance past the first/last card.
        let v = startCur - dx / step();
        if (v < 0) v /= 3;
        if (v > n - 1) v = n - 1 + (v - (n - 1)) / 3;
        current = target = v;
        cancelAnimationFrame(raf);
        raf = 0;
        paint();
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        if (!moved) return;
        // A quick flick changes one card even if the finger travelled only a little.
        const flick = Math.abs(vel) > 0.35 ? Math.sign(vel) : 0;
        const next = flick > 0 ? Math.floor(startCur) + 1 : flick < 0 ? Math.ceil(startCur) - 1 : Math.round(current);
        target = clamp(next);
        run();
      };
      // A drag must not also open the card's link.
      const click = (e: MouseEvent) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      };

      goTo.current = (i) => {
        target = clamp(i);
        run();
      };
      paint();
      track.addEventListener("pointerdown", down);
      track.addEventListener("pointermove", move);
      track.addEventListener("pointerup", up);
      track.addEventListener("pointercancel", up);
      track.addEventListener("click", click, true);
      return () => {
        cancelAnimationFrame(raf);
        track.removeEventListener("pointerdown", down);
        track.removeEventListener("pointermove", move);
        track.removeEventListener("pointerup", up);
        track.removeEventListener("pointercancel", up);
        track.removeEventListener("click", click, true);
        section.classList.remove("is-swipe");
      };
    }

    /* ---------- Larger screens: pinned, scroll-driven ---------- */
    const readTarget = () => {
      const r = section.getBoundingClientRect();
      const sticky = section.firstElementChild as HTMLElement;
      const travel = r.height - sticky.offsetHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      target = progress * (n - 1);
    };
    const onScroll = () => {
      readTarget();
      run();
    };
    goTo.current = (i) => {
      const sticky = section.firstElementChild as HTMLElement;
      const travel = section.offsetHeight - sticky.offsetHeight;
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (travel * i) / (n - 1) + 2, behavior: "smooth" });
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
  }, [items.length, swipe]);

  const jump = (i: number) => goTo.current(i);

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
