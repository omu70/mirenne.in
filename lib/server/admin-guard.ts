import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionValue } from "@/lib/server/admin-session";

/**
 * Second lock on every admin API route. proxy.ts already turns away requests
 * without a valid session, but route handlers check again so a matcher
 * mistake can never expose order or customer data.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies();
  if (verifySessionValue(store.get(ADMIN_COOKIE)?.value)) return null;
  return NextResponse.json({ error: "unauthorized", message: "Sign in to the admin first." }, { status: 401 });
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return verifySessionValue(store.get(ADMIN_COOKIE)?.value);
}
