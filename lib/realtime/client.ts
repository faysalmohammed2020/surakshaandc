"use client";

import { SERVER_SCOPES, type RealtimeEvent } from "./shared";

type Handler = (event: RealtimeEvent) => void;
type Channel = { listeners: Set<Handler>; socket?: WebSocket; fallback: boolean; stop: () => void };
const channels = new Map<"admin" | "visitor", Channel>();

/** While the socket is down (or the host has none, like Vercel) listeners get "poll" ticks. */
const FALLBACK_VISIBLE_MS = 3000;
const FALLBACK_HIDDEN_MS = 15_000;
/** How long to wait for the first connection before switching to fallback ticks. */
const FALLBACK_AFTER_MS = 5000;

/**
 * Sidebar and admin pages share one socket, including across route changes.
 * The socket is the primary transport; "poll" ticks only run while it is unavailable.
 */
export function subscribeRealtime(role: "admin" | "visitor", listener: Handler) {
  let channel = channels.get(role);
  if (!channel) {
    const listeners = new Set<Handler>();
    let stopped = false;
    let retry: ReturnType<typeof setTimeout>;
    let tick: ReturnType<typeof setTimeout> | undefined;
    let delay = 500;
    const created: Channel = { listeners, fallback: false, stop };
    channel = created;
    channels.set(role, channel);

    const emit = (event: RealtimeEvent) => { for (const handler of listeners) handler(event); };

    function scheduleTick() {
      clearTimeout(tick);
      if (stopped || !created.fallback) return;
      tick = setTimeout(() => {
        if (!created.fallback || stopped) return;
        emit({ scope: "poll" });
        scheduleTick();
      }, document.hidden ? FALLBACK_HIDDEN_MS : FALLBACK_VISIBLE_MS);
    }
    function enterFallback() {
      if (created.fallback || stopped) return;
      created.fallback = true;
      emit({ scope: "sync" }); // catch up once, then tick
      scheduleTick();
    }
    function leaveFallback() {
      created.fallback = false;
      clearTimeout(tick);
    }
    const firstWait = setTimeout(() => {
      if (created.socket?.readyState !== WebSocket.OPEN) enterFallback();
    }, FALLBACK_AFTER_MS);

    function connect() {
      if (stopped || !navigator.onLine || (created.socket && created.socket.readyState < WebSocket.CLOSING)) return;
      clearTimeout(retry);
      const url = new URL("/api/realtime", window.location.href);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      if (role === "admin") url.searchParams.set("as", "admin");
      const socket = new WebSocket(url);
      created.socket = socket;
      const timeout = setTimeout(() => { if (socket.readyState === WebSocket.CONNECTING) socket.close(); }, 10_000);
      socket.onopen = () => { clearTimeout(timeout); delay = 500; leaveFallback(); };
      socket.onmessage = message => {
        try {
          const event: RealtimeEvent = JSON.parse(message.data);
          if (SERVER_SCOPES.includes(event.scope)) emit(event);
        } catch { /* Ignore invalid frames. */ }
      };
      socket.onclose = event => {
        clearTimeout(timeout);
        if (stopped || event.code === 4401) return;
        enterFallback();
        retry = setTimeout(connect, delay + Math.random() * 250);
        delay = Math.min(delay * 2, 30_000);
      };
      socket.onerror = () => { socket.close(); };
    }
    function onVisibility() { if (created.fallback) scheduleTick(); }
    function stop() {
      stopped = true;
      clearTimeout(retry);
      clearTimeout(tick);
      clearTimeout(firstWait);
      created.socket?.close();
      window.removeEventListener("online", connect);
      window.removeEventListener("focus", connect);
      document.removeEventListener("visibilitychange", onVisibility);
    }
    window.addEventListener("online", connect);
    window.addEventListener("focus", connect);
    document.addEventListener("visibilitychange", onVisibility);
    connect();
  }
  channel.listeners.add(listener);
  if (channel.socket?.readyState === WebSocket.OPEN) queueMicrotask(() => {
    if (channel.listeners.has(listener)) listener({ scope: "sync" });
  });
  return () => {
    channel.listeners.delete(listener);
    if (channel.listeners.size === 0) { channel.stop(); channels.delete(role); }
  };
}

/** Do not lose a change arriving while the previous refresh is still running. */
export function coalescedRefresh(task: () => Promise<void>) {
  let running = false;
  let queued = false;
  let stopped = false;
  async function refresh() {
    queued = true;
    if (running || stopped) return;
    running = true;
    try {
      while (queued && !stopped) {
        queued = false;
        try { await task(); } catch (error) { console.error("[realtime] refresh failed:", error); }
      }
    } finally { running = false; }
  }
  return { refresh, stop: () => { stopped = true; } };
}

/** For fallback "poll" ticks: true at most once every `ms` (heavier pages check less often). */
export function every(ms: number) {
  let last = 0;
  return () => {
    const now = Date.now();
    if (now - last < ms) return false;
    last = now;
    return true;
  };
}
