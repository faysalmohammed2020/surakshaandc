import { categories as rawCategories, services as rawServices, posts as rawPosts } from "@/data/content";
import { categoriesBn, servicesBn, type BnBlock } from "@/data/content.bn";
import { postsEn } from "@/data/posts.en";
import type { Block, Category, Post, Service } from "@/data/types";
import type { Locale } from "@/i18n/config";

/**
 * Source content: categories/services are written in English, blog posts in Bangla.
 * getContent() returns every item in the requested language.
 *
 * `name` is always the requested language. `nameBn` retains the alternate name
 * for legacy consumers; public pages render only `name`.
 */

const toBlocks = (blocks: BnBlock[]): Block[] =>
  blocks.map((b): Block =>
    b[0] === "list"
      ? { type: "list", items: b[1].map(([label, text]) => (label ? { label, text } : { text })) }
      : { type: b[0], text: b[1] }
  );

const excerptOf = (blocks: Block[], max = 220): string => {
  const first = blocks.find((b) => b.type === "p" || b.type === "lead");
  const text =
    first && first.type !== "list"
      ? first.text
      : (blocks.find((b) => b.type === "list") as Extract<Block, { type: "list" }> | undefined)?.items[0]?.text ?? "";
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
};

function build(locale: Locale) {
  let categories: Category[];
  let services: Service[];
  let posts: Post[];

  if (locale === "bn") {
    categories = rawCategories.map((c) => ({
      ...c,
      name: c.nameBn,
      nameBn: c.name,
      description: categoriesBn[c.slug]?.description ?? c.description,
    }));
    services = rawServices.map((s) => {
      const t = servicesBn[s.slug];
      if (!t) return s;
      const blocks = toBlocks(t.blocks);
      return { ...s, title: t.title, blocks, excerpt: excerptOf(blocks) };
    });
    posts = rawPosts;
  } else {
    categories = rawCategories;
    services = rawServices;
    posts = rawPosts.map((p) => {
      const t = postsEn[p.slug];
      return t ? { ...p, ...t } : p;
    });
  }

  return {
    categories,
    services,
    posts,
    getCategory: (slug: string) => categories.find((c) => c.slug === slug),
    getService: (slug: string) => services.find((s) => s.slug === slug),
    getPost: (slug: string) => posts.find((p) => p.slug === slug),
    servicesOf: (catSlug: string) => services.filter((s) => s.category === catSlug),
  };
}

const cache = new Map<Locale, ReturnType<typeof build>>();
export function getContent(locale: Locale) {
  let c = cache.get(locale);
  if (!c) cache.set(locale, (c = build(locale)));
  return c;
}

/** Locale-independent slug lists, for generateStaticParams and the sitemap. */
export const slugs = {
  categories: rawCategories.map((c) => c.slug),
  services: rawServices.map((s) => ({ category: s.category, service: s.slug })),
  posts: rawPosts.map((p) => ({ slug: p.slug, date: p.date })),
};
