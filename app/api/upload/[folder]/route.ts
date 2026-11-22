// Older open admin pages still post to these URLs. Use the same authenticated,
// validated handler as /api/upload; the folder never controls filesystem paths.
export { POST } from "../route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
