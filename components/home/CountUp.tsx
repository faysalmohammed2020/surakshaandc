"use client";

import { useEffect, useRef, useState } from "react";
import { fmtNum, type Locale } from "@/i18n/config";

/**
 * Counts from 0 up to `to` the first time it scrolls into view.
 * The server renders the final number, so it is correct without JavaScript and for SEO.
 */
export function CountUp({
  to,
  locale,
  suffix = "",
  duration = 1800,
}: {
  to: number;
  locale: Locale;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already scrolled past it (e.g. restored scroll position): keep the final number.
    if (el.getBoundingClientRect().bottom < 0) return;

    setValue(0);
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out: fast start, gentle landing
          setValue(Math.round(eased * to));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className="hx-count" aria-label={`${fmtNum(locale, to)}${suffix}`}>
      <span aria-hidden>
        {fmtNum(locale, value)}
        {suffix}
      </span>
    </span>
  );
}
