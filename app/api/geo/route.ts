import { NextResponse } from "next/server";
import { resolveRegion } from "@/lib/checkout/india-regions";

/**
 * A best-effort guess at where the shopper is, used only to pre-fill the city
 * and state on checkout so they have less to type.
 *
 * It reads the geo headers the hosting platform already attaches to the
 * request — Vercel's `x-vercel-ip-*` or Cloudflare's `cf-*`. No external call,
 * no extra latency, and the IP never leaves the platform that already had it.
 *
 * Locally there are no such headers and this returns nothing, which is correct:
 * a localhost request has no meaningful location. To cover hosts that don't
 * provide them, set GEO_IP_LOOKUP_URL to a JSON endpoint that returns `city`
 * and `region` (ipapi.co/json/ shape). That is off by default on purpose —
 * turning it on sends every checkout visitor's IP to a third party, which is a
 * decision for whoever runs the store, not a default.
 *
 * Accuracy is the important caveat. IP geolocation lands in the right city
 * maybe most of the time; mobile networks, VPNs and corporate routing put it
 * hundreds of kilometres out. So this only ever fills fields the shopper has
 * left empty, and the PIN code lookup overrides it.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const h = request.headers;

  // Vercel percent-encodes the city ("New%20Delhi"); Cloudflare does not.
  const decode = (v: string | null) => {
    if (!v) return "";
    try {
      return decodeURIComponent(v).trim();
    } catch {
      return v.trim();
    }
  };

  const city = decode(h.get("x-vercel-ip-city") ?? h.get("cf-ipcity"));
  const region = resolveRegion(h.get("x-vercel-ip-country-region") ?? h.get("cf-region"));
  const country = (h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? "").toUpperCase();

  if (city || region) {
    return NextResponse.json({ city, state: region, country, source: "platform" });
  }

  const lookupUrl = process.env.GEO_IP_LOOKUP_URL;
  if (lookupUrl) {
    try {
      const res = await fetch(lookupUrl, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = (await res.json()) as { city?: string; region?: string; region_code?: string; country_code?: string };
        return NextResponse.json({
          city: (data.city ?? "").trim(),
          state: resolveRegion(data.region ?? data.region_code),
          country: (data.country_code ?? "").toUpperCase(),
          source: "lookup",
        });
      }
    } catch {
      // A slow or unreachable lookup must never hold up checkout. Fall through
      // to the empty response and let the shopper type it themselves.
    }
  }

  return NextResponse.json({ city: "", state: "", country: "", source: "none" });
}
