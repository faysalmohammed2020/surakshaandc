/** Start two production instances on 3100/3101, then run npm run test:realtime. */
import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash, randomUUID } from "node:crypto";
import { encode } from "next-auth/jwt";
import { WebSocket } from "ws";
import { db } from "../lib/db";
import { getAuthSecret } from "../lib/auth-secret";
import type { RealtimeEvent } from "../lib/realtime/shared";

const first = process.env.REALTIME_TEST_URL || "http://localhost:3100";
const second = process.env.REALTIME_TEST_SECOND_URL || "http://localhost:3101";
const origin = new URL(process.env.NEXTAUTH_URL || first).origin;

async function connect(base: string, cookie: string, admin = false) {
  const url = new URL(`/api/realtime${admin ? "?as=admin" : ""}`, base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const events: RealtimeEvent[] = [];
  const socket = new WebSocket(url, { headers: { Cookie: cookie, Origin: origin } });
  socket.on("message", raw => events.push(JSON.parse(raw.toString())));
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => { socket.terminate(); reject(new Error("WebSocket upgrade timeout")); }, 10_000);
    socket.once("open", () => { clearTimeout(timeout); resolve(); });
    socket.once("error", error => { clearTimeout(timeout); reject(error); });
  });
  async function waitFor(scope: RealtimeEvent["scope"], from: number, conversationId?: string) {
    const until = Date.now() + 8000;
    while (Date.now() < until) {
      if (events.slice(from).some(event => event.scope === scope && (!conversationId || event.conversationId === conversationId))) return;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.fail(`No ${scope} WebSocket notification arrived`);
  }
  return { socket, events, waitFor };
}

test("production WebSockets: auth, cross-instance fanout, isolation, seen badges and new activity", { timeout: 60_000 }, async () => {
  const tag = `realtime-${randomUUID()}`;
  let userId: string | undefined;
  const conversationIds: string[] = [];
  let enquiryId: string | undefined;
  const sockets: WebSocket[] = [];
  try {
    const user = await db.user.create({ data: { email: `${tag}@example.invalid`, name: "Realtime test", role: "ADMIN" } });
    userId = user.id;
    const jwt = await encode({ secret: getAuthSecret(), token: { id: user.id, sv: user.sessionVersion, role: "ADMIN" }, maxAge: 120 });
    const cookie = `next-auth.session-token=${jwt}`;
    const tokens = [randomUUID(), randomUUID()];
    for (const token of tokens) {
      const conversation = await db.chatConversation.create({ data: { visitorName: tag, tokenHash: createHash("sha256").update(token).digest("hex") } });
      conversationIds.push(conversation.id);
    }
    const a = await connect(first, cookie, true); sockets.push(a.socket);
    const b = await connect(second, cookie, true); sockets.push(b.socket);
    const visitor = await connect(first, `sk_chat=${tokens[0]}`); sockets.push(visitor.socket);
    const other = await connect(second, `sk_chat=${tokens[1]}`); sockets.push(other.socket);
    const ai = a.events.length, bi = b.events.length;
    const enquiry = await db.enquiry.create({ data: { kind: "APPOINTMENT", parentName: tag, phone: "01000000000" } });
    enquiryId = enquiry.id;
    await Promise.all([a.waitFor("enquiries", ai), b.waitFor("enquiries", bi)]);

    async function mark(section: string) {
      const response = await fetch(`${first}/api/admin/sidebar-counts`, { method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" }, body: JSON.stringify({ section }) });
      assert.equal(response.status, 200, await response.clone().text());
    }
    await mark("liveChat"); await mark("enquiries");
    const cleared = await fetch(`${second}/api/admin/sidebar-counts`, { headers: { Cookie: cookie } });
    assert.deepEqual(await cleared.json(), { liveChat: 0, enquiries: 0 });

    const av = a.events.length, bv = b.events.length, vv = visitor.events.length, ov = other.events.length;
    const response = await fetch(`${first}/api/chat/poll`, {
      method: "POST", headers: { Cookie: `sk_chat=${tokens[0]}`, Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify({ t: "send", clientId: randomUUID(), body: tag }),
    });
    assert.equal(response.status, 200, await response.clone().text());
    await Promise.all([a.waitFor("chat", av, conversationIds[0]), b.waitFor("chat", bv, conversationIds[0]), visitor.waitFor("chat", vv, conversationIds[0])]);
    assert.ok(!other.events.slice(ov).some(event => event.scope === "chat" && event.conversationId === conversationIds[0]));
    assert.ok(!visitor.events.some(event => event.scope === "enquiries" || event.scope === "counts"));
    const counts = await fetch(`${second}/api/admin/sidebar-counts`, { headers: { Cookie: cookie } });
    assert.equal((await counts.json()).liveChat, 1);
    const history = await fetch(`${second}/api/admin/chat/conversations/${conversationIds[0]}`, { headers: { Cookie: cookie } });
    assert.ok((await history.json()).messages.some((message: { body: string }) => message.body === tag));

    await mark("liveChat");
    const clearedAgain = await fetch(`${second}/api/admin/sidebar-counts`, { headers: { Cookie: cookie } });
    assert.equal((await clearedAgain.json()).liveChat, 0);
    const denied = await fetch(`${first}/api/realtime/session?as=admin`);
    assert.equal(denied.status, 401);
    // A revoked admin must not get a new socket/session.
    await db.user.update({ where: { id: userId }, data: { isActive: false } });
    const revoked = await fetch(`${first}/api/realtime/session?as=admin`, { headers: { Cookie: cookie } });
    assert.equal(revoked.status, 401);
    console.log("Verified actual WebSocket upgrades and notifications across two production Node instances.");
  } finally {
    for (const socket of sockets) socket.terminate();
    await db.chatConversation.deleteMany({ where: { id: { in: conversationIds } } });
    if (enquiryId) await db.enquiry.deleteMany({ where: { id: enquiryId } });
    if (userId) await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  }
});
