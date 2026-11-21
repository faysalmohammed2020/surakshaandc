import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PageHero } from "@/components/sections";
import { ImgFrame } from "@/components/ui";
import { excerpt, getBlogBySlug, getRecentBlogs, sanitizeHtmlFragment } from "@/lib/blog";
import { getDict } from "@/i18n";
import { fmt, fmtDate, hasLocale, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

// Posts are managed in /admin/blog, so this page is always rendered fresh.
export const dynamic = "force-dynamic";

type P = { params: Promise<{ locale: string; slug: string }> };

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

async function load(slug: string) {
  try {
    return await getBlogBySlug(decode(slug));
  } catch (e) {
    console.error("[blog] could not load post:", e);
    return null;
  }
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};
  const p = await load(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: excerpt(p.summary, 158),
    alternates: alternates(locale, `/blog/${decode(slug)}`),
    openGraph: { type: "article", images: p.image ? [p.image] : [] },
  };
}

export default async function PostPage({ params }: P) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const p = await load(slug);
  if (!p) notFound();
  const recent = await getRecentBlogs(4, p.id).catch(() => []);

  return (
    <>
      <PageHero
        title={p.title}
        eyebrow={fmtDate(locale, p.date.toISOString())}
        sub={fmt(d.blog.by, { author: p.author })}
        crumbs={[
          { label: d.common.breadcrumbHome, href: localePath(locale, "/") },
          { label: d.common.breadcrumbBlog, href: localePath(locale, "/blog") },
          { label: d.common.breadcrumbPost },
        ]}
      />
      <div className="container-x mt-14 grid gap-12 lg:grid-cols-[1fr_18rem]">
        <article className="min-w-0">
          {p.image && (
            <ImgFrame className="mb-10 aspect-[16/9] rounded-[2.25rem] shadow-soft">
              <Image src={p.image} alt="" fill priority unoptimized sizes="(min-width:1024px) 48rem, 100vw" className="object-cover" />
            </ImgFrame>
          )}
          <div className="prose-suraksha" dangerouslySetInnerHTML={{ __html: sanitizeHtmlFragment(p.content) }} />
          <Link href={localePath(locale, "/blog")} className="mt-10 inline-block font-semibold text-primary-700 hover:underline">
            ← {d.blog.backToBlog}
          </Link>
        </article>

        {recent.length > 0 && (
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-lg font-bold text-ink">{d.blog.recent}</h2>
            <ul className="space-y-3">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={localePath(locale, `/blog/${r.slug}`)} className="block rounded-2xl border-2 border-line bg-white p-4 transition hover:border-primary">
                    <time className="text-xs font-semibold text-secondary-700">{fmtDate(locale, r.date.toISOString())}</time>
                    <span className="mt-1 block font-semibold leading-snug text-ink">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
      <CtaBand locale={locale} />
    </>
  );
}
