/**
 * Inauguration announcement + ten parent resources, each in English and Bangla.
 *
 *   npx prisma db seed
 *
 * Safe to re-run: posts are matched by slug and left alone if they already exist,
 * so edits made in /admin/blog are never overwritten. The seed never touches other posts.
 */
import { db } from "../lib/db";
import { posts } from "../data/content";
import { postsEn } from "../data/posts.en";
import type { Block } from "../data/types";
import { assets } from "../data/assets";
import { parentArticles } from "./blog-posts";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Content blocks → the HTML the rich-text editor produces. */
function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "h2") return `<h2>${esc(b.text)}</h2>`;
      if (b.type === "h3") return `<h3>${esc(b.text)}</h3>`;
      if (b.type === "lead") return `<p><strong>${esc(b.text)}</strong></p>`;
      if (b.type === "list")
        return `<ul>${b.items.map((i) => `<li>${i.label ? `<strong>${esc(i.label)}:</strong> ` : ""}${esc(i.text)}</li>`).join("")}</ul>`;
      return `<p>${esc(b.text)}</p>`;
    })
    .join("\n");
}

const authors = {
  en: "Suraksha Autism & Neuro Disorder Center",
  bn: "সুরক্ষা অটিজম ও নিউরো ডিসঅর্ডার সেন্টার",
};

export const starterBlogs = [
  ...posts.flatMap((p) => {
    const en = postsEn[p.slug];
    if (!en) throw new Error(`Missing English translation: ${p.slug}`);
    return [
      { slug: p.slug, title: en.title, summary: en.excerpt, content: blocksToHtml(en.blocks), author: authors.en, image: assets.building, date: new Date(`${p.date}T00:00:00.000Z`) },
      { slug: `${p.slug}-bn`, title: p.title, summary: p.excerpt, content: blocksToHtml(p.blocks), author: authors.bn, image: assets.building, date: new Date(`${p.date}T00:00:00.000Z`) },
    ];
  }),
  ...parentArticles.flatMap((article) => (["en", "bn"] as const).map((locale) => {
    const copy = article[locale];
    const blocks: Block[] = [
      { type: "lead", text: copy.summary },
      ...copy.sections.flatMap(([heading, text]): Block[] => [{ type: "h2", text: heading }, { type: "p", text }]),
      { type: "h2", text: locale === "bn" ? "মনে রাখার সহজ তালিকা" : "A simple checklist" },
      { type: "list", items: copy.tips.map((text) => ({ text })) },
    ];
    return {
      slug: `${article.slug}${locale === "bn" ? "-bn" : ""}`,
      title: copy.title,
      summary: copy.summary,
      content: blocksToHtml(blocks),
      date: new Date("2026-11-22T00:00:00.000Z"),
      author: authors[locale],
      image: article.image,
    };
  })),
];

export async function seedDemoBlogs() {
  const { count } = await db.blog.createMany({ data: starterBlogs, skipDuplicates: true });
  console.log(`Blog: ${count} starter post(s) added.`);
}

/** `npx prisma db seed -- --reset-blogs` removes only the starter posts above. */
export async function resetDemoBlogs() {
  const slugs = starterBlogs.map((p) => p.slug);
  const { count } = await db.blog.deleteMany({ where: { slug: { in: slugs } } });
  console.log(`Blog: removed ${count} starter post(s).`);
}
