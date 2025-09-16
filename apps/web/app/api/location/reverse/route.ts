import { NextRequest } from "next/server";

export const revalidate = 60 * 60; // 1 hour

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "lat and lon are required" }), { status: 400 });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "chat-app/1.0 (reverse-geocode)",
      },
      // Cache on the server for a short period; client can still revalidate
      next: { revalidate },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "lookup_failed" }), { status: 502 });
    }

    const data = await res.json();
    const address = data?.address || {};
    const city = address.city || address.town || address.village || address.hamlet || address.county || "";
    const state = address.state || address.region || "";
    const country = address.country || "";

    return new Response(
      JSON.stringify({ city, state, country, displayName: data?.display_name || "" }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
  }
}


