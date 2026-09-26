import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin sign-in without a user table: one password, ADMIN_PASSWORD, set in the
 * hosting environment and checked only on the server. A successful sign-in
 * gets an httpOnly cookie holding an expiry and an HMAC of it. The signing key
 * is derived from the password, so changing ADMIN_PASSWORD signs everyone out.
 */

export const ADMIN_COOKIE = "mirenne_admin";
export const SESSION_DAYS = 14;

function signingKey(): Buffer | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const extra = process.env.ADMIN_SESSION_SECRET ?? "";
  return createHash("sha256").update(`mirenne-admin-session:${password}:${extra}`).digest();
}

function sign(payload: string, key: Buffer): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkAdminPassword(attempt: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(attempt).digest("hex");
  const b = createHash("sha256").update(password).digest("hex");
  return safeEqual(a, b);
}

export function createSessionValue(now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;
  const payload = `v1.${now + SESSION_DAYS * 86_400_000}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifySessionValue(value: string | undefined | null, now = Date.now()): boolean {
  if (!value) return false;
  const key = signingKey();
  if (!key) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < now) return false;
  return safeEqual(parts[2], sign(`${parts[0]}.${parts[1]}`, key));
}
