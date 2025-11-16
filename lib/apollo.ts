const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_API_BASE_URL = 'https://api.apollo.io/v1';
const USE_MOCK_DATA = process.env.USE_APOLLO_MOCK === 'true';

if (!APOLLO_API_KEY && !USE_MOCK_DATA) {
  console.warn('⚠️ No APOLLO_API_KEY found. Set it in .env.local');
}

export interface ApolloSearchFilters {
  person_titles?: string[];
  person_locations?: string[];
  organization_num_employees_ranges?: string[];
  q_organization_domains?: string[];
  organization_industry_tag_ids?: string[];
  page?: number;
  per_page?: number;
}

export interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  linkedin_url: string;
  title: string;
  email: string;
  email_status?: string;
  photo_url?: string;
  twitter_url?: string;
  github_url?: string;
  facebook_url?: string;
  phone_numbers?: Array<{
    raw_number: string;
    sanitized_number: string;
    type: string;
    position: number;
    status: string;
  }>;
  organization: {
    id: string;
    name: string;
    website_url: string;
    blog_url?: string;
    angellist_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    facebook_url?: string;
    primary_phone?: {
      number: string;
      source: string;
    };
    languages?: string[];
    alexa_ranking?: number;
    phone?: string;
    linkedin_uid?: string;
    founded_year?: number;
    publicly_traded_symbol?: string;
    publicly_traded_exchange?: string;
    logo_url?: string;
    crunchbase_url?: string;
    primary_domain?: string;
    sanitized_phone?: string;
    industry: string;
    keywords?: string[];
    estimated_num_employees?: number;
    industries?: string[];
    secondary_industries?: string[];
    num_employees: number;
    short_description?: string;
    seo_description?: string;
    annual_revenue_printed?: string;
    annual_revenue?: number;
    total_funding?: number;
    total_funding_printed?: string;
    latest_funding_round_date?: string;
    latest_funding_stage?: string;
  };
  city: string;
  state: string;
  country: string;
  employment_history?: Array<{
    _id: string;
    created_at: string;
    current: boolean;
    degree?: string;
    description?: string;
    emails?: string[];
    end_date?: string;
    grade_level?: string;
    kind?: string;
    major?: string;
    organization_id?: string;
    organization_name?: string;
    raw_address?: string;
    start_date?: string;
    title?: string;
    updated_at: string;
    id: string;
    key: string;
  }>;
  [key: string]: any;
}

export interface ApolloSearchResponse {
  people: ApolloPerson[];
  breadcrumbs?: any[];
  partial_results_only?: boolean;
  disable_eu_prospecting?: boolean;
  partial_results_limit?: number;
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

/**
 * Search for people using Apollo's People Search API with EMAIL REVEAL
 * Documentation: https://apolloio.github.io/apollo-api-docs/?shell#search-for-people
 * 
 * Requires Apollo Professional plan or higher for:
 * - Email reveal (reveal_personal_emails: true)
 * - Phone numbers
 * - Extended data fields
 */
export async function searchPeople(
  filters: ApolloSearchFilters
): Promise<ApolloSearchResponse> {
  // Use mock data for testing if enabled
  if (USE_MOCK_DATA) {
    const { getMockSearchResults } = await import('./apollo-mock');
    console.log('🎭 Using mock Apollo data (USE_APOLLO_MOCK=true)');
    return getMockSearchResults();
  }

  if (!APOLLO_API_KEY) {
    throw new Error('APOLLO_API_KEY is required. Set it in your .env.local file.');
  }

  const url = `${APOLLO_API_BASE_URL}/mixed_people/search`;

  // Build request body with email reveal enabled
  const body = {
    ...filters,
    per_page: filters.per_page || 25,
    page: filters.page || 1,
    // IMPORTANT: Reveal emails (Professional plan feature)
    // This uses your Apollo email credits
    reveal_personal_emails: true,
    reveal_phone_number: true,
    // Additional parameters for better data
    contact_email_status: ['verified', 'guessed', 'unavailable'],
  };

  try {
    // Debug logging
    console.log('🔍 Apollo API Request:', {
      url,
      hasApiKey: !!APOLLO_API_KEY,
      apiKeyPrefix: APOLLO_API_KEY?.substring(0, 10) + '...',
      filters: {
        ...body,
        reveal_personal_emails: body.reveal_personal_emails,
        reveal_phone_number: body.reveal_phone_number,
      },
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Apollo API Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      console.error('❌ Apollo API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error(
          'Apollo API authentication failed. Please check your APOLLO_API_KEY in .env.local. Get your key at https://app.apollo.io/#/settings/integrations'
        );
      }

      if (response.status === 403) {
        // Check for plan-specific errors
        if (errorData.error?.includes('free plan') || errorData.error?.includes('upgrade')) {
          throw new Error(
            'Apollo Professional plan required for email reveal. Upgrade at https://app.apollo.io/ or set USE_APOLLO_MOCK=true to use demo data.'
          );
        }
        
        // Check for Master Key requirement
        if (errorData.error?.includes('master') || errorData.error_code?.includes('MASTER')) {
          throw new Error(
            'Apollo API requires a Master Key. In Apollo Settings → Integrations → API, create a new key and toggle "Set as master key".'
          );
        }
        
        throw new Error(
          `Apollo API 403 Forbidden: ${errorData.error || 'Permission denied'}. Ensure your API key is a Master Key with Professional plan access.`
        );
      }

      if (response.status === 422) {
        throw new Error(
          `Apollo API validation error: ${errorData.error || 'Invalid request parameters'}. Check your search filters.`
        );
      }

      if (response.status === 429) {
        throw new Error(
          'Apollo API rate limit exceeded. Please wait a moment and try again.'
        );
      }
      
      throw new Error(
        `Apollo API error (${response.status}): ${errorData.error || errorData.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    
    // Log email reveal status
    const emailCount = data.people?.filter((p: ApolloPerson) => 
      p.email && !p.email.includes('email_not_unlocked')
    ).length || 0;
    const lockedCount = data.people?.filter((p: ApolloPerson) => 
      p.email && p.email.includes('email_not_unlocked')
    ).length || 0;
    const phoneCount = data.people?.filter((p: ApolloPerson) => p.phone_numbers?.length > 0).length || 0;
    
    console.log('✅ Apollo API Success:', { 
      peopleCount: data.people?.length,
      totalEntries: data.pagination?.total_entries,
      emailsRevealed: emailCount,
      emailsLocked: lockedCount,
      phonesRevealed: phoneCount,
      emailRevealRate: data.people?.length ? `${Math.round((emailCount / data.people.length) * 100)}%` : '0%',
    });

    // Info message about locked emails
    if (lockedCount > 0) {
      console.log(`ℹ️ ${lockedCount} emails are locked and will be revealed using email reveal API`);
    }

    return data;
  } catch (error) {
    console.error('💥 Apollo API error:', error);
    throw error;
  }
}

/**
 * Get enriched information about a person by email
 * This will reveal additional contact information
 */
export async function enrichPerson(email: string): Promise<ApolloPerson> {
  if (!APOLLO_API_KEY) {
    throw new Error('APOLLO_API_KEY is required');
  }

  const url = `${APOLLO_API_BASE_URL}/people/match`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({ 
        email,
        reveal_personal_emails: true,
        reveal_phone_number: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Apollo API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.person;
  } catch (error) {
    console.error('Apollo API enrich error:', error);
    throw error;
  }
}

/**
 * Bulk enrich multiple people by email
 * Useful for enriching existing lead lists
 */
export async function bulkEnrichPeople(emails: string[]): Promise<ApolloPerson[]> {
  if (!APOLLO_API_KEY) {
    throw new Error('APOLLO_API_KEY is required');
  }

  const url = `${APOLLO_API_BASE_URL}/people/bulk_match`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({ 
        details: emails.map(email => ({ email })),
        reveal_personal_emails: true,
        reveal_phone_number: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Apollo API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Apollo API bulk enrich error:', error);
    throw error;
  }
}
