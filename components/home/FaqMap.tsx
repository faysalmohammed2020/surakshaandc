import { MapPin, Navigation, Plus } from "lucide-react";
import type { HomeCopy } from "@/data/home";
import { site } from "@/lib/site";

export function FaqMap({ c, address }: { c: HomeCopy["faq"]; address: string }) {
  return (
    <section className="hx-faq container-x">
      <div className="hx-faq-list">
        <p className="hx-eyebrow">{c.eyebrow}</p>
        <h2>{c.title}</h2>
        <div className="hx-faq-items">
          {c.items.map(([q, a], i) => (
            <details key={q} className={`t${i % 6}`} name="home-faq" open={i === 0}>
              <summary>
                <span className="hx-faq-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="hx-faq-q">{q}</span>
                <span className="hx-faq-plus">
                  <Plus size={18} strokeWidth={2.5} />
                </span>
              </summary>
              <div className="hx-faq-a">
                <p>{a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
      <div className="hx-faq-map">
        <iframe
          src={site.mapEmbed}
          title={c.mapTitle}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="hx-map-card">
          <span>
            <MapPin size={20} />
          </span>
          <div>
            <strong>{c.mapTitle}</strong>
            <p>{address}</p>
            <a href={site.mapLink} target="_blank" rel="noreferrer">
              <Navigation size={14} /> {c.directions}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
