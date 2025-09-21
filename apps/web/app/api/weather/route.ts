import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1 minute cache on the server

function mapWeatherCodeToText(code: number): string {
  // Open-Meteo weather codes simplified
  const mapping: Record<number, string> = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm + hail",
    99: "Thunderstorm + hail",
  };
  return mapping[code] || "Unknown";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "lat and lon are required" }), { status: 400 });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
      lat
    )}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,weather_code,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "weather_fetch_failed" }), { status: 502 });
    }
    const data = await res.json();
    const current = data?.current || {};
    const daily = data?.daily || {};
    const code = Number(current.weather_code ?? NaN);
    const condition = Number.isFinite(code) ? mapWeatherCodeToText(code) : "";

    return new Response(
      JSON.stringify({
        temperatureC: current.temperature_2m ?? null,
        apparentC: current.apparent_temperature ?? null,
        windKph: typeof current.wind_speed_10m === "number" ? current.wind_speed_10m * 1.0 : null,
        condition,
        highC: daily.temperature_2m_max?.[0] ?? null,
        lowC: daily.temperature_2m_min?.[0] ?? null,
      }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    console.error("Route weather error:", err);
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
  }
}


