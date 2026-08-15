import { NextResponse, type NextRequest } from "next/server";

import { adminAuthConfigured, hasAdminSession } from "@/lib/admin-auth";

function unauthorized(message = "Authentication required") {
  return NextResponse.json({ error: message }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const loginRoute = pathname === "/admin/login" || pathname === "/api/admin/login";
  const logoutRoute = pathname === "/api/admin/logout";
  const protectedRoute = pathname === "/admin" || pathname.startsWith("/api/admin");

  if (!protectedRoute || loginRoute || logoutRoute) {
    return NextResponse.next();
  }

  if (!adminAuthConfigured()) {
    return pathname.startsWith("/api/")
      ? unauthorized("Admin authentication is not configured.")
      : NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }

  if (!(await hasAdminSession(request))) {
    if (pathname.startsWith("/api/")) {
      return unauthorized();
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
