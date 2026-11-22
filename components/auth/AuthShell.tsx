import Image from "next/image";
import type { ReactNode } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";
import { assets } from "@/data/assets";
import { Hearts, Loop, Rays } from "@/components/decor";

/** Two-panel auth card: plum photo panel on the left, form on the right. */
export function AuthShell({
  badge,
  title,
  sub,
  panelTitle,
  panelPoints,
  image = assets.therapistsWithChild,
  children,
  footer,
}: {
  badge: string;
  title: string;
  sub: string;
  panelTitle: string;
  panelPoints: string[];
  image?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="au-wrap container-x">
      <div className="au-card">
        <div className="au-panel">
          <Hearts preset="hero" />
          <Loop className="au-loop" />
          <Rays className="au-rays" />
          <div className="au-panel-top">
            <span className="au-logo">
              <Image src={site.images.logo} alt="" width={44} height={41} className="h-9 w-auto object-contain" />
            </span>
            <span>
              <strong>Suraksha</strong>
              <small>Autism &amp; Neuro Disorder Center</small>
            </span>
          </div>
          <div className="au-photo">
            <Image src={image} alt="" fill sizes="(min-width:1024px) 22rem, 60vw" className="object-cover" priority />
          </div>
          <h2>{panelTitle}</h2>
          <ul>
            {panelPoints.map((p) => (
              <li key={p}>
                <span>
                  <Check size={12} strokeWidth={3.5} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="au-form">
          <p className="hx-eyebrow">{badge}</p>
          <h1>{title}</h1>
          <p className="au-sub">{sub}</p>
          {children}
          {footer && <div className="au-foot">{footer}</div>}
          <p className="au-trust">
            <ShieldCheck size={15} /> Secure login · Encrypted connection · Privacy protected
          </p>
        </div>
      </div>
    </section>
  );
}
