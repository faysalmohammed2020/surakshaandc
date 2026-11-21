"use client";

import { Phone } from "lucide-react";
import { fmt } from "@/i18n/config";
import { useDict } from "@/i18n/LocaleProvider";

export function FloatingContact({ phone }: { phone: string }) {
  const d = useDict();
  return (
    <a
      href={`tel:+88${phone.replace(/\D/g, "")}`}
      aria-label={fmt(d.common.callPhone, { phone })}
      className="fixed bottom-24 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary shadow-lift transition hover:scale-105 md:hidden"
    >
      <Phone className="relative h-6 w-6" />
    </a>
  );
}
