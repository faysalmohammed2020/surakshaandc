/** Constants, DTOs and the wire protocol shared by the chat API, the widget and the admin inbox. */

export const CHAT_COOKIE = "sk_chat";
export const CHAT_FLAG_COOKIE = "sk_chat_on";
export const CHAT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const CHAT_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  path: 512,
  body: 2000,
  frame: 8 * 1024,
} as const;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CHAT_REACTIONS = ["👍", "❤️", "😊", "🙏", "👏"] as const;
export type ChatReactionEmoji = (typeof CHAT_REACTIONS)[number];
export const isChatReaction = (v: unknown): v is ChatReactionEmoji =>
  typeof v === "string" && (CHAT_REACTIONS as readonly string[]).includes(v);

export type ChatSender = "VISITOR" | "ADMIN" | "SYSTEM";
export type ChatStatus = "OPEN" | "CLOSED";

export type ChatReactionDTO = { emoji: string; count: number; visitor: boolean; admin: boolean };

export type ChatMessageDTO = {
  id: string;
  conversationId: string;
  senderType: ChatSender;
  senderName: string | null;
  body: string;
  imageId: string | null;
  clientId: string;
  createdAt: string;
  readAt: string | null;
  reactions: ChatReactionDTO[];
};

export type VisitorConversationDTO = {
  id: string;
  status: ChatStatus;
  visitorName: string;
  createdAt: string;
};

export type AdminConversationDTO = {
  id: string;
  status: ChatStatus;
  visitorName: string;
  visitorEmail: string | null;
  visitorPhone: string | null;
  locale: string;
  startPath: string | null;
  currentPath: string | null;
  online: boolean;
  unreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  createdAt: string;
};

/* ---------- wire protocol (HTTP polling) ---------- */

export type ClientEvent =
  | { t: "send"; clientId: string; body: string; conversationId?: string }
  | { t: "typing"; on: boolean; conversationId?: string }
  | { t: "read"; conversationId?: string }
  | { t: "status"; conversationId: string; status: ChatStatus };

export type ServerEvent =
  | { t: "message"; message: ChatMessageDTO }
  | { t: "ack"; clientId: string; message: ChatMessageDTO }
  | { t: "reaction"; message: ChatMessageDTO }
  | { t: "typing"; conversationId: string; name: string; on: boolean }
  | { t: "read"; conversationId: string; messageIds: string[] }
  | { t: "status"; conversationId: string; status: ChatStatus }
  | { t: "conversation"; conversationId: string }
  | { t: "error"; code: string; clientId?: string };

export type PollResult = { events: ServerEvent[]; cursor: string; agentOnline: boolean };

const CLIENT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

/** Validate an untrusted client frame. */
export function parseClientEvent(raw: string): ClientEvent | null {
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const cid = typeof o.conversationId === "string" && UUID_RE.test(o.conversationId) ? o.conversationId : undefined;
  if (typeof o.conversationId === "string" && !cid) return null;

  switch (o.t) {
    case "send": {
      if (typeof o.clientId !== "string" || !CLIENT_ID_RE.test(o.clientId)) return null;
      if (typeof o.body !== "string") return null;
      const body = o.body.trim();
      if (!body || body.length > CHAT_LIMITS.body) return null;
      return { t: "send", clientId: o.clientId, body, conversationId: cid };
    }
    case "typing":
      return { t: "typing", on: o.on === true, conversationId: cid };
    case "read":
      return { t: "read", conversationId: cid };
    case "status":
      if (!cid || (o.status !== "OPEN" && o.status !== "CLOSED")) return null;
      return { t: "status", conversationId: cid, status: o.status };
    default:
      return null;
  }
}
