"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { fmt } from "@/i18n/config";
import { useDict, useLp } from "@/i18n/LocaleProvider";

export function Logo({ light = false }: { light?: boolean }) {
  const d = useDict();
  const lp = useLp();
  return (
    <Link href={lp("/")} className="group flex items-center gap-3" aria-label={fmt(d.logo.homeAria, { name: d.site.name })}>
      <span className="site-logo-mark relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-line">
        <Image src={site.images.logo} alt="" width={48} height={45} className="h-10 w-auto object-contain" priority />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-2xl font-extrabold ${light ? "text-white" : "text-primary-800"}`}>
          {d.site.name}
        </span>
        <span className={`site-logo-sub mt-1 block text-[0.7rem] font-medium tracking-wide ${light ? "text-white/70" : "text-subtle"}`}>
          {d.site.logoSub}
        </span>
      </span>
    </Link>
  );
}
