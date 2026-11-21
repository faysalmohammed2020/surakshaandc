"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useDict, useLocale } from "@/i18n/LocaleProvider";

type Opt = { value: string; label: string; group: string };

const field =
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-ink placeholder:text-subtle/70 transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-100";
const label = "mb-1.5 block text-sm font-semibold text-ink";

export function EnquiryForm({
  kind,
  services = [],
  defaultService = "",
}: {
  kind: "appointment" | "contact";
  services?: Opt[];
  defaultService?: string;
}) {
  const d = useDict().form;
  const locale = useLocale();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, locale, ...data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || d.genericError);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : d.genericError);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-[2rem] bg-primary-50 p-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h3 className="mt-4 text-2xl font-bold text-ink">{d.thanks}</h3>
        <p className="mt-2 text-ink-soft">
          {kind === "appointment" ? d.doneAppointment : d.doneContact}
        </p>
      </div>
    );
  }

  const groups = Array.from(new Set(services.map((s) => s.group)));

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {kind === "appointment" ? (
        <>
          <div>
            <label className={label} htmlFor="parentName">{d.parentName}</label>
            <input id="parentName" name="parentName" required className={field} placeholder={d.parentNamePh} />
          </div>
          <div>
            <label className={label} htmlFor="phone">{d.phone}</label>
            <input id="phone" name="phone" required type="tel" inputMode="tel" pattern="[0-9০-৯+\-\s]{10,16}" className={field} placeholder={d.phonePh} />
          </div>
          <div>
            <label className={label} htmlFor="childName">{d.childName}</label>
            <input id="childName" name="childName" required className={field} placeholder={d.childNamePh} />
          </div>
          <div>
            <label className={label} htmlFor="childAge">{d.childAge}</label>
            <input id="childAge" name="childAge" required className={field} placeholder={d.childAgePh} />
          </div>
          <div>
            <label className={label} htmlFor="service">{d.service}</label>
            <select id="service" name="service" defaultValue={defaultService} className={field}>
              <option value="">{d.notSure}</option>
              {groups.map((g) => (
                <optgroup key={g} label={g}>
                  {services.filter((s) => s.group === g).map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="date">{d.date}</label>
            <input id="date" name="date" type="date" className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="type">{d.requestType}</label>
            <div className="flex flex-wrap gap-3">
              {["Appointment", "Admission", "Assessment"].map((t, i) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-line bg-white px-4 py-2 font-medium has-[:checked]:border-primary has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800">
                  <input type="radio" name="type" value={t} defaultChecked={i === 0} className="accent-[var(--brand-primary)]" />
                  {d.types[t as keyof typeof d.types]}
                </label>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className={label} htmlFor="name">{d.yourName}</label>
            <input id="name" name="name" required className={field} />
          </div>
          <div>
            <label className={label} htmlFor="phone">{d.phone}</label>
            <input id="phone" name="phone" required type="tel" className={field} placeholder={d.phonePh} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="email">{d.email}</label>
            <input id="email" name="email" type="email" className={field} />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <label className={label} htmlFor="message">{kind === "appointment" ? d.messageAppointment : d.messageContact}</label>
        <textarea id="message" name="message" rows={4} required={kind === "contact"} className={field} placeholder={d.messagePh} />
      </div>

      {state === "error" && <p className="text-sm font-semibold text-red-600 sm:col-span-2">{error}</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-13 items-center gap-2 rounded-full bg-primary px-8 font-semibold text-on-primary shadow-soft transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:opacity-60"
        >
          {state === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {kind === "appointment" ? d.submitAppointment : d.submitContact}
        </button>
      </div>
    </form>
  );
}
