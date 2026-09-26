/** Thin wrapper over the two Razorpay REST calls the site makes. */

// RAZORPAY_API_BASE exists only so tests can point at a local mock; leave it unset.
const API = process.env.RAZORPAY_API_BASE ?? "https://api.razorpay.com/v1";

export function razorpayKeys(): { keyId: string; keySecret: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

function authHeader(keys: { keyId: string; keySecret: string }): string {
  return `Basic ${Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64")}`;
}

export async function razorpayRequest<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const keys = razorpayKeys();
  if (!keys) return { ok: false, error: "Razorpay keys are not configured." };
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader(keys) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const description = (data as { error?: { description?: string } })?.error?.description;
    return { ok: false, error: description ?? `Razorpay returned ${res.status}.` };
  }
  return { ok: true, data: data as T };
}
