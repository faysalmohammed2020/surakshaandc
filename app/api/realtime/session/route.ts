import { NextRequest, NextResponse } from "next/server";
import { identifyChatRequest } from "@/lib/chat/request-auth";
import type { RealtimeIdentity } from "@/lib/realtime/shared";

export const dynamic = "force-dynamic";

/** Used by the socket upgrade to reuse the application's current auth checks. */
export async function GET(request: NextRequest) {
  const identity = await identifyChatRequest(request);
  const headers = { "Cache-Control": "private, no-store" };
  if (!identity) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const result: RealtimeIdentity = identity.role === "admin"
    ? { role: "admin", userId: identity.admin.userId, name: identity.admin.name }
    : { role: "visitor", conversationId: identity.conversation.id };
  return NextResponse.json(result, { headers });
}
