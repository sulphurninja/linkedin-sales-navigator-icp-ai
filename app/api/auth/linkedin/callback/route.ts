import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAccessToken, getLinkedInProfile } from '@/lib/linkedin-oauth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * LinkedIn OAuth callback
 * GET /api/auth/linkedin/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Check for OAuth error
    if (error) {
      console.error('LinkedIn OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('LinkedIn authentication failed')}`, request.url)
      );
    }
    
    // Validate required params
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=Invalid OAuth callback', request.url)
      );
    }
    
    // Verify state (CSRF protection)
    const storedState = request.cookies.get('linkedin_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/login?error=Invalid state parameter', request.url)
      );
    }
    
    // Exchange code for access token
    const tokenData = await getLinkedInAccessToken(code);
    
    // Get LinkedIn profile
    const linkedInProfile = await getLinkedInProfile(tokenData.access_token);
    
    // Connect to database
    await connectToDatabase();
    
    // Find or create user
    let user = await User.findOne({ email: linkedInProfile.email });
    
    if (!user) {
      user = await User.create({
        email: linkedInProfile.email,
        name: `${linkedInProfile.firstName} ${linkedInProfile.lastName}`,
        linkedInId: linkedInProfile.id,
        linkedInAccessToken: tokenData.access_token,
        linkedInTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
      });
    } else {
      // Update existing user with LinkedIn data
      user.linkedInId = linkedInProfile.id;
      user.linkedInAccessToken = tokenData.access_token;
      user.linkedInTokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);
      await user.save();
    }
    
    // Generate JWT
    const token = sign(
      { 
        userId: user._id,
        email: user.email,
        hasLinkedIn: true,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to dashboard with token
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    // Clear state cookie
    response.cookies.delete('linkedin_oauth_state');
    
    return response;
  } catch (error: any) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication failed: ' + error.message)}`, request.url)
    );
  }
}

