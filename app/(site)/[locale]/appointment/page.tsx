import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardCheck, Phone, PhoneCall, Smile } from "lucide-react";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHero } from "@/components/sections";
import { getContent } from "@/lib/content";
import { site, telHref } from "@/lib/site";
import { getDict } from "@/i18n";
import { fmtNum, hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

type P = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
};

export async function generateMetadata({ params }: Pick<P, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { ...getDict(locale).meta.appointment, alternates: alternates(locale, "/appointment") };
}

const stepIcons = [ClipboardCheck, PhoneCall, Smile];

export default async function AppointmentPage({ params, searchParams }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const { service } = await searchParams;
  const d = getDict(locale);
  const a = d.appointment;
  const { services, categories } = getContent(locale);

  const opts = services.map((s) => ({
    value: s.slug,
    label: s.title,
    group: categories.find((c) => c.slug === s.category)!.name,
  }));

  return (
    <>
      <PageHero
        title={a.heroTitle}
        eyebrow={a.heroEyebrow}
        sub={a.heroSub}
        crumbs={[{ label: d.common.breadcrumbHome, href: localePath(locale, "/") }, { label: d.common.breadcrumbAppointment }]}
      />
      <section className="container-x mt-14 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2.5rem] bg-white p-6 shadow-soft sm:p-10">
          <EnquiryForm kind="appointment" services={opts} defaultService={service ?? ""} />
        </div>
        <aside className="space-y-6">
          <div className="rounded-[2rem] bg-primary-50 p-7">
            <h2 className="text-2xl font-bold text-ink">{a.next}</h2>
            <ol className="mt-5 space-y-5">
              {a.steps.map(([t, desc], i) => {
                const Icon = stepIcons[i];
                return (
                  <li key={t} className="flex gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-soft">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{fmtNum(locale, i + 1)}. {t}</span>
                      <span className="text-ink-soft">{desc}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="rounded-[2rem] bg-secondary p-7 text-on-secondary">
            <p className="font-display text-2xl font-bold">{a.callTitle}</p>
            <div className="mt-4 space-y-2">
              {site.phones.map((p) => (
                <a key={p} href={telHref(p)} className="flex items-center gap-3 text-lg font-semibold">
                  <Phone className="h-5 w-5" /> {p}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
