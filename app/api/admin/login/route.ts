import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_DAYS,
  checkAdminPassword,
  createSessionValue,
  isAdminConfigured,
} from "@/lib/server/admin-session";

// Per-instance brake on password guessing. Not a substitute for a strong
// password, but it turns an online guessing attack into a very slow one.
const attempts = new Map<string, { count: number; since: number }>();
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 8;

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "ADMIN_PASSWORD isn't set on this deployment yet." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && now - entry.since < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "rate_limited", message: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  if (!checkAdminPassword(String(password ?? ""))) {
    const fresh = !entry || now - entry.since >= WINDOW_MS;
    attempts.set(ip, { count: fresh ? 1 : entry.count + 1, since: fresh ? now : entry.since });
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "wrong_password", message: "That password isn't right." }, { status: 401 });
  }
  attempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionValue()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return res;
}
