import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@workspace/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ integrationId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrationId } = await params;

    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      const integrations = await prisma.integration.findMany({
        where: {
          userId: session.user.id,
          name: integrationId,
        },
      });

      if (integrations.length === 0) {
        return NextResponse.json(
          { error: "Integration not found" },
          { status: 404 },
        );
      }

      await prisma.integration.deleteMany({
        where: {
          userId: session.user.id,
          name: integrationId,
        },
      });

      return NextResponse.json({
        success: true,
        message: `All ${integrationId} integrations disconnected successfully`,
      });
    }

    if (integration.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to disconnect this integration" },
        { status: 403 },
      );
    }

    await prisma.integration.delete({
      where: { id: integrationId },
    });

    return NextResponse.json({
      success: true,
      message: `${integration.name} integration disconnected successfully`,
    });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 },
    );
  }
}
