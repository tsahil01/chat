import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const headersList = await headers();
    const origin = headersList.get('x-forwarded-proto') && headersList.get('x-forwarded-host')
      ? `${headersList.get('x-forwarded-proto')}://${headersList.get('x-forwarded-host')}`
      : new URL(request.url).origin;

    if (error) {
      return NextResponse.redirect(
        `${origin}/integrations?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(`${origin}/integrations?error=missing_code`);
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.redirect(`${origin}/auth?redirect=/integrations`);
    }

    const [provider] = state ? state.split(':') : ['unknown'];

    const exchangeResponse = await fetch(
      `${origin}/api/integrations/exchange-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({ provider, code }),
      }
    );

    if (!exchangeResponse.ok) {
      const error = await exchangeResponse.json();
      return NextResponse.redirect(
        `${origin}/integrations?error=${encodeURIComponent(error.error || 'Token exchange failed')}`
      );
    }

    const { tokens } = await exchangeResponse.json();

    const storeResponse = await fetch(
      `${origin}/api/integrations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify(tokens),
      }
    );

    if (!storeResponse.ok) {
      const error = await storeResponse.json();
      return NextResponse.redirect(
        `${origin}/integrations?error=${encodeURIComponent(error.error || 'Failed to store integration')}`
      );
    }

    return NextResponse.redirect(`${origin}/integrations?linked=success&provider=${provider}`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    
    try {
      const origin = new URL(request.url).origin;
      return NextResponse.redirect(
        `${origin}/integrations?error=${encodeURIComponent('OAuth callback failed')}`
      );
    } catch {
      return NextResponse.json(
        { error: 'OAuth callback failed' },
        { status: 500 }
      );
    }
  }
}
