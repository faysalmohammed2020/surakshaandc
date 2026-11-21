"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Mail, MapPin, Menu, Phone, X, CalendarHeart } from "lucide-react";
import { Logo } from "./Logo";
import { categoryIcons } from "./ui";
import { localePath, stripLocale, defaultLocale, locales } from "@/i18n/config";
import { useDict, useLocale, useLp } from "@/i18n/LocaleProvider";

export type MenuCat = { slug: string; name: string; services: { slug: string; title: string }[] };

type Props = {
  nav: { label: string; href: string; mega?: boolean }[];
  menu: MenuCat[];
  phones: string[];
  email: string;
  address: string;
};

/** Switches between /… and /bn/… keeping the current page. */
function LangSwitch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const locale = useLocale();
  const d = useDict();
  const other = locales.find((l) => l !== locale) ?? defaultLocale;
  return (
    <Link
      href={localePath(other, stripLocale(pathname))}
      hrefLang={other}
      lang={other}
      prefetch={false}
      aria-label={d.header.switchTo}
      className={`inline-flex h-11 items-center rounded-full border-2 border-primary-200 px-4 font-semibold text-primary-700 transition hover:border-primary hover:bg-primary-50 ${className}`}
    >
      {d.header.otherLang}
    </Link>
  );
}

export function Header({ nav, menu, phones, email, address }: Props) {
  const rawPath = usePathname();
  const pathname = stripLocale(rawPath);
  const d = useDict();
  const lp = useLp();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const tel = (p: string) => `tel:+88${p.replace(/\D/g, "")}`;

  return (
    <>
      {/* Top bar */}
      <div className="hidden bg-primary-900 text-[0.82rem] text-white/85 md:block">
        <div className="container-x flex h-10 items-center justify-between gap-6">
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-accent" /> {address}
          </span>
          <div className="flex items-center gap-6">
            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white">
              <Mail className="h-3.5 w-3.5 text-accent" /> {email}
            </a>
            {phones.map((p) => (
              <a key={p} href={tel(p)} className="flex items-center gap-2 hover:text-white">
                <Phone className="h-3.5 w-3.5 text-accent" /> {p}
              </a>
            ))}
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 shadow-soft backdrop-blur-md" : "bg-surface"
        }`}
        onMouseLeave={() => setMega(false)}
      >
        <div className="container-x flex h-20 items-center justify-between gap-6">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label={d.header.mainNav}>
            {nav.map((n) =>
              n.mega ? (
                <div key={n.href} onMouseEnter={() => setMega(true)}>
                  <button
                    type="button"
                    onClick={() => setMega((v) => !v)}
                    aria-expanded={mega}
                    className={`flex items-center gap-1 rounded-full px-4 py-2 font-semibold transition-colors ${
                      isActive(n.href) ? "text-primary-700" : "text-ink hover:text-primary-700"
                    }`}
                  >
                    {n.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${mega ? "rotate-180" : ""}`} />
                  </button>
                </div>
              ) : (
                <Link
                  key={n.href}
                  href={lp(n.href)}
                  onMouseEnter={() => setMega(false)}
                  className={`relative rounded-full px-4 py-2 font-semibold transition-colors ${
                    isActive(n.href) ? "text-primary-700" : "text-ink hover:text-primary-700"
                  }`}
                >
                  {n.label}
                  {isActive(n.href) && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-1 rounded-full bg-accent" />
                  )}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2">
            <LangSwitch />
            <Link
              href={lp("/appointment")}
              className="hidden h-11 items-center gap-2 rounded-full bg-secondary px-5 font-semibold text-on-secondary shadow-soft transition hover:-translate-y-0.5 hover:bg-secondary-600 sm:inline-flex"
            >
              <CalendarHeart className="h-4.5 w-4.5" /> {d.common.bookAppointment}
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 text-primary-800 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label={d.header.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <div
          className={`absolute inset-x-0 top-full hidden origin-top transition-all duration-200 lg:block ${
            mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          <div className="container-x">
            <div className="grid grid-cols-3 gap-2 rounded-[1.75rem] border border-line bg-white p-4 shadow-lift">
              {menu.map((c) => {
                const Icon = categoryIcons[c.slug];
                return (
                  <div key={c.slug} className="rounded-2xl p-4 transition-colors hover:bg-primary-50">
                    <Link href={lp(`/services/${c.slug}`)} className="flex items-center gap-3 font-display text-lg font-bold text-ink hover:text-primary-700">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-100 text-primary-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      {c.name}
                    </Link>
                    <ul className="mt-2 space-y-1 pl-12">
                      {c.services.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={lp(`/services/${c.slug}/${s.slug}`)}
                            className="block text-[0.92rem] leading-snug text-ink-soft hover:text-primary-700"
                          >
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-surface shadow-lift transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line p-5">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary-800"
              aria-label={d.header.closeMenu}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-5" aria-label={d.header.mobileNav}>
            {nav.map((n) =>
              n.mega ? (
                <div key={n.href} className="border-b border-line py-1">
                  <Link href={lp(n.href)} className="block py-3 text-lg font-semibold">
                    {n.label}
                  </Link>
                  {menu.map((c) => (
                    <div key={c.slug} className="pl-3">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-2.5 text-left font-medium text-ink-soft"
                        onClick={() => setOpenCat(openCat === c.slug ? null : c.slug)}
                        aria-expanded={openCat === c.slug}
                      >
                        {c.name}
                        <ChevronDown className={`h-4 w-4 transition-transform ${openCat === c.slug ? "rotate-180" : ""}`} />
                      </button>
                      {openCat === c.slug && (
                        <ul className="mb-2 space-y-1 border-l-2 border-primary-100 pl-4">
                          <li>
                            <Link href={lp(`/services/${c.slug}`)} className="block py-1.5 text-sm font-semibold text-primary-700">
                              {d.common.overview}
                            </Link>
                          </li>
                          {c.services.map((s) => (
                            <li key={s.slug}>
                              <Link href={lp(`/services/${c.slug}/${s.slug}`)} className="block py-1.5 text-sm text-ink-soft">
                                {s.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Link key={n.href} href={lp(n.href)} className="block border-b border-line py-3 text-lg font-semibold">
                  {n.label}
                </Link>
              )
            )}
          </nav>
          <div className="space-y-3 border-t border-line p-5">
            <Link
              href={lp("/appointment")}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-secondary font-semibold text-on-secondary"
            >
              <CalendarHeart className="h-5 w-5" /> {d.common.bookAppointment}
            </Link>
            <a
              href={tel(phones[0])}
              className="flex h-12 items-center justify-center gap-2 rounded-full border-2 border-primary-200 font-semibold text-primary-700"
            >
              <Phone className="h-4 w-4" /> {phones[0]}
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
