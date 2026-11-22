import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { assets } from "@/data/assets";
import { Gallery } from "@/components/Gallery";
import { CtaBand, PageHero } from "@/components/sections";
import { getContent } from "@/lib/content";
import { site } from "@/lib/site";
import { getDict } from "@/i18n";
import { hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { ...getDict(locale).meta.gallery, alternates: alternates(locale, "/gallery") };
}

export default async function GalleryPage({ params }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const { categories, services } = getContent(locale);

  // TODO: replace with real event / facility photos from the client.
  const items = [
    ...Object.entries(assets).map(([key, src]) => ({ src, alt: key.replace(/([A-Z])/g, " $1").toLowerCase() })),
    { src: site.images.hero, alt: d.gallery.centreAlt },
    { src: site.images.about, alt: d.gallery.insideAlt },
    ...categories.map((c) => ({ src: c.image, alt: c.name })),
    ...services.filter((s) => s.image).slice(0, 6).map((s) => ({ src: s.image!, alt: s.title })),
  ].filter((it, i, all) => all.findIndex((x) => x.src === it.src) === i); // no duplicate photos
  return (
    <>
      <PageHero
        title={d.gallery_page.heroTitle}
        eyebrow={d.gallery_page.heroEyebrow}
        image={assets.kidsTableGame}
        crumbs={[{ label: d.common.breadcrumbHome, href: localePath(locale, "/") }, { label: d.common.breadcrumbGallery }]}
      />
      <section className="container-x mt-16">
        <Gallery items={items} />
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
