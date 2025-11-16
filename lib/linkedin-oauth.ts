/**
 * LinkedIn OAuth 2.0 Implementation
 * Manual implementation without NextAuth
 */

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export interface LinkedInAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID!,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state: state, // CSRF protection
    scope: 'openid profile email w_member_social', // Scopes needed
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getLinkedInAccessToken(code: string): Promise<LinkedInAccessToken> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: LINKEDIN_CLIENT_ID!,
    client_secret: LINKEDIN_CLIENT_SECRET!,
    redirect_uri: LINKEDIN_REDIRECT_URI,
  });

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Get LinkedIn user profile
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get LinkedIn profile: ${error}`);
  }

  const data = await response.json();

  return {
    id: data.sub,
    firstName: data.given_name,
    lastName: data.family_name,
    email: data.email,
    profilePicture: data.picture,
  };
}

/**
 * Fetch a LinkedIn profile by profile URL using user's access token
 * This is the KEY function - it lets AI verify lead data!
 */
export async function fetchLinkedInProfileByUrl(
  profileUrl: string,
  accessToken: string
): Promise<{
  firstName?: string;
  lastName?: string;
  headline?: string;
  industry?: string;
  location?: string;
  currentPosition?: {
    title: string;
    companyName: string;
    startDate?: string;
  };
  email?: string;
  verified: boolean;
}> {
  try {
    // Extract profile ID from URL
    // e.g., https://linkedin.com/in/john-doe -> john-doe
    const profileId = profileUrl.split('/in/')[1]?.split('/')[0]?.split('?')[0];
    
    if (!profileId) {
      return { verified: false };
    }

    console.log(`🔍 Fetching LinkedIn profile: ${profileId}`);

    // LinkedIn Profile API (requires proper scopes)
    // Note: This requires r_basicprofile or r_liteprofile scope
    const response = await fetch(
      `https://api.linkedin.com/v2/people/(id:${profileId})`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ LinkedIn profile fetch failed: ${response.status}`);
      return { verified: false };
    }

    const data = await response.json();

    // Parse LinkedIn API response
    const profile = {
      firstName: data.firstName?.localized?.en_US || data.firstName,
      lastName: data.lastName?.localized?.en_US || data.lastName,
      headline: data.headline?.localized?.en_US || data.headline,
      industry: data.industryName,
      location: data.locationName,
      currentPosition: data.positions?.values?.[0] ? {
        title: data.positions.values[0].title,
        companyName: data.positions.values[0].company?.name,
        startDate: data.positions.values[0].startDate,
      } : undefined,
      verified: true,
    };

    console.log(`✅ LinkedIn profile fetched successfully: ${profileId}`);
    return profile;

  } catch (error: any) {
    console.error(`❌ Error fetching LinkedIn profile: ${error.message}`);
    return { verified: false };
  }
}

/**
 * Compare PDL data with real LinkedIn data
 * Returns accuracy score and discrepancies
 */
export function compareDataWithLinkedIn(
  pdlData: {
    name: string;
    title: string;
    companyName: string;
    location?: string;
    industry?: string;
  },
  linkedInData: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    currentPosition?: {
      title: string;
      companyName: string;
    };
    location?: string;
    industry?: string;
  }
): {
  accuracyScore: number; // 0-100
  discrepancies: string[];
  verified: boolean;
} {
  if (!linkedInData.firstName) {
    return {
      accuracyScore: 0,
      discrepancies: ['LinkedIn profile not accessible'],
      verified: false,
    };
  }

  const discrepancies: string[] = [];
  let matchPoints = 0;
  let totalChecks = 0;

  // Check name
  const fullLinkedInName = `${linkedInData.firstName} ${linkedInData.lastName}`.toLowerCase();
  const pdlName = pdlData.name.toLowerCase();
  totalChecks++;
  if (fullLinkedInName.includes(pdlName) || pdlName.includes(fullLinkedInName)) {
    matchPoints++;
  } else {
    discrepancies.push(`Name mismatch: PDL="${pdlData.name}" vs LinkedIn="${fullLinkedInName}"`);
  }

  // Check title/headline
  if (linkedInData.headline || linkedInData.currentPosition?.title) {
    totalChecks++;
    const linkedInTitle = (linkedInData.headline || linkedInData.currentPosition?.title || '').toLowerCase();
    const pdlTitle = pdlData.title.toLowerCase();
    
    if (linkedInTitle.includes(pdlTitle) || pdlTitle.includes(linkedInTitle)) {
      matchPoints++;
    } else {
      discrepancies.push(`Title mismatch: PDL="${pdlData.title}" vs LinkedIn="${linkedInTitle}"`);
    }
  }

  // Check company
  if (linkedInData.currentPosition?.companyName) {
    totalChecks++;
    const linkedInCompany = linkedInData.currentPosition.companyName.toLowerCase();
    const pdlCompany = pdlData.companyName.toLowerCase();
    
    if (linkedInCompany.includes(pdlCompany) || pdlCompany.includes(linkedInCompany)) {
      matchPoints++;
    } else {
      discrepancies.push(`Company mismatch: PDL="${pdlData.companyName}" vs LinkedIn="${linkedInCompany}"`);
    }
  }

  // Check location
  if (linkedInData.location && pdlData.location) {
    totalChecks++;
    const linkedInLocation = linkedInData.location.toLowerCase();
    const pdlLocation = pdlData.location.toLowerCase();
    
    if (linkedInLocation.includes(pdlLocation) || pdlLocation.includes(linkedInLocation)) {
      matchPoints++;
    } else {
      discrepancies.push(`Location mismatch: PDL="${pdlData.location}" vs LinkedIn="${linkedInData.location}"`);
    }
  }

  // Calculate accuracy score
  const accuracyScore = totalChecks > 0 ? Math.round((matchPoints / totalChecks) * 100) : 0;

  return {
    accuracyScore,
    discrepancies,
    verified: true,
  };
}

