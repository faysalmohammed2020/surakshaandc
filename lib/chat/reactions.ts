import { db } from "@/lib/db";
import { messageInclude, toMessageDTO } from "./service";
import type { ChatMessageDTO } from "./shared";

/** Opaque participant key stored with each reaction (max 64 chars). */
export const reactionActor = (kind: "ADMIN" | "VISITOR", id: string) => `${kind === "ADMIN" ? "A" : "V"}:${id}`.slice(0, 64);

/** Toggle / change a participant's single reaction on a message. */
export async function reactToMessage(
  conversationId: string,
  messageId: string,
  actor: string,
  emoji: string,
): Promise<ChatMessageDTO | null> {
  const msg = await db.chatMessage.findFirst({ where: { id: messageId, conversationId }, select: { id: true } });
  if (!msg) return null;

  const current = await db.chatReaction.findUnique({ where: { messageId_actor: { messageId, actor } } });
  if (current?.emoji === emoji) {
    await db.chatReaction.delete({ where: { messageId_actor: { messageId, actor } } });
  } else if (current) {
    await db.chatReaction.update({ where: { messageId_actor: { messageId, actor } }, data: { emoji } });
  } else {
    await db.chatReaction.create({ data: { messageId, actor, emoji } });
  }
  const row = await db.chatMessage.update({
    where: { id: messageId },
    data: { reactionsUpdatedAt: new Date() },
    include: messageInclude,
  });
  return toMessageDTO(row);
}
