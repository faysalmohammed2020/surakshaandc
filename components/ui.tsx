import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import {
  Baby,
  MessageCircleHeart,
  Puzzle,
  Sparkles,
  HeartHandshake,
  Hand,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  "early-intervention": Baby,
  "speech-language-therapy": MessageCircleHeart,
  "behaviour-therapy": Puzzle,
  "sensory-integration": Sparkles,
  "parent-guidance-counseling": HeartHandshake,
  "occupational-therapy": Hand,
};

/** Cycles brand colors so cards feel playful but stay on-palette */
export const tones = [
  { bg: "bg-primary-50", icon: "bg-primary text-on-primary", ring: "hover:border-primary-300" },
  { bg: "bg-secondary-50", icon: "bg-secondary text-on-secondary", ring: "hover:border-secondary-300" },
  { bg: "bg-accent-50", icon: "bg-accent text-on-accent", ring: "hover:border-accent" },
];

type BtnProps = {
  href: string;
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "light";
  size?: "md" | "lg";
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href">;

export function Button({ href, variant = "primary", size = "md", className = "", children, ...rest }: BtnProps) {
  const v = {
    primary: "bg-primary text-on-primary hover:bg-primary-700 shadow-soft",
    secondary: "bg-secondary text-on-secondary hover:bg-secondary-600 shadow-soft",
    accent: "bg-accent text-on-accent hover:bg-accent-600",
    outline: "border-2 border-primary-200 text-primary-700 hover:border-primary hover:bg-primary-50",
    ghost: "text-primary-700 hover:bg-primary-50",
    light: "bg-white text-primary-800 hover:bg-primary-50 shadow-soft",
  }[variant];
  const s = size === "lg" ? "h-13 px-7 text-base" : "h-11 px-5 text-[0.95rem]";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 ${v} ${s} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      {eyebrow && (
        <p lang={/[\u0980-\u09FF]/.test(eyebrow) ? "bn" : undefined} className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl md:text-[2.75rem]">{title}</h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{sub}</p>}
    </div>
  );
}

/** Image wrapper with a soft branded placeholder behind it */
export function ImgFrame({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function Blob({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={className}>
      <path
        fill="currentColor"
        d="M47.1,-57.6C59.9,-45.6,68.1,-29.2,71.7,-11.6C75.3,6,74.3,24.8,65.3,38.7C56.3,52.6,39.3,61.6,21.4,67.4C3.5,73.2,-15.3,75.8,-31.6,69.7C-47.9,63.6,-61.7,48.8,-69.2,31.5C-76.7,14.2,-77.9,-5.6,-71.4,-22.1C-64.9,-38.6,-50.7,-51.8,-35.6,-63.2C-20.5,-74.6,-4.4,-84.2,10.4,-82.3C25.2,-80.4,34.3,-69.6,47.1,-57.6Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}
