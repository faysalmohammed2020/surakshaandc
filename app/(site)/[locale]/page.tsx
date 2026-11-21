import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarHeart,
  Check,
  Heart,
  HeartHandshake,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { CategoryCard, CtaBand } from "@/components/sections";
import { Button, SectionHeading } from "@/components/ui";
import { getContent } from "@/lib/content";
import { excerpt, getRecentBlogs } from "@/lib/blog";
import {
  bilingual,
  site,
  teamRoles,
  telHref,
  therapies,
  whyUs,
} from "@/lib/site";
import { getDict } from "@/i18n";
import { fmtDate, fmtNum, hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

export const revalidate = 60;
type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { alternates: alternates(locale, "/") };
}

export default async function HomePage({ params }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const h = d.home;
  const bn = locale === "bn";
  const text = (bangla: string, english: string) => (bn ? bangla : english);
  const lp = (href: string) => localePath(locale, href);
  const { categories, services, servicesOf } = getContent(locale);
  const posts = await getRecentBlogs(3).catch(() => []);
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
    medicalSpecialty: [
      "Pediatric",
      "SpeechPathology",
      "Neurologic",
      "PhysicalTherapy",
    ],
    availableService: services.map((s) => ({
      "@type": "MedicalTherapy",
      name: s.title,
    })),
  };
  const values = [
    categories.length,
    services.length,
    teamRoles.length,
    site.founder.years,
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="care-hero">
        <div className="container-x care-hero-grid">
          <div className="care-hero-copy">
            <p className="care-kicker">
              <span />
              {text("যত্নে, বিশ্বাসে, একসাথে", "CARE. CONNECTION. POSSIBILITY.")}
            </p>
            <h1>
              {text("প্রতিটি শিশুর", "Every child.")}
              <br />
              <span className="care-emphasis">
                {text("নিজস্ব পৃথিবী।", "Their own world.")}
              </span>
              <br />
              {text("পাশে আছি আমরা।", "We’re by their side.")}
            </h1>
            <p className="care-hero-description">{d.site.description}</p>
            <div className="care-hero-actions">
              <Button href={lp("/appointment")} size="lg">
                <CalendarHeart className="h-5 w-5" />
                {d.cta.book}
              </Button>
              <Button href={lp("/services")} variant="outline" size="lg">
                {h.exploreServices}
              </Button>
            </div>
            <div className="care-hero-assurance">
              <ShieldCheck size={19} />
              <span>{text("শিশুকেন্দ্রিক যত্ন", "Child-centred care")}</span>
              <span className="care-divider" />
              <span>
                {text("পরিবারের সক্রিয় অংশগ্রহণ", "Family at every step")}
              </span>
            </div>
          </div>
          <div className="care-hero-visual">
            <div className="care-orbit" aria-hidden="true" />
            <div className="care-photo-main">
              <Image
                src={categories[0].image}
                alt={text(
                  "খেলার মাধ্যমে মনোযোগ ও দক্ষতা বিকাশে ব্যস্ত শিশু",
                  "A child exploring colourful learning activities",
                )}
                fill
                priority
                sizes="(min-width:1024px) 32vw, 78vw"
                className="object-cover"
              />
              <div className="care-photo-caption">
                <Heart size={17} />
                {text(
                  "ছোট ছোট পদক্ষেপ, বড় সম্ভাবনা",
                  "Little steps. Beautiful possibilities.",
                )}
              </div>
            </div>
            <div className="care-photo-small">
              <Image
                src="/images/learning-materials.jpg"
                alt={text(
                  "শিশুর যোগাযোগ দক্ষতা বিকাশে সহায়তা",
                  "Supporting a child’s communication skills",
                )}
                fill
                priority
                sizes="(min-width:1024px) 16vw, 38vw"
                className="object-cover"
              />
            </div>
            <div className="care-personal-note">
              <span className="care-note-icon">
                <HeartHandshake size={25} />
              </span>
              <div>
                <strong>{h.oneToOne}</strong>
                <span>
                  {text(
                    "প্রতিটি শিশুর জন্য আলাদা যত্ন",
                    "Care as individual as your child",
                  )}
                </span>
              </div>
            </div>
            <span className="care-flower" aria-hidden="true">
              ✳
            </span>
            <span className="care-image-label">
              {text("শেখা হোক আনন্দের", "ROOM TO GROW")}
            </span>
          </div>
        </div>
        <div className="container-x">
          <div className="care-hero-bottom">
            <p>
              <MapPin size={16} />
              {d.site.location}
            </p>
            <a href={telHref(site.phones[0])}>
              <Phone size={16} />
              {text("কথা বলুন আমাদের সাথে", "Let’s talk about your child")}
              <strong>{site.phones[0]}</strong>
            </a>
          </div>
        </div>
      </section>

      <section className="care-stats">
        <div className="container-x care-stats-grid">
          {h.stats.map(([label], i) => (
            <div key={label}>
              <strong>
                {fmtNum(locale, values[i])}
                {i === 3 ? "+" : ""}
              </strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x care-section">
        <div className="care-section-top">
          <SectionHeading
            align="left"
            eyebrow={h.servicesEyebrow}
            title={
              <>
                {text("ভিন্ন প্রয়োজন।", "Different needs.")}
                <br />
                <span className="text-primary">
                  {text("যত্নে একই অঙ্গীকার।", "The same commitment to care.")}
                </span>
              </>
            }
          />
          <p className="care-section-intro">
            {h.servicesSub}
            <Link href={lp("/services")} className="care-text-link">
              {text("সকল সেবা দেখুন", "Discover all our services")}
            </Link>
          </p>
        </div>
        <div className="care-services-grid">
          {categories.map((c, i) => (
            <CategoryCard
              key={c.slug}
              c={c}
              i={i}
              count={servicesOf(c.slug).length}
              locale={locale}
            />
          ))}
        </div>
      </section>

      <section className="care-philosophy">
        <div className="container-x care-philosophy-grid">
          <div className="care-philosophy-visual">
            <div className="care-philosophy-photo">
              <Image
                src="/images/learning-materials.jpg"
                alt={text(
                  "শিশু ও পরিবারের জন্য সহায়ক পরিবেশ",
                  "Learning materials for children?s development",
                )}
                fill
                sizes="(min-width:1024px) 42vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="care-quote">
              <span aria-hidden="true">“</span>
              <p>
                {text(
                  "প্রতিটি শিশুর বেড়ে ওঠার নিজস্ব ছন্দ আছে। আমরা সেই ছন্দকে সম্মান করি।",
                  "Every child grows at their own pace. We make room for that.",
                )}
              </p>
              <Leaf size={28} />
            </div>
          </div>
          <div>
            <SectionHeading
              align="left"
              eyebrow={h.whyEyebrow}
              title={text(
                "শুধু থেরাপি নয়, একটি ভরসার জায়গা।",
                "More than therapy. A place to belong.",
              )}
              sub={text(
                "শিশুকে বুঝে, পরিবারকে সাথে নিয়ে—প্রতিটি পদক্ষেপে আন্তরিক ও সমন্বিত সহায়তা।",
                "Understanding your child, listening to your family, and supporting you with thoughtful, coordinated care.",
              )}
            />
            <ul className="care-values">
              {whyUs.map((w) => (
                <li key={w.title}>
                  <Check size={18} />
                  <span>{bilingual({ en: w.title, bn: w.bn }, locale)[0]}</span>
                </li>
              ))}
            </ul>
            <Link href={lp("/about")} className="care-text-link">
              {h.readStory}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x care-section">
        <div className="care-section-top">
          <SectionHeading
            align="left"
            eyebrow={h.journeyEyebrow}
            title={text("শুরু থেকে, প্রতিটি ধাপে।", "Together, at every step.")}
          />
          <p className="care-section-intro">{h.journeySub}</p>
        </div>
        <ol className="care-journey">
          {h.journey.map(([title, description], i) => (
            <li key={title} data-reveal>
              <span className="care-step">
                {fmtNum(locale, i + 1).padStart(2, bn ? "০" : "0")}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="care-team-section">
        <div className="container-x care-team-grid">
          <div>
            <p className="care-kicker">{h.teamEyebrow}</p>
            <h2>
              {text("অনেক দক্ষতা।", "Many disciplines.")}
              <br />
              <span>
                {text("একটি সমন্বিত পরিকল্পনা।", "One thoughtful plan.")}
              </span>
            </h2>
            <p className="care-team-intro">
              {text(
                "চিকিৎসক, থেরাপিস্ট ও বিশেষ শিক্ষকের সম্মিলিত অভিজ্ঞতায় আপনার শিশুর জন্য ব্যক্তিগত সহায়তা।",
                "Doctors, therapists and special educators bring their expertise together around your child.",
              )}
            </p>
            <Link href={lp("/about#team")} className="care-text-link">
              {text("আমাদের টিম সম্পর্কে জানুন", "Meet our care team")}
            </Link>
            <div className="care-founder">
              <Stethoscope size={27} />
              <div>
                <span>{h.founderLabel}</span>
                <strong>{d.site.founderName}</strong>
                <p>{d.site.founderRole}</p>
              </div>
            </div>
          </div>
          <div className="care-team-disciplines">
            {teamRoles.map((r) => (
              <div key={r.en}>
                <span>{bilingual(r, locale)[0]}</span>
                <Check size={16} />
              </div>
            ))}
            <p className="care-therapy-label">{h.therapiesTitle}</p>
            <div className="care-therapy-tags">
              {therapies.map((t) => (
                <span key={t.en}>{bilingual(t, locale)[0]}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container-x care-section">
          <div className="care-section-top">
            <SectionHeading
              align="left"
              eyebrow={h.blogEyebrow}
              title={h.blogTitle}
            />
            <Link href={lp("/blog")} className="care-text-link">
              {h.allPosts}
            </Link>
          </div>
          <div className="care-blog-grid">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={lp(`/blog/${p.slug}`)}
                className="care-blog-card"
              >
                <div className="care-blog-image">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width:768px) 30vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <time>{fmtDate(locale, p.date.toISOString())}</time>
                <h3>{p.title}</h3>
                <p>{excerpt(p.summary, 140)}</p>
                <span className="care-text-link">{d.common.readMore}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CtaBand locale={locale} />
      <section className="container-x care-section care-visit">
        <div>
          <p className="eyebrow">{h.visitEyebrow}</p>
          <h2>{text("আসুন, দেখা হোক।", "Come say hello.")}</h2>
          <p>{d.site.address}</p>
          <a href={telHref(site.phones[0])} className="care-visit-phone">
            {site.phones[0]}
          </a>
          <Link href={lp("/contact")} className="care-text-link">
            {h.contactUs}
          </Link>
        </div>
        <div className="care-map">
          <iframe
            src={site.mapEmbed}
            title={h.mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </>
  );
}
