import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@workspace/db';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all connected accounts for the user
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        providerId: true,
        accessToken: true,
        refreshToken: true,
        accessTokenExpiresAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Group accounts by provider
    const accountsByProvider = accounts.reduce((acc, account) => {
      if (!acc[account.providerId]) {
        acc[account.providerId] = [];
      }
      acc[account.providerId]!.push(account);
      return acc;
    }, {} as Record<string, typeof accounts>);

    // Transform into integration format
    const integrations = Object.entries(accountsByProvider).map(([providerId, accounts]) => ({
      id: providerId,
      name: getProviderName(providerId),
      connected: true,
      accountCount: accounts.length,
      lastConnected: accounts[0]?.createdAt.toISOString(),
      status: accounts.some(acc => acc.accessToken) ? 'connected' : 'disconnected',
      accounts: accounts.map(account => ({
        id: account.id,
        email: account.user.email || 'Unknown',
        name: account.user.name || 'Unknown',
        connectedAt: account.createdAt.toISOString(),
        status: account.accessToken ? 'active' : 'expired'
      }))
    }));

    return NextResponse.json({
      success: true,
      integrations
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

function getProviderName(providerId: string): string {
  switch (providerId) {
    case 'google':
      return 'Google Calendar';
    case 'github':
      return 'GitHub';
    case 'slack':
      return 'Slack';
    default:
      return providerId.charAt(0).toUpperCase() + providerId.slice(1);
  }
}
