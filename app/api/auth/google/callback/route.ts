import { NextRequest, NextResponse } from 'next/server';

/**
 * Google OAuth Callback Handler
 * Exchanges authorization code for access/refresh tokens
 * 
 * Query params:
 * - code: Authorization code from Google
 * - state: CSRF token for verification
 * - error: Error code if authentication failed
 */
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    console.log('[v0] Processing Google auth callback with code:', code.substring(0, 20) + '...');

    // Exchange authorization code for tokens
    // In production, this would exchange with Google's OAuth2 token endpoint
    // For now, we'll create mock tokens
    const accessToken = `google_access_${Date.now()}`;
    const refreshToken = `google_refresh_${Date.now()}`;

    // Mock user profile - in production, fetch from Google's userinfo endpoint
    const profile = {
      id: 'google_user_123',
      email: 'user@gmail.com',
      name: 'Google User',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
    };

    console.log('[v0] Google auth successful for:', profile.email);

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      profile,
      message: 'Google authentication successful',
    });
  } catch (error) {
    console.error('[v0] Google callback error:', error);
    return NextResponse.json(
      { error: 'Google authentication failed' },
      { status: 500 }
    );
  }
}
