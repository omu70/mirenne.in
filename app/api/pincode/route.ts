import { NextResponse } from "next/server";

/**
 * Resolves an Indian PIN code to a city and state, so the shopper types six
 * digits instead of two more fields.
 *
 * Proxied through the server rather than called from the browser for three
 * reasons: it survives the upstream not sending CORS headers, it lets the
 * result be cached (PIN codes effectively never change), and it keeps the
 * upstream swappable without touching the client.
 *
 * Upstream is India Post's public PIN API (api.postalpincode.in) — free and
 * keyless. Its response is an array whose first element carries `Status`
 * ("Success" / "Error") and a `PostOffice` array. The parsing below treats
 * every field as possibly missing: a public endpoint with no contract is not
 * something to destructure optimistically.
 */

const UPSTREAM = "https://api.postalpincode.in/pincode/";

interface PostOffice {
  Name?: string;
  District?: string;
  State?: string;
  Block?: string;
  Division?: string;
}

/**
 * PIN codes don't change, so a resolved one is worth keeping for the life of
 * the server process. This is per-instance and deliberately unbounded-ish —
 * there are only ~19,000 PIN codes and a store will ever see a small slice.
 */
const cache = new Map<string, { city: string; state: string; area: string }>();

export async function GET(request: Request) {
  const code = (new URL(request.url).searchParams.get("code") ?? "").trim();

  if (!/^[1-9][0-9]{5}$/.test(code)) {
    return NextResponse.json(
      { error: "invalid_pincode", message: "Enter a 6-digit PIN code." },
      { status: 400 }
    );
  }

  const cached = cache.get(code);
  if (cached) {
    return NextResponse.json({ ...cached, pincode: code, cached: true });
  }

  let payload: unknown;
  try {
    const res = await fetch(UPSTREAM + code, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    payload = await res.json();
  } catch {
    // Never a hard failure: the shopper can always type the city and state.
    return NextResponse.json(
      { error: "lookup_unavailable", message: "Couldn't look that PIN code up just now." },
      { status: 503 }
    );
  }

  const first = Array.isArray(payload) ? (payload[0] as Record<string, unknown> | undefined) : undefined;
  const offices = Array.isArray(first?.PostOffice) ? (first.PostOffice as PostOffice[]) : [];
  const office = offices[0];

  if (first?.Status !== "Success" || !office) {
    return NextResponse.json(
      { error: "not_found", message: "No Indian PIN code matches that number." },
      { status: 404 }
    );
  }

  const result = {
    // District is the city for delivery purposes; Block/Division is a
    // reasonable stand-in on the rare record where District is blank.
    city: (office.District ?? office.Block ?? office.Division ?? "").trim(),
    state: (office.State ?? "").trim(),
    area: (office.Name ?? "").trim(),
  };

  if (!result.city && !result.state) {
    return NextResponse.json(
      { error: "not_found", message: "No Indian PIN code matches that number." },
      { status: 404 }
    );
  }

  cache.set(code, result);

  return NextResponse.json(
    { ...result, pincode: code, cached: false },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=2592000" } }
  );
}
