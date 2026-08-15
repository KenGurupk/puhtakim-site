import { NextResponse } from "next/server";

import {
  adminAuthConfigured,
  adminSessionCookieName,
  createAdminSessionToken,
  sessionMaxAgeSeconds,
  validateAdminCredentials
} from "@/lib/admin-auth";

type AdminLoginPayload = {
  username: string;
  password: string;
  next: string;
};

function safeNextPath(value: unknown) {
  const path = typeof value === "string" ? value : "/admin";
  return path.startsWith("/admin") ? path : "/admin";
}

async function parseAdminLoginPayload(request: Request): Promise<AdminLoginPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    return {
      username: typeof body.username === "string" ? body.username : "",
      password: typeof body.password === "string" ? body.password : "",
      next: safeNextPath(body.next)
    };
  }

  const formData = await request.formData();

  return {
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: safeNextPath(formData.get("next"))
  };
}

export async function POST(request: Request) {
  const { username, password, next: nextPath } = await parseAdminLoginPayload(request);

  if (!adminAuthConfigured()) {
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url), 303);
  }

  if (!validateAdminCredentials(username, password)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "invalid");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);
  response.cookies.set(adminSessionCookieName, await createAdminSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds
  });

  return response;
}
