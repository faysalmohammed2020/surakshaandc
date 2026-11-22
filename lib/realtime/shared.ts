export type RealtimeEvent = {
  /**
   * Server events: sync, chat, enquiries, counts, presence, analytics, blogs.
   * "poll" is client-only: emitted on a timer while the WebSocket is unavailable
   * (e.g. on Vercel, which cannot hold sockets), so pages still update.
   */
  scope: "sync" | "chat" | "enquiries" | "counts" | "presence" | "analytics" | "blogs" | "poll";
  conversationId?: string;
  userId?: string;
  online?: boolean;
};

export const SERVER_SCOPES: readonly RealtimeEvent["scope"][] = [
  "sync", "chat", "enquiries", "counts", "presence", "analytics", "blogs",
];

export type RealtimeIdentity =
  | { role: "admin"; userId: string; name: string }
  | { role: "visitor"; conversationId: string };
