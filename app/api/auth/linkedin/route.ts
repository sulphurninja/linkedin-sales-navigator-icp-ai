import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAuthUrl } from '@/lib/linkedin-oauth';
import crypto from 'crypto';

/**
 * Initiate LinkedIn OAuth flow
 * GET /api/auth/linkedin
 */
export async function GET(request: NextRequest) {
  try {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in cookie for verification in callback
    const authUrl = getLinkedInAuthUrl(state);
    
    const response = NextResponse.redirect(authUrl);
    
    // Set state cookie
    response.cookies.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });
    
    return response;
  } catch (error: any) {
    console.error('LinkedIn OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn authentication' },
      { status: 500 }
    );
  }
}

