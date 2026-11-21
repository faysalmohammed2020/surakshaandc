import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { CtaBand, PageHero } from "@/components/sections";
import { ImgFrame } from "@/components/ui";
import { excerpt, getArchiveMonths, getBlogList, parseListQuery, type PublicBlog } from "@/lib/blog";
import { getDict } from "@/i18n";
import { fmt, fmtDate, fmtNum, hasLocale, localeMeta, localePath } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

// Posts are managed in /admin/blog, so this page is always rendered fresh.
export const dynamic = "force-dynamic";

type P = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; month?: string }>;
};

export async function generateMetadata({ params }: Pick<P, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { ...getDict(locale).meta.blog, alternates: alternates(locale, "/blog") };
}

export default async function BlogPage({ params, searchParams }: P) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDict(locale);
  const query = parseListQuery(await searchParams);

  let posts: PublicBlog[] = [];
  let pages = 1;
  let months: Awaited<ReturnType<typeof getArchiveMonths>> = [];
  try {
    [{ posts, pages }, months] = await Promise.all([getBlogList(query), getArchiveMonths()]);
  } catch (e) {
    console.error("[blog] could not load posts:", e);
  }

  const href = (over: Partial<{ page: number; q: string; month: string }>) => {
    const sp = new URLSearchParams();
    const q = over.q ?? query.q;
    const month = over.month ?? query.month;
    const page = over.page ?? 1;
    if (q) sp.set("q", q);
    if (month) sp.set("month", month);
    if (page > 1) sp.set("page", String(page));
    const s = sp.toString();
    return localePath(locale, "/blog") + (s ? `?${s}` : "");
  };
  const monthLabel = (y: number, m: number) =>
    new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(localeMeta[locale].intl, { month: "long", year: "numeric", timeZone: "UTC" });
  const filtered = Boolean(query.q || query.month);

  return (
    <>
      <PageHero
        title={d.blog.heroTitle}
        eyebrow={d.blog.heroEyebrow}
        sub={d.blog.heroSub}
        crumbs={[{ label: d.common.breadcrumbHome, href: localePath(locale, "/") }, { label: d.common.breadcrumbBlog }]}
      />

      <section className="container-x mt-12">
        <form action={localePath(locale, "/blog")} className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
            <input
              name="q"
              defaultValue={query.q}
              maxLength={100}
              placeholder={d.blog.searchPlaceholder}
              aria-label={d.blog.search}
              className="h-12 w-full rounded-full border-2 border-line bg-white pl-12 pr-4 outline-none transition focus:border-primary"
            />
          </div>
          {months.length > 0 && (
            <select
              name="month"
              defaultValue={query.month}
              aria-label={d.blog.archive}
              className="h-12 rounded-full border-2 border-line bg-white px-4 outline-none transition focus:border-primary"
            >
              <option value="">{d.blog.allMonths}</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {monthLabel(m.year, m.month)} ({fmtNum(locale, m.count)})
                </option>
              ))}
            </select>
          )}
          <button className="h-12 rounded-full bg-primary px-6 font-semibold text-on-primary transition hover:-translate-y-0.5">{d.blog.search}</button>
          {filtered && (
            <Link href={localePath(locale, "/blog")} className="px-2 font-semibold text-primary-700 hover:underline">
              {d.blog.clear}
            </Link>
          )}
        </form>
      </section>

      {posts.length === 0 ? (
        <p className="container-x mt-16 rounded-[2rem] bg-primary-50 p-10 text-center text-lg text-ink-soft">
          {filtered ? d.blog.emptySearch : d.blog.empty}
        </p>
      ) : (
        <section className="container-x mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={localePath(locale, `/blog/${p.slug}`)} className="group flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
              <ImgFrame className="aspect-[16/10]">
                <Image src={p.image} alt="" fill unoptimized sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </ImgFrame>
              <div className="flex flex-1 flex-col p-6">
                <time dateTime={p.date.toISOString()} className="text-sm font-semibold text-secondary-700">{fmtDate(locale, p.date.toISOString())}</time>
                <h2 className="mt-2 text-xl font-bold leading-snug text-ink group-hover:text-primary-700">{p.title}</h2>
                <p className="mt-3 line-clamp-3 flex-1 text-ink-soft">{excerpt(p.summary, 180)}</p>
                <span className="mt-5 inline-flex items-center gap-1 font-semibold text-primary-700">
                  {d.common.readMore} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {pages > 1 && (
        <nav className="container-x mt-12 flex items-center justify-center gap-4" aria-label="Pagination">
          {query.page > 1 && (
            <Link href={href({ page: query.page - 1 })} className="rounded-full border-2 border-line bg-white px-5 py-2 font-semibold hover:border-primary">
              ← {d.blog.prev}
            </Link>
          )}
          <span className="text-ink-soft">{fmt(d.blog.pageOf, { page: fmtNum(locale, query.page), total: fmtNum(locale, pages) })}</span>
          {query.page < pages && (
            <Link href={href({ page: query.page + 1 })} className="rounded-full border-2 border-line bg-white px-5 py-2 font-semibold hover:border-primary">
              {d.blog.next} →
            </Link>
          )}
        </nav>
      )}
      <CtaBand locale={locale} />
    </>
  );
}
