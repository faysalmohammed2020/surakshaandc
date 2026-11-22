"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, Circle, Globe, Mail, MessageSquare, Phone, Search, Send, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { coalescedRefresh, every, subscribeRealtime } from "@/lib/realtime/client";
import {
  CHAT_REACTIONS,
  type AdminConversationDTO,
  type ChatMessageDTO,
  type PollResult,
  type ServerEvent,
} from "@/lib/chat/shared";

type Filter = "OPEN" | "CLOSED" | "ALL";

const newId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "");

const timeOf = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }) : "";

async function post(path: string, body: unknown) {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export default function AdminChat() {
  const [filter, setFilter] = useState<Filter>("OPEN");
  const [q, setQ] = useState("");
  const [list, setList] = useState<AdminConversationDTO[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<AdminConversationDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [typing, setTyping] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState("");
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [error, setError] = useState("");

  const activeRef = useRef<string | null>(null);
  const cursor = useRef<string | null>(new Date(Date.now() - 2500).toISOString());
  const bottom = useRef<HTMLDivElement>(null);
  const typingSentAt = useRef(0);
  const filterRef = useRef(filter);
  const qRef = useRef(q);
  activeRef.current = activeId;
  filterRef.current = filter;
  qRef.current = q;

  const loadList = useCallback(async () => {
    try {
      const sp = new URLSearchParams({ status: filterRef.current });
      if (qRef.current.trim()) sp.set("q", qRef.current.trim());
      const res = await fetch(`/api/admin/chat/conversations?${sp}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setList((await res.json()).conversations);
      setError("");
    } catch {
      setError("Could not load conversations.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadActive = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/chat/conversations/${id}`, { cache: "no-store" });
    if (!res.ok || activeRef.current !== id) return;
    const j = await res.json();
    setActive(j.conversation);
    setMessages(j.messages);
    setHasMore(j.hasMore);
    void post("/api/chat/poll?as=admin", { t: "read", conversationId: id });
    setList((l) => l.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
  }, []);

  useEffect(() => {
    setLoadingList(true);
    const t = setTimeout(loadList, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [filter, q, loadList]);

  useEffect(() => {
    if (!activeId) return;
    setActive(null);
    setMessages([]);
    void loadActive(activeId);
  }, [activeId, loadActive]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length, activeId]);

  const apply = useCallback(
    (events: ServerEvent[]) => {
      let refresh = false;
      for (const ev of events) {
        const cur = activeRef.current;
        if (ev.t === "message") {
          refresh = true;
          if (ev.message.conversationId === cur) {
            setMessages((m) => (m.some((x) => x.id === ev.message.id) ? m : [...m, ev.message]));
            void post("/api/chat/poll?as=admin", { t: "read", conversationId: cur });
          }
        } else if (ev.t === "conversation") refresh = true;
        else if (ev.t === "reaction" && ev.message.conversationId === cur)
          setMessages((m) => m.map((x) => (x.id === ev.message.id ? ev.message : x)));
        else if (ev.t === "read" && ev.conversationId === cur) {
          const ids = new Set(ev.messageIds);
          setMessages((m) => m.map((x) => (ids.has(x.id) ? { ...x, readAt: x.readAt ?? new Date().toISOString() } : x)));
        } else if (ev.t === "typing" && ev.on) setTyping((t) => ({ ...t, [ev.conversationId]: Date.now() + 5000 }));
      }
      if (refresh) void loadList();
    },
    [loadList],
  );

  // Fetch committed changes only when the socket signals new activity.
  useEffect(() => {
    let stop = false;
    const updates = coalescedRefresh(async () => {
      try {
        const url = `/api/chat/poll?as=admin${cursor.current ? `&since=${encodeURIComponent(cursor.current)}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok && !stop) {
          const j: PollResult = await res.json();
          cursor.current = j.cursor;
          apply(j.events);
        }
      } catch {}
    });
    const listDue = every(15_000);
    const unsubscribe = subscribeRealtime("admin", event => {
      if (event.scope === "sync") {
        void loadList();
        if (activeRef.current) void loadActive(activeRef.current);
        void updates.refresh();
      } else if (event.scope === "chat") void updates.refresh();
      else if (event.scope === "presence") void loadList();
      else if (event.scope === "poll") {
        // Socket unavailable: fetch new events each tick, online dots every 15 s.
        void updates.refresh();
        if (listDue()) void loadList();
      }
    });
    return () => {
      stop = true;
      updates.stop();
      unsubscribe();
    };
  }, [apply, loadList, loadActive]);

  async function send() {
    const body = draft.trim();
    if (!body || !activeId) return;
    const clientId = newId();
    setDraft("");
    const optimistic: ChatMessageDTO = {
      id: `tmp-${clientId}`,
      conversationId: activeId,
      senderType: "ADMIN",
      senderName: "You",
      body,
      imageId: null,
      clientId,
      createdAt: new Date().toISOString(),
      readAt: null,
      reactions: [],
    };
    setMessages((m) => [...m, optimistic]);
    try {
      const res = await post("/api/chat/poll?as=admin", { t: "send", conversationId: activeId, clientId, body });
      const j = await res.json();
      const ack = (j.events as ServerEvent[] | undefined)?.find((e) => e.t === "ack");
      if (!res.ok || !ack || ack.t !== "ack") throw new Error();
      setMessages((m) => m.map((x) => (x.clientId === clientId ? ack.message : x)));
      void loadList();
    } catch {
      setMessages((m) => m.filter((x) => x.clientId !== clientId));
      setDraft(body);
      setError("Message was not sent. Try again.");
    }
  }

  function onType(v: string) {
    setDraft(v);
    if (!activeId || Date.now() - typingSentAt.current < 3000) return;
    typingSentAt.current = Date.now();
    void post("/api/chat/poll?as=admin", { t: "typing", conversationId: activeId, on: true });
  }

  async function setStatus(status: "OPEN" | "CLOSED") {
    if (!activeId) return;
    await post("/api/chat/poll?as=admin", { t: "status", conversationId: activeId, status });
    setActive((a) => (a ? { ...a, status } : a));
    void loadList();
  }

  async function react(m: ChatMessageDTO, emoji: string) {
    setPickerFor(null);
    const res = await post("/api/chat/reactions", { conversationId: m.conversationId, messageId: m.id, emoji });
    if (res.ok) {
      const j = await res.json();
      setMessages((all) => all.map((x) => (x.id === j.message.id ? j.message : x)));
    }
  }

  async function loadOlder() {
    if (!activeId || !messages.length) return;
    const res = await fetch(`/api/admin/chat/conversations/${activeId}?before=${encodeURIComponent(messages[0].createdAt)}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const j = await res.json();
    setMessages((m) => [...j.messages, ...m]);
    setHasMore(j.hasMore);
  }

  const visitorTyping = activeId ? (typing[activeId] ?? 0) > Date.now() : false;
  useEffect(() => {
    if (!visitorTyping) return;
    const t = setTimeout(() => setTyping((x) => ({ ...x })), 5200);
    return () => clearTimeout(t);
  }, [visitorTyping, typing]);

  const unreadTotal = useMemo(() => list.reduce((n, c) => n + c.unreadCount, 0), [list]);

  return (
    <div className="p-4 md:p-6">
      <div className="grid h-[calc(100vh-8.5rem)] min-h-[32rem] overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-[22rem_1fr]">
        {/* ---------- inbox ---------- */}
        <aside className={cn("flex min-h-0 flex-col border-border md:border-e", activeId && "hidden md:flex")}>
          <div className="space-y-3 border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">Live chat</h1>
              {unreadTotal > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{unreadTotal} new</span>
              )}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, phone, email…"
                className="h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
            </div>
            <div className="flex gap-1.5">
              {(["OPEN", "CLOSED", "ALL"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f === "OPEN" ? "Open" : f === "CLOSED" ? "Closed" : "All"}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingList && !list.length ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : list.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <MessageSquare className="mx-auto mb-2 size-8 opacity-40" />
                No conversations yet. They appear here when a visitor starts a chat on the website.
              </div>
            ) : (
              list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-start transition hover:bg-muted/60",
                    activeId === c.id && "bg-muted",
                  )}
                >
                  <span className="relative mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {c.visitorName.slice(0, 1).toUpperCase()}
                    <Circle
                      className={cn("absolute -bottom-0.5 -end-0.5 size-3.5 rounded-full border-2 border-card", c.online ? "fill-green-500 text-green-500" : "fill-muted-foreground/40 text-muted-foreground/40")}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{c.visitorName}</span>
                      <span className="shrink-0 text-[0.7rem] text-muted-foreground">{timeOf(c.lastMessageAt ?? c.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">{c.lastMessagePreview ?? "No messages yet"}</span>
                      {c.unreadCount > 0 && (
                        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[0.7rem] font-bold text-primary-foreground">
                          {c.unreadCount}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ---------- conversation ---------- */}
        <section className={cn("flex min-h-0 flex-col", !activeId && "hidden md:flex")}>
          {!activeId ? (
            <div className="grid flex-1 place-items-center p-8 text-center text-muted-foreground">
              <div>
                <MessageSquare className="mx-auto mb-3 size-10 opacity-40" />
                Select a conversation to reply.
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-border p-4">
                <button className="rounded-lg p-2 hover:bg-muted md:hidden" onClick={() => setActiveId(null)} aria-label="Back">
                  <ArrowLeft className="size-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{active?.visitorName ?? "…"}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className={cn("font-semibold", active?.online ? "text-green-600" : "")}>{active?.online ? "Online" : "Offline"}</span>
                    {active?.visitorPhone && (
                      <a href={`tel:${active.visitorPhone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                        <Phone className="size-3" /> {active.visitorPhone}
                      </a>
                    )}
                    {active?.visitorEmail && (
                      <a href={`mailto:${active.visitorEmail}`} className="inline-flex items-center gap-1 hover:text-foreground">
                        <Mail className="size-3" /> {active.visitorEmail}
                      </a>
                    )}
                    {active?.currentPath && (
                      <span className="inline-flex items-center gap-1">
                        <Globe className="size-3" /> {active.currentPath} · {active.locale.toUpperCase()}
                      </span>
                    )}
                  </p>
                </div>
                {active && (
                  <Button variant="outline" size="sm" onClick={() => setStatus(active.status === "OPEN" ? "CLOSED" : "OPEN")}>
                    {active.status === "OPEN" ? "Close chat" : "Reopen"}
                  </Button>
                )}
              </header>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-muted/30 p-4" onClick={() => setPickerFor(null)}>
                {hasMore && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={loadOlder}>
                      Load earlier messages
                    </Button>
                  </div>
                )}
                {messages.map((m) => {
                  const mine = m.senderType === "ADMIN";
                  return (
                    <div key={m.id} className={cn("group flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("relative max-w-[78%]", mine && "text-end")}>
                        <div
                          className={cn(
                            "inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-start text-sm shadow-sm",
                            mine ? "rounded-ee-md bg-primary text-primary-foreground" : "rounded-es-md border border-border bg-card",
                            m.id.startsWith("tmp-") && "opacity-60",
                          )}
                        >
                          {m.body}
                        </div>
                        {m.reactions.length > 0 && (
                          <div className={cn("mt-1 flex gap-1", mine && "justify-end")}>
                            {m.reactions.map((r) => (
                              <span key={r.emoji} className="rounded-full border border-border bg-card px-1.5 py-0.5 text-xs">
                                {r.emoji} {r.count > 1 ? r.count : ""}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className={cn("mt-0.5 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground", mine && "justify-end")}>
                          {timeOf(m.createdAt)}
                          {mine && m.readAt && <CheckCheck className="size-3.5 text-primary" aria-label="Seen" />}
                          {!m.id.startsWith("tmp-") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPickerFor(pickerFor === m.id ? null : m.id);
                              }}
                              className="opacity-0 transition group-hover:opacity-100"
                              aria-label="React"
                            >
                              <SmilePlus className="size-3.5" />
                            </button>
                          )}
                        </div>
                        {pickerFor === m.id && (
                          <div className={cn("absolute z-10 mt-1 flex gap-1 rounded-full border border-border bg-popover px-2 py-1 shadow-lg", mine ? "end-0" : "start-0")}>
                            {CHAT_REACTIONS.map((e) => (
                              <button key={e} onClick={() => react(m, e)} className="rounded-full px-1 text-lg transition hover:scale-125">
                                {e}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {visitorTyping && <p className="text-xs italic text-muted-foreground">{active?.visitorName ?? "Visitor"} is typing…</p>}
                <div ref={bottom} />
              </div>

              {error && <p className="border-t border-border bg-destructive/10 px-4 py-2 text-xs text-destructive">{error}</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
                className="flex items-end gap-2 border-t border-border p-3"
              >
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
                  placeholder="Write a reply… (Enter to send, Shift+Enter for a new line)"
                  className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                />
                <Button type="submit" disabled={!draft.trim()}>
                  <Send /> Send
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
