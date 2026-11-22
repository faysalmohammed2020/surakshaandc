import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { HomeCopy } from "@/data/home";
import { excerpt, type PublicBlog } from "@/lib/blog";
import { Hearts } from "@/components/decor";

export function BlogShowcase({
  c,
  posts,
  lp,
  date,
}: {
  c: HomeCopy["blog"];
  posts: PublicBlog[];
  lp: (h: string) => string;
  date: (d: Date) => string;
}) {
  if (posts.length === 0) return null;
  const [lead, ...rest] = posts;
  return (
    <section className="hx-blog">
      <Hearts preset="section" />
      <div className="container-x">
        <div className="hx-blog-head">
          <div>
            <p className="hx-eyebrow">{c.eyebrow}</p>
            <h2>{c.title}</h2>
            <p>{c.sub}</p>
          </div>
          <Link href={lp("/blog")} className="hx-pill-btn ghost">
            {c.all} <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className={`hx-blog-grid ${rest.length === 0 ? "solo" : ""}`}>
          <Link href={lp(`/blog/${lead.slug}`)} className="hx-blog-lead">
            <Image src={lead.image} alt="" fill unoptimized sizes="(min-width:1024px) 40vw, 92vw" className="object-cover" />
            <span className="hx-tag">{c.tag}</span>
            <div className="hx-blog-lead-copy">
              <h3>{lead.title}</h3>
              <p>{excerpt(lead.summary, 130)}</p>
              <time dateTime={lead.date.toISOString()}>
                <Clock size={14} /> {date(lead.date)}
              </time>
            </div>
          </Link>
          {rest.length > 0 && (
            <div className={`hx-blog-small c${Math.min(rest.length, 4)}`}>
              {rest.slice(0, 4).map((p, i) => (
                <Link key={p.id} href={lp(`/blog/${p.slug}`)} className="hx-blog-card">
                  <div className="hx-blog-card-img">
                    <Image src={p.image} alt="" fill unoptimized sizes="(min-width:1024px) 22vw, 46vw" className="object-cover" />
                    <span className={`hx-tag t${i}`}>{c.tag}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <time dateTime={p.date.toISOString()}>
                    <Clock size={13} /> {date(p.date)}
                  </time>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
