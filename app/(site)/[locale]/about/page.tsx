import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { assets } from "@/data/assets";
import { Building2, CheckCircle2, GraduationCap, Quote } from "lucide-react";
import { Brush, Heart } from "@/components/decor";
import { CtaBand, PageHero } from "@/components/sections";
import { ImgFrame, SectionHeading } from "@/components/ui";
import { facilities, site, teamRoles, therapies } from "@/lib/site";
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
  const text = (bangla: string, english: string) => (locale === "bn" ? bangla : english);

  const list = (items: { en: string; bn: string }[]) =>
    items.map((f) => {
      const primary = f[locale];
      return (
        <li key={f.en} className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span>
            <span className="font-semibold text-ink">{primary}</span>
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
        image={assets.familyGroup}
        crumbs={[{ label: d.common.breadcrumbHome, href: localePath(locale, "/") }, { label: d.common.breadcrumbAbout }]}
      />

      {/* Story */}
      <section className="container-x mt-20 grid gap-14 lg:grid-cols-[1fr_1.15fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ImgFrame className="aspect-[4/5] rounded-[2.5rem] shadow-lift">
            <Image src={assets.classroomGreen} alt={a.imgAlt} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
          </ImgFrame>
        </div>
        <div>
          <SectionHeading align="left" eyebrow={a.storyEyebrow} title={d.site.fullName} />
          <div className="mt-6 space-y-5 text-[1.07rem] leading-[1.9] text-ink-soft">
            {a.story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div id="founder" className="mt-10 scroll-mt-28 rounded-[2rem] bg-primary-50 p-7">
            <Quote className="h-8 w-8 text-secondary" />
            <p className="mt-3 font-display text-2xl font-bold text-ink">{d.site.founderName}</p>
            <p className="mt-1 text-ink-soft">
              {fmt(a.founderLine, { role: d.site.founderRole, n: fmtNum(locale, site.founder.years) })}
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="container-x mt-28 scroll-mt-28">
        <SectionHeading eyebrow={a.teamEyebrow} title={a.teamTitle} sub={a.teamSub} />
        <div className="ab-team-photos mt-10">
          <div>
            <Image src={assets.teamMeeting} alt="" fill sizes="(min-width:768px) 60vw, 100vw" className="object-cover" />
          </div>
          <div>
            <Image src={assets.caseConference} alt="" fill sizes="(min-width:768px) 35vw, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamRoles.map((r, i) => {
            const primary = r[locale];
            return (
              <div key={r.en} className={`ab-team-card t${i % 6}`}>
                <span>{fmtNum(locale, i + 1).padStart(2, locale === "bn" ? "০" : "0")}</span>
                <span>
                  <span className="block text-lg font-semibold text-ink">{primary}</span>
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
          <p className="mt-2 text-ink-soft">{a.facilitiesSub}</p>
          <ul className="mt-6 space-y-3">{list(facilities)}</ul>
        </div>
        <div className="rounded-[2.5rem] bg-white p-8 shadow-soft md:p-10">
          <GraduationCap className="h-9 w-9 text-secondary" />
          <h2 className="mt-4 text-3xl font-bold text-ink">{a.therapyTitle}</h2>
          <p className="mt-2 text-ink-soft">{a.therapySub}</p>
          <ul className="mt-6 space-y-3">{list(therapies)}</ul>
        </div>
      </section>

      {/* Inside the centre */}
      <section className="container-x mt-28">
        <SectionHeading
          eyebrow={text("আমাদের সেন্টার", "Our centre")}
          title={text("ভেতরে একবার ঘুরে আসুন", "Take a look inside")}
          sub={text("উজ্জ্বল ক্লাসরুম, শান্ত সেন্সরি রুম আর খোলা খেলার জায়গা—শিশুর জন্য নিরাপদ ও আনন্দময় পরিবেশ।", "Bright classrooms, a calm sensory room and open space to play — safe, happy places to learn.")}
        />
        <div className="ab-rooms mt-12">
          {[
            [assets.classroomBlue, text("ক্লাসরুম", "Classroom")],
            [assets.sensoryRoom, text("সেন্সরি রুম", "Sensory room")],
            [assets.therapyRoom, text("থেরাপি রুম", "Therapy room")],
            [assets.playground, text("খেলার মাঠ", "Outdoor play")],
            [assets.reception, text("রিসেপশন", "Reception")],
          ].map(([src, label], i) => (
            <figure key={src} className={`t${i % 6}`}>
              <Image src={src} alt={label} fill sizes="(min-width:1024px) 30vw, 50vw" className="object-cover" />
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Vision & mission */}
      <section className="container-x mt-28 text-center">
        <p className="hx-book-eyebrow">{a.visionEyebrow}</p>
        <h2 className="mt-1 text-4xl font-semibold text-[var(--c-sky)] sm:text-5xl">{a.visionTitle}</h2>
        <div className="mx-auto mt-6 max-w-3xl space-y-4 text-[1.05rem] leading-[1.9] text-ink-soft">
          {a.vision.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="ab-vm mt-16">
          <div>
            <h3>{text("ভিশন", "Vision")}</h3>
            <Brush className="hx-brush purple" />
            <p>{text("প্রতিটি বিশেষ চাহিদাসম্পন্ন শিশুকে বিকশিত হতে সক্ষম করে তোলা।", "To empower every child with special needs to thrive.")}</p>
          </div>
          <div className="hx-book-hearts" aria-hidden>
            <Heart className="h1" />
            <Heart className="h2" />
            <Heart className="h3" />
          </div>
          <div>
            <h3>{text("মিশন", "Mission")}</h3>
            <Brush className="hx-brush sky" />
            <p>{text("কম খরচে মানসম্মত, বিজ্ঞানভিত্তিক থেরাপি ও শিক্ষা সেবা—পরিবারকে সাথে নিয়ে।", "Quality, evidence-based therapy and education at a low cost, together with every family.")}</p>
          </div>
        </div>
      </section>

      <CtaBand locale={locale} />
    </>
  );
}
