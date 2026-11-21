import { db } from "@/lib/db";
import type { ChatConversation } from "@/lib/generated/prisma/client";
import { touchVisitor } from "./presence";
import type { ChatAdmin } from "./request-auth";
import {
  markRead,
  messageInclude,
  sendMessage,
  setConversationStatus,
  setTyping,
  toMessageDTO,
  touchConversation,
} from "./service";
import type { ClientEvent, PollResult, ServerEvent } from "./shared";

/**
 * HTTP (polling) chat transport. Works on every host, including serverless ones.
 * The client polls with the `cursor` it got last; everything newer than that
 * comes back as events. The cursor trails "now" by a couple of seconds so rows
 * committed late are never missed; clients de-duplicate by message id.
 */
const OVERLAP_MS = 2_500;
const AGENT_ONLINE_MS = 45_000;

const parseCursor = (since: string | null) => {
  const t = since ? Date.parse(since) : NaN;
  return Number.isNaN(t) ? null : new Date(t);
};
const nextCursor = () => new Date(Date.now() - OVERLAP_MS).toISOString();

async function agentOnline() {
  const row = await db.chatAgentPresence.findFirst({
    where: { lastSeenAt: { gt: new Date(Date.now() - AGENT_ONLINE_MS) } },
    select: { userId: true },
  });
  return Boolean(row);
}

/* ---------------- visitor ---------------- */

export async function visitorPoll(conversation: ChatConversation, since: string | null): Promise<PollResult> {
  touchVisitor(conversation.id);
  void touchConversation(conversation).catch(() => {});
  const online = await agentOnline();
  const from = parseCursor(since);
  if (!from) return { events: [], cursor: nextCursor(), agentOnline: online };

  const events: ServerEvent[] = [];
  const [incoming, reacted, read, typing, fresh] = await Promise.all([
    db.chatMessage.findMany({
      where: { conversationId: conversation.id, senderType: { in: ["ADMIN", "SYSTEM"] }, createdAt: { gt: from } },
      include: messageInclude,
      orderBy: { createdAt: "asc" },
    }),
    db.chatMessage.findMany({
      where: { conversationId: conversation.id, reactionsUpdatedAt: { gt: from } },
      include: messageInclude,
    }),
    db.chatMessage.findMany({
      where: { conversationId: conversation.id, senderType: "VISITOR", readAt: { gt: from } },
      select: { id: true },
    }),
    db.chatTyping.findFirst({
      where: { conversationId: conversation.id, senderType: "ADMIN", expiresAt: { gt: new Date() } },
    }),
    db.chatConversation.findUnique({ where: { id: conversation.id }, select: { status: true, updatedAt: true } }),
  ]);

  for (const m of incoming) events.push({ t: "message", message: toMessageDTO(m) });
  for (const m of reacted) events.push({ t: "reaction", message: toMessageDTO(m) });
  if (read.length) events.push({ t: "read", conversationId: conversation.id, messageIds: read.map((r) => r.id) });
  if (typing) events.push({ t: "typing", conversationId: conversation.id, name: typing.name, on: true });
  if (fresh && fresh.updatedAt > from) events.push({ t: "status", conversationId: conversation.id, status: fresh.status });
  return { events, cursor: nextCursor(), agentOnline: online };
}

export async function visitorFrame(conversation: ChatConversation, event: ClientEvent): Promise<ServerEvent[]> {
  touchVisitor(conversation.id);
  switch (event.t) {
    case "send": {
      const { message } = await sendMessage({
        conversationId: conversation.id,
        senderType: "VISITOR",
        senderUserId: conversation.userId,
        senderName: conversation.visitorName,
        body: event.body,
        clientId: event.clientId,
      });
      await setTyping(conversation.id, `V:${conversation.id}`, "VISITOR", conversation.visitorName, false);
      return [{ t: "ack", clientId: event.clientId, message }];
    }
    case "typing":
      await setTyping(conversation.id, `V:${conversation.id}`, "VISITOR", conversation.visitorName, event.on);
      return [];
    case "read": {
      await markRead(conversation.id, "VISITOR");
      return [];
    }
    default:
      return [{ t: "error", code: "FORBIDDEN" }];
  }
}

/* ---------------- admin ---------------- */

export async function adminPoll(admin: ChatAdmin, since: string | null): Promise<PollResult> {
  await db.chatAgentPresence.upsert({
    where: { userId: admin.userId },
    update: { lastSeenAt: new Date(), name: admin.name },
    create: { userId: admin.userId, name: admin.name, lastSeenAt: new Date() },
  });
  const from = parseCursor(since);
  if (!from) return { events: [], cursor: nextCursor(), agentOnline: true };

  const events: ServerEvent[] = [];
  const [incoming, reacted, read, typing, started] = await Promise.all([
    db.chatMessage.findMany({
      where: { senderType: "VISITOR", createdAt: { gt: from } },
      include: messageInclude,
      orderBy: { createdAt: "asc" },
      take: 200,
    }),
    db.chatMessage.findMany({ where: { reactionsUpdatedAt: { gt: from } }, include: messageInclude, take: 100 }),
    db.chatMessage.findMany({
      where: { senderType: "ADMIN", readAt: { gt: from } },
      select: { id: true, conversationId: true },
      take: 200,
    }),
    db.chatTyping.findMany({ where: { senderType: "VISITOR", expiresAt: { gt: new Date() } }, take: 50 }),
    db.chatConversation.findMany({ where: { createdAt: { gt: from } }, select: { id: true }, take: 50 }),
  ]);

  for (const c of started) events.push({ t: "conversation", conversationId: c.id });
  for (const m of incoming) events.push({ t: "message", message: toMessageDTO(m) });
  for (const m of reacted) events.push({ t: "reaction", message: toMessageDTO(m) });
  const byConv = new Map<string, string[]>();
  for (const r of read) byConv.set(r.conversationId, [...(byConv.get(r.conversationId) ?? []), r.id]);
  for (const [conversationId, messageIds] of byConv) events.push({ t: "read", conversationId, messageIds });
  for (const t of typing) events.push({ t: "typing", conversationId: t.conversationId, name: t.name, on: true });
  return { events, cursor: nextCursor(), agentOnline: true };
}

export async function adminFrame(admin: ChatAdmin, event: ClientEvent): Promise<ServerEvent[]> {
  const conversationId = event.conversationId;
  if (!conversationId) return [{ t: "error", code: "BAD_FRAME" }];
  const exists = await db.chatConversation.findUnique({ where: { id: conversationId }, select: { id: true } });
  if (!exists) return [{ t: "error", code: "NOT_FOUND" }];

  switch (event.t) {
    case "send": {
      const { message } = await sendMessage({
        conversationId,
        senderType: "ADMIN",
        senderUserId: admin.userId,
        senderName: admin.name,
        body: event.body,
        clientId: event.clientId,
      });
      await markRead(conversationId, "ADMIN");
      await setTyping(conversationId, `A:${admin.userId}`, "ADMIN", admin.name, false);
      return [{ t: "ack", clientId: event.clientId, message }];
    }
    case "typing":
      await setTyping(conversationId, `A:${admin.userId}`, "ADMIN", admin.name, event.on);
      return [];
    case "read": {
      const ids = await markRead(conversationId, "ADMIN");
      return ids.length ? [{ t: "read", conversationId, messageIds: ids }] : [];
    }
    case "status": {
      const c = await setConversationStatus(conversationId, event.status);
      return [{ t: "status", conversationId, status: c.status }];
    }
  }
}
