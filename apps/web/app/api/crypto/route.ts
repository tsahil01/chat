import { NextRequest } from "next/server";

export const revalidate = 60; // cache on the server for 60s

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || "bitcoin,ethereum,solana";
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(",");

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      ids
    )}&vs_currencies=usd&include_24hr_change=true`;

    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "crypto_fetch_failed" }), { status: 502 });
    }
    const data = await res.json();

    return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
  } catch (err) {
    console.error("Route crypto error:", err);
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
  }
}


