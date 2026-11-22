import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { assets } from "@/data/assets";
import { Mail, MapPin, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHero } from "@/components/sections";
import { site, telHref } from "@/lib/site";
import { getDict } from "@/i18n";
import { fmt, hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDict(locale);
  return {
    title: d.meta.contact.title,
    description: fmt(d.meta.contact.description, { address: d.site.address, phones: site.phones.join(" / ") }),
    alternates: alternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const c = d.contact;

  const cards = [
    { icon: MapPin, t: c.visit, body: <a href={site.mapLink} target="_blank" rel="noreferrer">{d.site.address}</a> },
    {
      icon: Phone,
      t: c.call,
      body: (
        <span className="flex flex-col">
          {site.phones.map((p) => (
            <a key={p} href={telHref(p)} className="hover:text-primary-700">{p}</a>
          ))}
        </span>
      ),
    },
    { icon: Mail, t: c.email, body: <a href={`mailto:${site.email}`} className="hover:text-primary-700">{site.email}</a> },
  ];
  return (
    <>
      <PageHero
        title={c.heroTitle}
        eyebrow={c.heroEyebrow}
        sub={c.heroSub}
        image={assets.frontDesk}
        crumbs={[{ label: d.common.breadcrumbHome, href: localePath(locale, "/") }, { label: d.common.breadcrumbContact }]}
      />
      <section className="container-x mt-14 grid gap-5 md:grid-cols-3">
        {cards.map((card, i) => (
          <div key={card.t} className="rounded-[2rem] bg-white p-7 shadow-soft">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${["bg-primary text-on-primary", "bg-secondary text-on-secondary", "bg-accent text-on-accent"][i]}`}>
              <card.icon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-ink">{card.t}</h2>
            <div className="mt-2 text-lg text-ink-soft">{card.body}</div>
          </div>
        ))}
      </section>
      <section className="container-x mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2.5rem] bg-white p-6 shadow-soft sm:p-10">
          <div className="relative mb-7 aspect-[16/7] overflow-hidden rounded-[1.6rem]">
            <Image src={assets.reception} alt="" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
          </div>
          <h2 className="text-3xl font-bold text-ink">{c.sendTitle}</h2>
          <p className="mb-8 mt-2 text-ink-soft">{c.sendSub}</p>
          <EnquiryForm kind="contact" />
        </div>
        <iframe
          title={d.home.mapTitle}
          src={site.mapEmbed}
          className="min-h-[28rem] w-full rounded-[2.5rem] border-0 shadow-soft"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}
