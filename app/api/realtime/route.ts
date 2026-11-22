import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Plain GET /api/realtime: tells the browser whether this host accepts WebSockets.
 * The custom Node server (server.ts) sets SURAKSHA_REALTIME=1 and handles the WebSocket
 * upgrade on this same path before Next sees it. On Vercel (no custom server) this
 * returns false, so the client goes straight to its fallback instead of failing to connect.
 */
export function GET() {
  return NextResponse.json(
    { websocket: process.env.SURAKSHA_REALTIME === "1" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
