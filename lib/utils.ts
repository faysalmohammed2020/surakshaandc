import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL slug from a title. Keeps Bangla (and any Unicode) letters; falls back to a timestamp. */
export function generateSlug(title: string): string {
  const slug = title
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || `post-${Date.now()}`;
}
