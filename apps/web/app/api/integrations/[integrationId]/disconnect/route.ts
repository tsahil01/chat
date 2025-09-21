import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@workspace/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ integrationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integrationId } = await params;
    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');

    let result;

    if (accountId) {
      // Disconnect specific account
      result = await prisma.account.deleteMany({
        where: {
          id: accountId,
          userId: session.user.id,
          providerId: integrationId
        }
      });
    } else {
      // Disconnect all accounts for this provider
      result = await prisma.account.deleteMany({
        where: {
          userId: session.user.id,
          providerId: integrationId
        }
      });
    }

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'No accounts found for this integration' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: accountId 
        ? `${integrationId} account disconnected successfully`
        : `${integrationId} integration disconnected successfully`
    });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
