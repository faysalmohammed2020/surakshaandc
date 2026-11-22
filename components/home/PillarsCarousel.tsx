"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomeCopy } from "@/data/home";

/* Each slide gets its own arc palette: [outer-light, main, deep, inner, extra-light] */
const palettes = [
  { main: "#c0128f", arcs: ["#fde0f0", "#16c7d6", "#c0128f", "#6c3fd6", "#a8e8ef"] },
  { main: "#0fa47a", arcs: ["#bfe9da", "#0fa47a", "#1aa0d8", "#d8e65a", "#a8e8ef"] },
  { main: "#f2640f", arcs: ["#ffd2b3", "#f2640f", "#e2321c", "#ffb020", "#a8e8ef"] },
];

/* [radius, dash% of circle, start rotation, stroke width, palette index] */
const arcs: [number, number, number, number, number][] = [
  [186, 17, 200, 22, 0],
  [186, 14, 300, 22, 4],
  [150, 20, 215, 22, 1],
  [150, 9, 20, 22, 0],
  [118, 15, 235, 18, 3],
  [168, 18, 110, 22, 2],
  [168, 10, 160, 6, 3],
];

export function PillarsCarousel({ c }: { c: HomeCopy["pillars"] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = c.items.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(1), 7000);
    return () => clearTimeout(t);
  }, [i, paused, go]);

  return (
    <section
      className="hx-pillars container-x"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <p className="hx-eyebrow hx-pillars-eyebrow">{c.eyebrow}</p>
      <div className="hx-pillars-stage">
        {c.items.map((it, k) => {
          const p = palettes[k % palettes.length];
          const active = k === i;
          return (
            <div
              key={it.title}
              className={`hx-pillar ${active ? "is-active" : ""}`}
              aria-hidden={!active}
              inert={!active}
              role="group"
              aria-roledescription="slide"
              style={{ "--pc": p.main } as React.CSSProperties}
            >
              <div className="hx-pillar-visual">
                <svg viewBox="0 0 400 400" className="hx-arcs" aria-hidden>
                  {arcs.map(([r, dash, rot, w, ci], j) => (
                    <circle
                      key={j}
                      cx="200"
                      cy="200"
                      r={r}
                      fill="none"
                      stroke={p.arcs[ci]}
                      strokeWidth={w}
                      pathLength={100}
                      strokeDasharray={`${dash} ${100 - dash}`}
                      transform={`rotate(${rot} 200 200)`}
                      style={{ animationDelay: `${j * 70}ms` }}
                    />
                  ))}
                </svg>
                <div className="hx-pillar-photo">
                  <Image src={it.image} alt="" fill sizes="(min-width:1024px) 26rem, 70vw" className="object-cover" />
                </div>
              </div>
              <div className="hx-pillar-copy">
                <h2>{it.title}</h2>
                <p>{it.text}</p>
                <ul>
                  {it.points.map((pt) => (
                    <li key={pt}>
                      <span>
                        <Check size={13} strokeWidth={3.5} />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="hx-pillar-actions">
                  <Link href={it.primary.href} className="hx-pill-btn solid">
                    {it.primary.label}
                  </Link>
                  <Link href={it.secondary.href} className="hx-pill-btn ghost">
                    {it.secondary.label}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hx-pillars-nav">
        <button type="button" onClick={() => go(-1)} aria-label={c.prev}>
          <ChevronLeft size={20} />
        </button>
        <div className="hx-pillars-dots">
          {c.items.map((it, k) => (
            <button
              key={it.title}
              type="button"
              aria-label={it.title}
              aria-current={k === i}
              onClick={() => setI(k)}
              style={{ "--pc": palettes[k % palettes.length].main } as React.CSSProperties}
              className={k === i ? "on" : ""}
            >
              {k === i && !paused && <i key={i} />}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label={c.next}>
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
