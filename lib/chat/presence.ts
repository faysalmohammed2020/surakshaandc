import type { ChatMessageDTO } from "./shared";

/**
 * Visitor presence for the admin inbox. Kept in memory per server instance and
 * mirrored to `visitorLastSeenAt` in the database (see service.ts), which the
 * inbox also checks so it keeps working across several instances.
 */
const ONLINE_MS = 20_000;
const seen = new Map<string, number>();

export function touchVisitor(conversationId: string) {
  seen.set(conversationId, Date.now());
  if (seen.size > 5000) {
    const cutoff = Date.now() - 10 * 60_000;
    for (const [k, v] of seen) if (v < cutoff) seen.delete(k);
  }
}

export function isVisitorOnline(conversationId: string): boolean {
  const t = seen.get(conversationId);
  return t !== undefined && Date.now() - t < ONLINE_MS;
}

export const VISITOR_ONLINE_WINDOW_MS = ONLINE_MS;

/** Updating reactionsUpdatedAt emits a transactional PostgreSQL notification. */
export function broadcastReaction(_message: ChatMessageDTO) {}
