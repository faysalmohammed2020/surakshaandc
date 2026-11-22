import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/home/Hero";
import { Audience } from "@/components/home/Audience";
import { ServiceStack, type StackItem } from "@/components/home/ServiceStack";
import { PillarsCarousel } from "@/components/home/PillarsCarousel";
import { BlogShowcase } from "@/components/home/BlogShowcase";
import { ReviewMarquee } from "@/components/home/ReviewMarquee";
import { FaqMap } from "@/components/home/FaqMap";
import { BookSection } from "@/components/home/BookSection";
import { getContent } from "@/lib/content";
import { getRecentBlogs } from "@/lib/blog";
import { site, teamRoles } from "@/lib/site";
import { getHomeCopy } from "@/data/home";
import { assets } from "@/data/assets";
import { getDict } from "@/i18n";
import { fmt, fmtDate, fmtNum, hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

export const revalidate = 60;
type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { alternates: alternates(locale, "/") };
}

/** Stack-card photo overrides (category images are used elsewhere too). */
const stackImages: Record<string, string> = {
  "sensory-integration": assets.sensoryRoom,
};

export default async function HomePage({ params }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const h = getHomeCopy(locale);
  const bn = locale === "bn";
  const lp = (href: string) => localePath(locale, href);
  const num = (n: number) => fmtNum(locale, n);
  const { categories, services, servicesOf } = getContent(locale);
  const posts = await getRecentBlogs(5).catch(() => []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: d.site.fullName,
    url: `${site.url}${bn ? "/bn" : ""}`,
    inLanguage: locale,
    logo: site.images.logo,
    image: categories[0].image,
    telephone: site.phones.map((p) => `+88${p.replace(/\D/g, "")}`),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Dhaka",
      postalCode: "1216",
      addressCountry: "BD",
    },
    medicalSpecialty: ["Pediatric", "SpeechPathology", "Neurologic", "PhysicalTherapy"],
    availableService: services.map((s) => ({ "@type": "MedicalTherapy", name: s.title })),
  };

  const stackItems: StackItem[] = categories.map((c, i) => {
    const list = servicesOf(c.slug);
    return {
      slug: c.slug,
      name: c.name,
      alt: c.nameBn,
      description: c.description,
      image: stackImages[c.slug] ?? c.image,
      href: lp(`/services/${c.slug}`),
      services: list.map((s) => s.title),
      count: fmt(d.cards.programmes, { n: num(list.length) }),
      num: num(i + 1).padStart(2, bn ? "০" : "0"),
    };
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero c={h.hero} lp={lp} />
      <Audience
        c={h.audience}
        values={[categories.length, services.length, teamRoles.length, site.founder.years]}
        fmt={num}
        lp={lp}
      />
      <ServiceStack items={stackItems} copy={h.stack} />
      <PillarsCarousel
        c={{
          ...h.pillars,
          items: h.pillars.items.map((it) => ({
            ...it,
            primary: { ...it.primary, href: lp(it.primary.href) },
            secondary: { ...it.secondary, href: lp(it.secondary.href) },
          })),
        }}
      />
      <BlogShowcase c={h.blog} posts={posts} lp={lp} date={(dt) => fmtDate(locale, dt.toISOString())} />
      <ReviewMarquee c={h.reviews} />
      <FaqMap c={h.faq} address={d.site.address} />
      <BookSection c={h.book} lp={lp} />
    </>
  );
}
