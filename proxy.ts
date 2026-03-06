import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAMES,
  parseAndVerifySessionToken,
  readSessionToken,
} from "@/lib/auth/session-token";
import {
  DEFAULT_PUBLIC_LOCALE,
  PUBLIC_LOCALES,
} from "@/lib/i18n/public-locales";

const ADMIN_PAGE_PREFIX = "/admin";
const ADMIN_API_PREFIX = "/api/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

const LOCALE_PREFIX_RE = new RegExp(`^/(${PUBLIC_LOCALES.join("|")})(/|$)`);
const PUBLIC_ROUTE_RE = /^\/(about|jobs|news)(\/|$)/;

type AuthResult =
  | { authenticated: true }
  | { authenticated: false; hasStaleToken: boolean };

async function checkAuth(request: NextRequest): Promise<AuthResult> {
  const token = readSessionToken(request);
  if (!token) {
    return { authenticated: false, hasStaleToken: false };
  }

  const payload = await parseAndVerifySessionToken(token);
  if (payload) {
    return { authenticated: true };
  }

  return { authenticated: false, hasStaleToken: true };
}

function clearSessionCookies(
  response: NextResponse,
  request: NextRequest,
): void {
  for (const cookieName of SESSION_COOKIE_NAMES) {
    if (request.cookies.has(cookieName)) {
      response.cookies.delete(cookieName);
    }
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  /* ── Public locale redirect ── */
  if (!LOCALE_PREFIX_RE.test(pathname)) {
    if (pathname === "/" || PUBLIC_ROUTE_RE.test(pathname)) {
      const destination = new URL(
        `/${DEFAULT_PUBLIC_LOCALE}${pathname === "/" ? "" : pathname}${search}`,
        request.url,
      );
      return NextResponse.redirect(destination, 308);
    }
  }

  /* ── Admin auth guard ── */
  const isAdminApiPath = pathname.startsWith(ADMIN_API_PREFIX);
  const isAdminPagePath = pathname.startsWith(ADMIN_PAGE_PREFIX);

  if (!isAdminApiPath && !isAdminPagePath) {
    return NextResponse.next();
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const auth = await checkAuth(request);

  if (auth.authenticated) {
    return NextResponse.next();
  }

  if (isAdminApiPath) {
    const response = NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
    if (auth.hasStaleToken) {
      clearSessionCookies(response, request);
    }
    return response;
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
  const response = NextResponse.redirect(loginUrl);

  if (auth.hasStaleToken) {
    clearSessionCookies(response, request);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/jobs/:path*",
    "/news/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
