"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { CheckCheck, MessageCircle, Send, SmilePlus, X } from "lucide-react";
import { useDict, useLocale } from "@/i18n/LocaleProvider";
import {
  CHAT_FLAG_COOKIE,
  CHAT_REACTIONS,
  type ChatMessageDTO,
  type PollResult,
  type ServerEvent,
  type VisitorConversationDTO,
} from "@/lib/chat/shared";

const POLL_OPEN_MS = 2500;
const POLL_CLOSED_MS = 20000;

const newId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "");
const bnToEn = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
const clock = (iso: string, intl: string) => new Date(iso).toLocaleTimeString(intl, { hour: "2-digit", minute: "2-digit" });

const post = (path: string, body: unknown) =>
  fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/** Live-chat bubble for visitors. Talks to /api/chat/* and shows up in /admin/chat. */
export function ChatWidget() {
  const d = useDict().chat;
  const locale = useLocale();
  const pathname = usePathname();
  const intl = locale === "bn" ? "bn-BD" : "en-GB";

  const [open, setOpen] = useState(false);
  const [conv, setConv] = useState<VisitorConversationDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(0);
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const openRef = useRef(open);
  const cursor = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const typingSentAt = useRef(0);
  openRef.current = open;

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/session", { cache: "no-store" });
      if (!res.ok) return;
      const j = await res.json();
      if (j.conversation) {
        setConv(j.conversation);
        setMessages(j.messages ?? []);
      } else if (j.prefill?.name) setForm((f) => ({ ...f, name: f.name || j.prefill.name, email: f.email || j.prefill.email }));
    } finally {
      setLoaded(true);
    }
  }, []);

  // A returning visitor has the flag cookie: restore their thread quietly. Others load on first open.
  useEffect(() => {
    if (document.cookie.split("; ").some((c) => c.startsWith(`${CHAT_FLAG_COOKIE}=`))) void loadSession();
  }, [loadSession]);
  useEffect(() => {
    if (open && !loaded) void loadSession();
  }, [open, loaded, loadSession]);

  const apply = useCallback((events: ServerEvent[]) => {
    for (const ev of events) {
      if (ev.t === "message") {
        setMessages((m) => (m.some((x) => x.id === ev.message.id) ? m : [...m, ev.message]));
        if (openRef.current) void post("/api/chat/poll", { t: "read" });
        else setUnread((n) => n + 1);
        setAdminTyping(0);
      } else if (ev.t === "reaction") setMessages((m) => m.map((x) => (x.id === ev.message.id ? ev.message : x)));
      else if (ev.t === "read") {
        const ids = new Set(ev.messageIds);
        setMessages((m) => m.map((x) => (ids.has(x.id) ? { ...x, readAt: x.readAt ?? new Date().toISOString() } : x)));
      } else if (ev.t === "typing" && ev.on) setAdminTyping(Date.now() + 5000);
      else if (ev.t === "status") setConv((c) => (c ? { ...c, status: ev.status } : c));
    }
  }, []);

  // Poll while a conversation exists (fast when the panel is open).
  useEffect(() => {
    if (!conv) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const url = `/api/chat/poll${cursor.current ? `?since=${encodeURIComponent(cursor.current)}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const j: PollResult = await res.json();
          cursor.current = j.cursor;
          setAgentOnline(j.agentOnline);
          apply(j.events);
        }
      } catch {}
      if (!stop) timer = setTimeout(tick, openRef.current && !document.hidden ? POLL_OPEN_MS : POLL_CLOSED_MS);
    };
    void tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [conv?.id, apply]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (conv) void post("/api/chat/poll", { t: "read" });
      endRef.current?.scrollIntoView({ block: "end" });
    }
  }, [open, conv?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, adminTyping, open]);
  useEffect(() => {
    if (!adminTyping) return;
    const t = setTimeout(() => setAdminTyping(0), Math.max(0, adminTyping - Date.now()) + 50);
    return () => clearTimeout(t);
  }, [adminTyping]);

  async function start(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await post("/api/chat/session", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: bnToEn(form.phone.trim()),
        locale,
        path: pathname || "/",
      });
      if (res.status === 429) throw new Error(d.rateLimited);
      if (!res.ok) throw new Error(d.startError);
      const j = await res.json();
      setConv(j.conversation);
      setMessages(j.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.startError);
    } finally {
      setBusy(false);
    }
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || !conv) return;
    const clientId = newId();
    setDraft("");
    setError("");
    setMessages((m) => [
      ...m,
      {
        id: `tmp-${clientId}`,
        conversationId: conv.id,
        senderType: "VISITOR",
        senderName: null,
        body,
        imageId: null,
        clientId,
        createdAt: new Date().toISOString(),
        readAt: null,
        reactions: [],
      },
    ]);
    try {
      const res = await post("/api/chat/poll", { t: "send", clientId, body });
      const j = await res.json();
      const ack = (j.events as ServerEvent[] | undefined)?.find((x) => x.t === "ack");
      if (!res.ok || !ack || ack.t !== "ack") throw new Error();
      setMessages((m) => m.map((x) => (x.clientId === clientId ? ack.message : x)));
      setConv((c) => (c ? { ...c, status: "OPEN" } : c));
    } catch {
      setMessages((m) => m.filter((x) => x.clientId !== clientId));
      setDraft(body);
      setError(d.error);
    }
  }

  function onType(v: string) {
    setDraft(v);
    if (conv && Date.now() - typingSentAt.current > 3000) {
      typingSentAt.current = Date.now();
      void post("/api/chat/poll", { t: "typing", on: true });
    }
  }

  async function react(m: ChatMessageDTO, emoji: string) {
    setPickerFor(null);
    const res = await post("/api/chat/reactions", { messageId: m.id, emoji });
    if (res.ok) {
      const j = await res.json();
      setMessages((all) => all.map((x) => (x.id === j.message.id ? j.message : x)));
    }
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={d.title}
          className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(36rem,calc(100vh-7.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-lift sm:inset-x-auto sm:right-5 sm:w-[22.5rem]"
        >
          <header className="flex items-center gap-3 bg-primary px-4 py-3.5 text-on-primary">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-bold">{d.title}</p>
              <p className="flex items-center gap-1.5 text-xs opacity-90">
                <span className={`h-2 w-2 rounded-full ${agentOnline ? "bg-green-400" : "bg-white/50"}`} />
                {agentOnline ? d.online : d.offline}
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label={d.close} className="rounded-full p-1.5 transition hover:bg-white/15">
              <X className="h-5 w-5" />
            </button>
          </header>

          {!conv ? (
            <form onSubmit={start} className="flex flex-col gap-3 overflow-y-auto p-5">
              <p className="rounded-2xl bg-primary-50 p-3.5 text-[0.95rem] leading-relaxed text-ink-soft">{d.welcome}</p>
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={d.namePh}
                autoComplete="name"
                className="h-11 rounded-xl border-2 border-line px-3.5 outline-none transition focus:border-primary"
              />
              <input
                type="tel"
                inputMode="tel"
                maxLength={20}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={d.phonePh}
                autoComplete="tel"
                className="h-11 rounded-xl border-2 border-line px-3.5 outline-none transition focus:border-primary"
              />
              <input
                type="email"
                maxLength={254}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={d.emailPh}
                autoComplete="email"
                className="h-11 rounded-xl border-2 border-line px-3.5 outline-none transition focus:border-primary"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={busy} className="h-11 rounded-full bg-primary font-semibold text-on-primary transition hover:-translate-y-0.5 disabled:opacity-60">
                {busy ? d.starting : d.start}
              </button>
              <p className="text-center text-xs text-subtle">{d.note}</p>
            </form>
          ) : (
            <>
              <div className="min-h-[14rem] flex-1 space-y-2 overflow-y-auto bg-primary-50/40 p-4" onClick={() => setPickerFor(null)}>
                <p className="rounded-2xl bg-white p-3 text-sm leading-relaxed text-ink-soft shadow-soft">{d.welcome}</p>
                {messages.map((m) => {
                  const mine = m.senderType === "VISITOR";
                  return (
                    <div key={m.id} className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`relative max-w-[82%] ${mine ? "text-right" : ""}`}>
                        {!mine && <p className="mb-0.5 ml-1 text-[0.7rem] font-semibold text-subtle">{m.senderName || d.team}</p>}
                        <div
                          className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-left text-[0.95rem] leading-snug ${
                            mine ? "rounded-br-md bg-primary text-on-primary" : "rounded-bl-md bg-white text-ink shadow-soft"
                          } ${m.id.startsWith("tmp-") ? "opacity-60" : ""}`}
                        >
                          {m.body}
                        </div>
                        {m.reactions.length > 0 && (
                          <div className={`mt-1 flex gap-1 ${mine ? "justify-end" : ""}`}>
                            {m.reactions.map((r) => (
                              <span key={r.emoji} className="rounded-full border border-line bg-white px-1.5 text-xs">
                                {r.emoji}
                                {r.count > 1 ? ` ${r.count}` : ""}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className={`mt-0.5 flex items-center gap-1.5 text-[0.68rem] text-subtle ${mine ? "justify-end" : ""}`}>
                          {clock(m.createdAt, intl)}
                          {mine && m.readAt && <CheckCheck className="h-3.5 w-3.5 text-primary" aria-label={d.seen} />}
                          {!mine && !m.id.startsWith("tmp-") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPickerFor(pickerFor === m.id ? null : m.id);
                              }}
                              aria-label={d.react}
                              className="opacity-60 transition hover:opacity-100"
                            >
                              <SmilePlus className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        {pickerFor === m.id && (
                          <div className="absolute left-0 z-10 mt-1 flex gap-1 rounded-full border border-line bg-white px-2 py-1 shadow-lift">
                            {CHAT_REACTIONS.map((e) => (
                              <button key={e} onClick={() => react(m, e)} className="rounded-full px-0.5 text-lg transition hover:scale-125">
                                {e}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {adminTyping > Date.now() && <p className="text-xs italic text-subtle">{d.typing}</p>}
                {conv.status === "CLOSED" && <p className="pt-1 text-center text-xs text-subtle">{d.closedNote}</p>}
                <div ref={endRef} />
              </div>
              {error && <p className="bg-red-50 px-4 py-1.5 text-xs text-red-700">{error}</p>}
              <form onSubmit={send} className="flex items-end gap-2 border-t border-line p-3">
                <textarea
                  value={draft}
                  onChange={(e) => onType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder={d.placeholder}
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border-2 border-line px-3.5 py-2.5 outline-none transition focus:border-primary"
                />
                <button
                  disabled={!draft.trim()}
                  aria-label={d.send}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition hover:scale-105 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? d.close : d.open}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-secondary text-on-secondary shadow-lift transition hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[0.7rem] font-extrabold text-on-accent">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
