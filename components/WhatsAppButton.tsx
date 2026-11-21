"use client";

import { useDict } from "@/i18n/LocaleProvider";

/** Floating WhatsApp button above the live-chat launcher on the right. */
export function WhatsAppButton({ number }: { number: string }) {
  const d = useDict().whatsapp;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(d.message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={d.label}
      title={d.label}
      className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition duration-200 hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30 focus-visible:ring-offset-2 motion-reduce:transform-none"
    >
      <svg viewBox="0 0 32 32" className="relative h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M16.02 3C8.84 3 3.02 8.8 3.02 15.95c0 2.29.6 4.52 1.74 6.49L3 29l6.75-1.74a13 13 0 0 0 6.27 1.6h.01c7.17 0 13-5.8 13-12.95C29.03 8.8 23.2 3 16.02 3Zm0 23.65h-.01a10.7 10.7 0 0 1-5.45-1.49l-.39-.23-4.01 1.03 1.07-3.9-.25-.4a10.6 10.6 0 0 1-1.63-5.7c0-5.9 4.82-10.7 10.74-10.7 2.87 0 5.56 1.11 7.59 3.13a10.6 10.6 0 0 1 3.14 7.58c0 5.9-4.82 10.68-10.8 10.68Zm5.9-8c-.32-.16-1.9-.94-2.2-1.04-.29-.11-.5-.16-.72.16-.21.32-.83 1.04-1.02 1.26-.19.21-.37.24-.7.08-.32-.16-1.36-.5-2.59-1.6a9.7 9.7 0 0 1-1.8-2.23c-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.54.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.99-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.67s1.15 3.1 1.31 3.32c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.82.68.77.24 1.46.21 2.01.13.61-.09 1.9-.78 2.16-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
