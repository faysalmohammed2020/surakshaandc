import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Locale routing.
 *  - English is the default and lives at "/"  (internally rewritten to /en/...)
 *  - Bangla lives at "/bn"
 *  - "/en/..." is redirected to the clean, unprefixed URL
 *  - /admin and /auth are the staff panel: no locale handling
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/bn" || pathname.startsWith("/bn/")) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals, the staff panel (/admin, /auth) and anything with a file extension (robots.txt, sitemap.xml, images)
  matcher: ["/((?!api|_next|admin|auth|.*\\..*).*)"],
};
