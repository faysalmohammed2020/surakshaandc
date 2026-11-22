import "dotenv/config";
import { createServer } from "node:http";
import { attachRealtime } from "./lib/realtime/server";

async function main() {
  const dev = process.argv.includes("--dev");
  // SURAKSHA_REALTIME tells GET /api/realtime that this host serves WebSockets.
  Object.assign(process.env, { NODE_ENV: dev ? "development" : "production", SURAKSHA_REALTIME: "1" });
  const port = Number(process.env.PORT || 3000);
  const hostname = process.env.HOST || "0.0.0.0";
  const { default: next } = await import("next");
  // Next registers its own upgrade listener on httpServer after the first HTTP
  // request. Isolate that listener so it cannot close our authenticated sockets.
  const nextUpgrades = createServer();
  const app = next({ dev, port, hostname, httpServer: nextUpgrades });
  await app.prepare();
  const handle = app.getRequestHandler();
  const server = createServer((request, response) => { void handle(request, response); });
  const realtime = await attachRealtime(server, port);
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    if (pathname === "/api/realtime") void realtime.upgrade(request, socket, head);
    else if (nextUpgrades.listenerCount("upgrade")) nextUpgrades.emit("upgrade", request, socket, head);
    else socket.destroy();
  });
  server.listen(port, hostname, () => console.log(`Suraksha ${dev ? "development" : "production"} server with WebSockets: http://localhost:${port}`));
  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    const deadline = setTimeout(() => process.exit(1), 10_000);
    deadline.unref();
    server.close();
    await realtime.close();
    await app.close();
    process.exit(0);
  }
  process.on("SIGTERM", () => { void shutdown(); });
  process.on("SIGINT", () => { void shutdown(); });
}
main().catch(error => { console.error("[server] startup failed:", error); process.exit(1); });
