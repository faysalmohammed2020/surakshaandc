"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useDict } from "@/i18n/LocaleProvider";

export type GalleryItem = { src: string; alt: string };

export function Gallery({ items }: { items: GalleryItem[] }) {
  const d = useDict().gallery;
  const [i, setI] = useState<number | null>(null);
  const close = useCallback(() => setI(null), []);
  const step = useCallback((d: number) => setI((v) => (v === null ? v : (v + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (i === null) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [i, close, step]);

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {items.map((it, k) => (
          <button
            key={it.src}
            type="button"
            onClick={() => setI(k)}
            className={`group relative block w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-100 to-secondary-100 shadow-soft ${
              ["aspect-[4/5]", "aspect-square", "aspect-[4/3]"][k % 3]
            }`}
          >
            <Image src={it.src} alt={it.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {i !== null && (
        <div role="dialog" aria-modal className="fixed inset-0 z-[70] grid place-items-center bg-ink/90 p-4" onClick={close}>
          <button type="button" aria-label={d.close} onClick={close} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white">
            <X />
          </button>
          <button type="button" aria-label={d.previous} onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white">
            <ChevronLeft />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={items[i].src} alt={items[i].alt} fill sizes="90vw" className="object-contain" />
          </div>
          <button type="button" aria-label={d.next} onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white">
            <ChevronRight />
          </button>
        </div>
      )}
    </>
  );
}
