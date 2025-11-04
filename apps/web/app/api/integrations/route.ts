import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@workspace/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integrationsRaw = await prisma.integration.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    const byProvider = integrationsRaw.reduce(
      (acc, integ) => {
        const key = integ.name;
        if (!acc[key]) acc[key] = [] as typeof integrationsRaw;
        acc[key]!.push(integ);
        return acc;
      },
      {} as Record<string, typeof integrationsRaw>,
    );

    const integrations = Object.entries(byProvider).map(
      ([providerId, records]) => {
        const accountItems = records.map((r) => ({
          id: r.id,
          email: r.email || "Unknown",
          name: r.email || "Unknown",
          connectedAt: r.createdAt.toISOString(),
          status: r.accessToken ? "active" : "expired",
        }));

        return {
          id: providerId,
          name: getProviderName(providerId),
          connected: accountItems.length > 0,
          accountCount: accountItems.length,
          lastConnected: records[0]?.createdAt.toISOString(),
          status: accountItems.some((a) => a.status === "active")
            ? "connected"
            : "disconnected",
          accounts: accountItems,
        };
      },
    );

    return NextResponse.json({
      success: true,
      integrations,
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, email, accessToken, refreshToken, expiresAt } = body;

    if (!provider || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields: provider, accessToken" },
        { status: 400 },
      );
    }

    const existing = await prisma.integration.findFirst({
      where: {
        name: provider,
        userId: session.user.id,
        email: email || null,
      },
    });

    let integration;

    if (existing) {
      integration = await prisma.integration.update({
        where: { id: existing.id },
        data: {
          email: email || null,
          accessToken,
          refreshToken: refreshToken || null,
          expiresAt: expiresAt
            ? new Date(expiresAt)
            : new Date(Date.now() + 3600000),
          updatedAt: new Date(),
        },
      });
    } else {
      integration = await prisma.integration.create({
        data: {
          id: `${provider}_${Date.now()}`,
          name: provider,
          email: email || null,
          accessToken,
          refreshToken: refreshToken || null,
          expiresAt: expiresAt
            ? new Date(expiresAt)
            : new Date(Date.now() + 3600000),
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        name: integration.name,
        email: integration.email,
      },
    });
  } catch (error) {
    console.error("Error storing integration:", error);
    return NextResponse.json(
      { error: "Failed to store integration" },
      { status: 500 },
    );
  }
}

function getProviderName(providerId: string): string {
  switch (providerId) {
    case "google":
      return "Google Calendar";
    case "github":
      return "GitHub";
    case "slack":
      return "Slack";
    default:
      return providerId.charAt(0).toUpperCase() + providerId.slice(1);
  }
}
