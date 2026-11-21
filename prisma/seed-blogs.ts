/**
 * Starter blog posts for the dynamic blog (/blog and /admin/blog): the two
 * versions (English + Bangla) of the centre's inauguration announcement.
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

const AUTHOR = "Suraksha Autism & Neuro Disorder Center";

export async function seedDemoBlogs() {
  let added = 0;
  for (const p of posts) {
    const en = postsEn[p.slug];
    const versions = [
      { slug: p.slug, title: en?.title ?? p.title, summary: en?.excerpt ?? p.excerpt, blocks: en?.blocks ?? p.blocks },
      { slug: `${p.slug}-bn`, title: p.title, summary: p.excerpt, blocks: p.blocks },
    ];
    for (const v of versions) {
      if (await db.blog.findUnique({ where: { slug: v.slug }, select: { id: true } })) continue;
      await db.blog.create({
        data: {
          slug: v.slug,
          title: v.title,
          summary: v.summary,
          content: blocksToHtml(v.blocks),
          date: new Date(`${p.date}T00:00:00.000Z`),
          author: AUTHOR,
          image: p.image,
        },
      });
      added++;
    }
  }
  console.log(`Blog: ${added} starter post(s) added.`);
}

/** `npx prisma db seed -- --reset-blogs` removes only the starter posts above. */
export async function resetDemoBlogs() {
  const slugs = posts.flatMap((p) => [p.slug, `${p.slug}-bn`]);
  const { count } = await db.blog.deleteMany({ where: { slug: { in: slugs } } });
  console.log(`Blog: removed ${count} starter post(s).`);
}
