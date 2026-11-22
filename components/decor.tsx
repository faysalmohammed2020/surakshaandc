/* Decorative SVG pieces shared across the public site. All are aria-hidden. */

export const HEART_PATH =
  "M12 21.2s-7.6-4.7-9.7-9.4C.8 8.4 2.7 4.4 6.5 4.4c2.1 0 3.8 1.2 4.7 2.8.9-1.6 2.6-2.8 4.7-2.8 3.8 0 5.7 4 4.2 7.4-2.1 4.7-9.6 9.4-9.6 9.4z";

export function Heart({ className = "", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path
        d={HEART_PATH}
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HeartSpec = { x: string; y: string; s: number; r: number; c: string; o?: boolean };

const presets: Record<string, HeartSpec[]> = {
  hero: [
    { x: "4%", y: "14%", s: 5, r: -14, c: "var(--c-pink)", o: true },
    { x: "44%", y: "8%", s: 2.2, r: 10, c: "var(--c-sun)" },
    { x: "40%", y: "82%", s: 3.4, r: -8, c: "var(--c-sky)", o: true },
    { x: "92%", y: "86%", s: 2.4, r: 16, c: "var(--c-pink)" },
  ],
  section: [
    { x: "3%", y: "10%", s: 6, r: -12, c: "var(--c-purple)", o: true },
    { x: "92%", y: "16%", s: 3, r: 14, c: "var(--c-pink)" },
    { x: "88%", y: "78%", s: 7, r: 8, c: "var(--c-sky)", o: true },
    { x: "8%", y: "84%", s: 2.4, r: -6, c: "var(--c-sun)" },
  ],
  soft: [
    { x: "6%", y: "20%", s: 4, r: -12, c: "var(--c-pink)", o: true },
    { x: "90%", y: "62%", s: 5, r: 12, c: "var(--c-purple)", o: true },
  ],
};

/** Scattered "love" watermark hearts. Parent must be position: relative. */
export function Hearts({ preset = "section", className = "" }: { preset?: keyof typeof presets; className?: string }) {
  return (
    <div aria-hidden className={`hearts-layer ${className}`}>
      {presets[preset].map((h, i) => (
        <span
          key={i}
          style={{ left: h.x, top: h.y, width: `${h.s}rem`, color: h.c, rotate: `${h.r}deg`, animationDelay: `${i * -2.3}s` }}
        >
          <Heart filled={!h.o} className="h-auto w-full" />
        </span>
      ))}
    </div>
  );
}

/** Hand-painted brush stroke used under headings (Kelberman-style). */
export function Brush({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 14" preserveAspectRatio="none" className={className}>
      <path
        fill="currentColor"
        d="M3 9.5C14 5.4 30 4.2 47 3.8c18-.4 37 .2 56 1.8 6 .5 13 1.4 14 3.2.6 1.2-2.2 2.1-6 2.3-17 .8-35-.6-52-.4-17 .2-34 1.6-50 2.2-4 .1-7-.6-6-3.4z"
      />
    </svg>
  );
}

/** Wavy edge. `flip` turns it into a top edge. */
export function Wave({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        fill="currentColor"
        d="M0 46C120 18 260 6 420 26s300 58 470 50 300-60 420-58c60 1 100 8 130 16V90H0z"
      />
    </svg>
  );
}

/** Sun-ray sparkle doodle (hero reference). */
export function Rays({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 80 50" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
      <path d="M8 46 20 38M14 22l16 8M34 4l4 18M58 6l-6 18M76 26l-16 8" />
    </svg>
  );
}

/** Loopy scribble doodle (hero reference). */
export function Loop({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round">
      <path d="M10 112c8-30 20-58 42-74 18-13 40-12 44 4 5 18-18 34-36 30-17-4-16-26 2-38 20-13 46-8 52 14" />
    </svg>
  );
}
