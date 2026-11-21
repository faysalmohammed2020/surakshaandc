import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Building2, CheckCircle2, Eye, GraduationCap, Quote } from "lucide-react";
import { CtaBand, PageHero } from "@/components/sections";
import { ImgFrame, SectionHeading } from "@/components/ui";
import { bilingual, facilities, site, teamRoles, therapies } from "@/lib/site";
import { getDict } from "@/i18n";
import { fmt, fmtNum, hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { ...getDict(locale).meta.about, alternates: alternates(locale, "/about") };
}

export default async function AboutPage({ params }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const a = d.about;
  const alt = locale === "en" ? "bn" : "en";

  const list = (items: { en: string; bn: string }[]) =>
    items.map((f) => {
      const [primary, secondary] = bilingual(f, locale);
      return (
        <li key={f.en} className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span>
            <span className="font-semibold text-ink">{primary}</span>
            <span lang={alt} className="text-subtle"> · {secondary}</span>
          </span>
        </li>
      );
    });

  return (
    <>
      <PageHero
        title={a.heroTitle}
        eyebrow={a.heroEyebrow}
        sub={a.heroSub}
        crumbs={[{ label: d.common.breadcrumbHome, href: localePath(locale, "/") }, { label: d.common.breadcrumbAbout }]}
      />

      {/* Story */}
      <section className="container-x mt-20 grid gap-14 lg:grid-cols-[1fr_1.15fr]">
        <div className="relative">
          <ImgFrame className="aspect-[4/5] rounded-[2.5rem] shadow-lift lg:sticky lg:top-28">
            <Image src={site.images.about} alt={a.imgAlt} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
          </ImgFrame>
        </div>
        <div>
          <SectionHeading align="left" eyebrow={a.storyEyebrow} title={<span lang="bn">{site.fullNameBn}</span>} />
          <div className="mt-6 space-y-5 text-[1.07rem] leading-[1.9] text-ink-soft">
            {a.story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div id="founder" className="mt-10 scroll-mt-28 rounded-[2rem] bg-primary-50 p-7">
            <Quote className="h-8 w-8 text-secondary" />
            <p lang="bn" className="mt-3 font-display text-2xl font-bold text-ink">{site.founder.nameBn}</p>
            <p className="font-semibold text-primary-700">{site.founder.name}</p>
            <p className="mt-1 text-ink-soft">
              {fmt(a.founderLine, { role: d.site.founderRole, n: fmtNum(locale, site.founder.years) })}
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="container-x mt-28 scroll-mt-28">
        <SectionHeading eyebrow={a.teamEyebrow} title={a.teamTitle} sub={a.teamSub} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamRoles.map((r, i) => {
            const [primary, secondary] = bilingual(r, locale);
            return (
              <div key={r.en} className="flex items-center gap-4 rounded-3xl border-2 border-line bg-white p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-100 font-display text-lg font-extrabold text-primary-700">
                  {fmtNum(locale, i + 1).padStart(2, locale === "bn" ? "০" : "0")}
                </span>
                <span>
                  <span className="block text-lg font-semibold text-ink">{primary}</span>
                  <span lang={alt} className="text-sm text-subtle">{secondary}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Facilities & therapies */}
      <section className="container-x mt-28 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-soft md:p-10">
          <Building2 className="h-9 w-9 text-secondary" />
          <h2 className="mt-4 text-3xl font-bold text-ink">{a.facilitiesTitle}</h2>
          <p lang="bn" className="mt-2 text-ink-soft">{a.facilitiesSub}</p>
          <ul className="mt-6 space-y-3">{list(facilities)}</ul>
        </div>
        <div className="rounded-[2.5rem] bg-white p-8 shadow-soft md:p-10">
          <GraduationCap className="h-9 w-9 text-secondary" />
          <h2 className="mt-4 text-3xl font-bold text-ink">{a.therapyTitle}</h2>
          <p lang={alt} className="mt-2 text-ink-soft">{a.therapySub}</p>
          <ul className="mt-6 space-y-3">{list(therapies)}</ul>
        </div>
      </section>

      {/* Vision */}
      <section className="mt-28 bg-primary-900 py-20 text-white">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eye className="h-10 w-10 text-accent" />
            <p lang="bn" className="eyebrow mt-4 !text-accent">{a.visionEyebrow}</p>
            <h2 className="mt-3 text-4xl font-bold">{a.visionTitle}</h2>
          </div>
          <div className="space-y-5 text-[1.07rem] leading-[1.9] text-white/80">
            {a.vision.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <CtaBand locale={locale} />
    </>
  );
}
