import { createHash, randomBytes } from "node:crypto";

import { db } from "@/lib/db";
import type { ChatConversation, Prisma } from "@/lib/generated/prisma/client";
import { VISITOR_ONLINE_WINDOW_MS } from "./presence";
import {
  CHAT_LIMITS,
  type AdminConversationDTO,
  type ChatMessageDTO,
  type ChatSender,
  type ChatStatus,
  type VisitorConversationDTO,
} from "./shared";

export const messageInclude = { reactions: true } satisfies Prisma.ChatMessageInclude;
type MessageRow = Prisma.ChatMessageGetPayload<{ include: typeof messageInclude }>;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

export function toMessageDTO(m: MessageRow): ChatMessageDTO {
  const byEmoji = new Map<string, { count: number; visitor: boolean; admin: boolean }>();
  for (const r of m.reactions) {
    const cur = byEmoji.get(r.emoji) ?? { count: 0, visitor: false, admin: false };
    cur.count += 1;
    if (r.actor.startsWith("V:")) cur.visitor = true;
    if (r.actor.startsWith("A:")) cur.admin = true;
    byEmoji.set(r.emoji, cur);
  }
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderType: m.senderType,
    senderName: m.senderName,
    body: m.body,
    imageId: m.imageId,
    clientId: m.clientId,
    createdAt: m.createdAt.toISOString(),
    readAt: iso(m.readAt),
    reactions: [...byEmoji.entries()].map(([emoji, v]) => ({ emoji, ...v })),
  };
}

export function toVisitorConversationDTO(c: ChatConversation): VisitorConversationDTO {
  return { id: c.id, status: c.status, visitorName: c.visitorName, createdAt: c.createdAt.toISOString() };
}

const clean = (v: string | null | undefined, max: number) => {
  const s = v?.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
  return s ? s : null;
};

export async function createConversation(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  locale?: string;
  path?: string;
  userId?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}) {
  const token = randomBytes(32).toString("base64url");
  const conversation = await db.chatConversation.create({
    data: {
      tokenHash: hashToken(token),
      userId: input.userId ?? null,
      visitorName: clean(input.name, CHAT_LIMITS.name) ?? "Visitor",
      visitorEmail: clean(input.email, CHAT_LIMITS.email),
      visitorPhone: clean(input.phone, CHAT_LIMITS.phone),
      locale: input.locale === "bn" ? "bn" : "en",
      startPath: clean(input.path, CHAT_LIMITS.path),
      currentPath: clean(input.path, CHAT_LIMITS.path),
      userAgent: clean(input.userAgent, 512),
      ipHash: input.ip ? hashToken(input.ip) : null,
      visitorLastSeenAt: new Date(),
    },
  });
  return { conversation, token };
}

export async function findConversationByToken(token: string | undefined | null) {
  if (!token || token.length > 128) return null;
  return db.chatConversation.findUnique({ where: { tokenHash: hashToken(token) } });
}

/** Signed-in visitor on a new device: re-issue a token for their latest open thread. */
export async function reclaimConversationForUser(userId: string) {
  const existing = await db.chatConversation.findFirst({
    where: { userId, status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });
  if (!existing) return null;
  const token = randomBytes(32).toString("base64url");
  const conversation = await db.chatConversation.update({
    where: { id: existing.id },
    data: { tokenHash: hashToken(token) },
  });
  return { conversation, token };
}

export async function getMessages(conversationId: string, before: Date | null, limit = 40) {
  const rows = await db.chatMessage.findMany({
    where: { conversationId, ...(before ? { createdAt: { lt: before } } : {}) },
    include: messageInclude,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });
  const hasMore = rows.length > limit;
  return { messages: rows.slice(0, limit).reverse().map(toMessageDTO), hasMore };
}

export async function sendMessage(input: {
  conversationId: string;
  senderType: ChatSender;
  senderUserId?: string | null;
  senderName?: string | null;
  body: string;
  clientId: string;
}): Promise<{ message: ChatMessageDTO; created: boolean }> {
  const existing = await db.chatMessage.findUnique({
    where: { conversationId_clientId: { conversationId: input.conversationId, clientId: input.clientId } },
    include: messageInclude,
  });
  if (existing) return { message: toMessageDTO(existing), created: false };

  const body = input.body.trim().slice(0, CHAT_LIMITS.body);
  const row = await db.chatMessage.create({
    data: {
      conversationId: input.conversationId,
      senderType: input.senderType,
      senderUserId: input.senderUserId ?? null,
      senderName: clean(input.senderName, CHAT_LIMITS.name),
      body,
      clientId: input.clientId,
    },
    include: messageInclude,
  });
  await db.chatConversation.update({
    where: { id: input.conversationId },
    data: {
      lastMessageAt: row.createdAt,
      lastMessagePreview: body.slice(0, 200),
      // A visitor writing again re-opens a closed thread.
      ...(input.senderType === "VISITOR" ? { status: "OPEN", closedAt: null } : {}),
    },
  });
  return { message: toMessageDTO(row), created: true };
}

/** Mark messages from the *other* side as read. Returns the ids that changed. */
export async function markRead(conversationId: string, reader: "VISITOR" | "ADMIN") {
  const from: ChatSender[] = reader === "ADMIN" ? ["VISITOR"] : ["ADMIN", "SYSTEM"];
  const rows = await db.chatMessage.findMany({
    where: { conversationId, senderType: { in: from }, readAt: null },
    select: { id: true },
  });
  if (!rows.length) return [];
  const now = new Date();
  await db.chatMessage.updateMany({ where: { id: { in: rows.map((r) => r.id) } }, data: { readAt: now } });
  return rows.map((r) => r.id);
}

export async function setConversationStatus(conversationId: string, status: ChatStatus) {
  return db.chatConversation.update({
    where: { id: conversationId },
    data: { status, closedAt: status === "CLOSED" ? new Date() : null },
  });
}

export async function setTyping(
  conversationId: string,
  actor: string,
  senderType: ChatSender,
  name: string,
  on: boolean,
) {
  if (!on) {
    await db.chatTyping.deleteMany({ where: { conversationId, actor } });
    return;
  }
  const expiresAt = new Date(Date.now() + 6_000);
  await db.chatTyping.upsert({
    where: { conversationId_actor: { conversationId, actor } },
    update: { expiresAt, name, senderType },
    create: { conversationId, actor, senderType, name, expiresAt },
  });
}

const online = (c: { id: string; visitorLastSeenAt: Date | null }, isOnline?: (id: string) => boolean) =>
  Boolean(isOnline?.(c.id)) ||
  (c.visitorLastSeenAt ? Date.now() - c.visitorLastSeenAt.getTime() < VISITOR_ONLINE_WINDOW_MS : false);

export async function listConversations(opts: {
  status: ChatStatus | "ALL";
  q?: string;
  isOnline?: (id: string) => boolean;
}): Promise<AdminConversationDTO[]> {
  const q = opts.q?.trim().slice(0, 100);
  const rows = await db.chatConversation.findMany({
    where: {
      ...(opts.status !== "ALL" ? { status: opts.status } : {}),
      ...(q
        ? {
            OR: [
              { visitorName: { contains: q, mode: "insensitive" } },
              { visitorEmail: { contains: q, mode: "insensitive" } },
              { visitorPhone: { contains: q } },
              { lastMessagePreview: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastMessageAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: 200,
  });
  const unread = await db.chatMessage.groupBy({
    by: ["conversationId"],
    where: { conversationId: { in: rows.map((r) => r.id) }, senderType: "VISITOR", readAt: null },
    _count: { _all: true },
  });
  const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count._all]));
  return rows.map((c) => toAdminDTO(c, online(c, opts.isOnline), unreadMap.get(c.id) ?? 0));
}

export function toAdminDTO(c: ChatConversation, isOnline: boolean, unreadCount: number): AdminConversationDTO {
  return {
    id: c.id,
    status: c.status,
    visitorName: c.visitorName,
    visitorEmail: c.visitorEmail,
    visitorPhone: c.visitorPhone,
    locale: c.locale,
    startPath: c.startPath,
    currentPath: c.currentPath,
    online: isOnline,
    unreadCount,
    lastMessageAt: iso(c.lastMessageAt),
    lastMessagePreview: c.lastMessagePreview,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function adminConversationSummary(id: string, isOnline: boolean) {
  const c = await db.chatConversation.findUnique({ where: { id } });
  if (!c) return null;
  const unread = await db.chatMessage.count({ where: { conversationId: id, senderType: "VISITOR", readAt: null } });
  return toAdminDTO(c, isOnline || online(c), unread);
}

/** Record the page the visitor is on and that they are still here. */
export async function touchConversation(c: ChatConversation, path?: string | null) {
  const stale = !c.visitorLastSeenAt || Date.now() - c.visitorLastSeenAt.getTime() > 10_000;
  const pathChanged = path && path !== c.currentPath;
  if (!stale && !pathChanged) return;
  await db.chatConversation.update({
    where: { id: c.id },
    data: { visitorLastSeenAt: new Date(), ...(pathChanged ? { currentPath: clean(path, CHAT_LIMITS.path) } : {}) },
  });
}
