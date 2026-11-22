import type { IncomingMessage, Server } from "node:http";
import { readFile } from "node:fs/promises";
import type { Duplex } from "node:stream";
import { Client, Pool } from "pg";
import { WebSocket, WebSocketServer } from "ws";
import type { RealtimeEvent, RealtimeIdentity } from "./shared";
import { isAllowedOrigin } from "../security/same-origin";

type Peer = { identity: RealtimeIdentity; cookie: string; alive: boolean; checking: boolean };

/** One listener per Node process; PostgreSQL fans committed changes out to all instances. */
export async function attachRealtime(server: Server, port: number) {
  const connectionString = process.env.REALTIME_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for realtime");
  const pool = new Pool({ connectionString, max: 3, connectionTimeoutMillis: 10_000 });
  pool.on("error", error => console.error("[realtime] database pool error:", error.message));
  const setup = await pool.connect();
  try {
    await setup.query("BEGIN");
    await setup.query("SELECT pg_advisory_xact_lock(hashtext('suraksha_realtime_setup'))");
    await setup.query(await readFile("prisma/realtime.sql", "utf8"));
    await setup.query("COMMIT");
  } catch (error) {
    await setup.query("ROLLBACK");
    throw error;
  } finally { setup.release(); }

  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024, perMessageDeflate: false });
  const peers = new Map<WebSocket, Peer>();
  let stopped = false;
  let listener: Client | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let retryDelay = 1000;

  function send(ws: WebSocket, event: RealtimeEvent) {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (ws.bufferedAmount > 256 * 1024) { ws.close(1013, "Slow connection"); return; }
    ws.send(JSON.stringify(event));
  }
  // Analytics rows arrive with every visitor heartbeat. Fan out at most one "analytics"
  // event per ANALYTICS_GAP_MS, plus one trailing event after the live-users window
  // (1 min) so "Live now" drops to zero after the last visitor leaves.
  const ANALYTICS_GAP_MS = 3000;
  const LIVE_WINDOW_MS = 61_000;
  let analyticsLastSent = 0;
  let analyticsTimer: ReturnType<typeof setTimeout> | undefined;
  let analyticsQuiet: ReturnType<typeof setTimeout> | undefined;
  function sendAnalytics() {
    analyticsTimer = undefined;
    analyticsLastSent = Date.now();
    deliver({ scope: "analytics" });
  }
  function broadcast(event: RealtimeEvent) {
    if (event.scope !== "analytics") { deliver(event); return; }
    clearTimeout(analyticsQuiet);
    analyticsQuiet = setTimeout(sendAnalytics, LIVE_WINDOW_MS);
    if (analyticsTimer) return;
    const wait = analyticsLastSent + ANALYTICS_GAP_MS - Date.now();
    if (wait <= 0) sendAnalytics();
    else analyticsTimer = setTimeout(sendAnalytics, wait);
  }
  function deliver(event: RealtimeEvent) {
    for (const [ws, { identity }] of peers) {
      if (identity.role === "admin") {
        if (event.scope !== "counts" || event.userId === identity.userId) send(ws, event);
      } else if (event.scope === "chat" && event.conversationId === identity.conversationId) {
        send(ws, event);
      }
    }
  }
  async function listen() {
    const client = new Client({ connectionString, connectionTimeoutMillis: 10_000, keepAlive: true });
    listener = client;
    let failed = false;
    function recover(error?: Error) {
      if (failed || stopped) return;
      failed = true;
      console.error("[realtime] notification listener disconnected:", error?.message ?? "connection ended");
      void client.end().catch(() => {});
      retry = setTimeout(() => { void listen(); }, retryDelay);
      retryDelay = Math.min(30_000, retryDelay * 2);
    }
    client.on("error", recover);
    client.on("end", () => recover());
    client.on("notification", notification => {
      if (notification.channel !== "suraksha_realtime" || !notification.payload) return;
      try { broadcast(JSON.parse(notification.payload) as RealtimeEvent); } catch { /* Ignore malformed notifications. */ }
    });
    try {
      await client.connect();
      await client.query("LISTEN suraksha_realtime");
      retryDelay = 1000;
      // Reload after a listener outage; notifications during disconnect are not durable.
      for (const ws of peers.keys()) send(ws, { scope: "sync" });
    } catch (error) { recover(error as Error); }
  }
  await listen();

  const sameIdentity = (a: RealtimeIdentity, b: RealtimeIdentity) =>
    a.role === b.role && (a.role === "admin" && b.role === "admin" ? a.userId === b.userId
      : a.role === "visitor" && b.role === "visitor" && a.conversationId === b.conversationId);

  async function authenticate(cookie: string, admin: boolean): Promise<RealtimeIdentity | null> {
    const response = await fetch(`http://127.0.0.1:${port}/api/realtime/session${admin ? "?as=admin" : ""}`, {
      headers: { cookie }, signal: AbortSignal.timeout(10_000), redirect: "error",
    });
    if (!response.ok) return null;
    return response.json();
  }
  async function presence(ws: WebSocket, peer: Peer) {
    if (peer.checking) return;
    peer.checking = true;
    try {
      const current = await authenticate(peer.cookie, peer.identity.role === "admin");
      if (!current || !sameIdentity(current, peer.identity)) { ws.close(4401, "Session expired"); return; }
      const now = new Date();
      if (current.role === "admin") {
        await pool.query('INSERT INTO "chat_agent_presence" ("user_id", "name", "last_seen_at") VALUES ($1, $2, $3) ON CONFLICT ("user_id") DO UPDATE SET "name" = $2, "last_seen_at" = $3', [current.userId, current.name, now]);
        send(ws, { scope: "presence" });
      } else {
        await pool.query('UPDATE "chat_conversations" SET "visitor_last_seen_at" = $2 WHERE "id" = $1', [current.conversationId, now]);
        const { rows } = await pool.query<{ online: boolean }>('SELECT EXISTS (SELECT 1 FROM "chat_agent_presence" WHERE "last_seen_at" > $1) AS online', [new Date(Date.now() - 45_000)]);
        send(ws, { scope: "presence", online: rows[0].online });
      }
    } catch (error) { console.error("[realtime] presence check failed:", (error as Error).message); }
    finally { peer.checking = false; }
  }

  async function upgrade(request: IncomingMessage, socket: Duplex, head: Buffer) {
    const reject = (status: number) => { if (!socket.destroyed) socket.end(`HTTP/1.1 ${status} Rejected\r\nConnection: close\r\n\r\n`); };
    try {
      if (!isAllowedOrigin(request.headers.origin, request.headers)) { reject(403); return; }
      const cookie = request.headers.cookie ?? "";
      const admin = new URL(request.url ?? "/", "http://localhost").searchParams.get("as") === "admin";
      const identity = await authenticate(cookie, admin);
      if (!identity) { reject(401); return; }
      if (peers.size >= 2000 || [...peers.values()].filter(peer => sameIdentity(peer.identity, identity)).length >= 10) {
        reject(429); return;
      }
      if (socket.destroyed) return;
      wss.handleUpgrade(request, socket, head, ws => {
        const peer: Peer = { identity, cookie, alive: true, checking: false };
        peers.set(ws, peer);
        ws.on("pong", () => { peer.alive = true; });
        ws.on("error", () => { ws.terminate(); });
        // Writes use the existing authenticated, validated HTTP APIs.
        ws.on("message", () => { ws.close(1008, "Receive-only channel"); });
        ws.on("close", () => { peers.delete(ws); });
        send(ws, { scope: "sync" });
        void presence(ws, peer);
      });
    } catch { reject(503); }
  }
  const heartbeat = setInterval(() => {
    for (const [ws, peer] of peers) {
      if (!peer.alive) { ws.terminate(); continue; }
      peer.alive = false;
      ws.ping();
      void presence(ws, peer);
    }
  }, 15_000);
  heartbeat.unref();

  return {
    upgrade,
    async close() {
      stopped = true;
      clearInterval(heartbeat);
      clearTimeout(retry);
      clearTimeout(analyticsTimer);
      clearTimeout(analyticsQuiet);
      for (const ws of peers.keys()) ws.terminate();
      wss.close();
      await listener?.end().catch(() => {});
      await pool.end();
    },
  };
}
