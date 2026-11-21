"use client";

import { Blob, Button } from "@/components/ui";
import { useDict, useLp } from "@/i18n/LocaleProvider";

export default function NotFound() {
  const d = useDict().notFound;
  const lp = useLp();
  return (
    <section className="container-x relative grid min-h-[60vh] place-items-center py-20 text-center">
      <Blob className="absolute h-96 w-96 text-primary-50" />
      <div className="relative">
        <p className="font-display text-8xl font-extrabold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{d.title}</h1>
        <p className="mt-3 text-ink-soft">{d.text}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href={lp("/")}>{d.home}</Button>
          <Button href={lp("/services")} variant="outline">{d.services}</Button>
        </div>
      </div>
    </section>
  );
}
