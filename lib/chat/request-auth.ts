import type { NextRequest } from "next/server";
import type { ChatConversation } from "@/lib/generated/prisma/client";
import { getAdminUser } from "@/lib/auth-admin";
import { findConversationByToken } from "./service";
import { CHAT_COOKIE } from "./shared";

export type ChatAdmin = { userId: string; name: string };

export type ChatIdentity =
  | { role: "admin"; admin: ChatAdmin }
  | { role: "visitor"; conversation: ChatConversation };

/** Signed-in ADMIN (from the NextAuth session), or null. */
export async function chatAdmin(): Promise<ChatAdmin | null> {
  const a = await getAdminUser();
  return a ? { userId: a.id, name: a.name } : null;
}

/** `?as=admin` selects the admin inbox; otherwise the visitor is identified by their chat cookie. */
export async function identifyChatRequest(request: NextRequest): Promise<ChatIdentity | null> {
  if (request.nextUrl.searchParams.get("as") === "admin") {
    const admin = await chatAdmin();
    return admin ? { role: "admin", admin } : null;
  }
  const conversation = await findConversationByToken(request.cookies.get(CHAT_COOKIE)?.value);
  return conversation ? { role: "visitor", conversation } : null;
}
