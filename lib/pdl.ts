// People Data Labs (PDL) API Integration
// Alternative to Apollo.io with generous free tier
// Docs: https://docs.peopledatalabs.com/

const PDL_API_KEY = process.env.PDL_API_KEY;
const PDL_API_BASE_URL = 'https://api.peopledatalabs.com/v5';

if (!PDL_API_KEY) {
  throw new Error('Please define the PDL_API_KEY environment variable');
}

export interface PDLSearchFilters {
  job_title_role?: string[];
  job_title?: string[];
  location_name?: string[];
  job_company_size?: string[];
  page?: number;
  size?: number;
}

export interface PDLPerson {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  linkedin_url: string;
  job_title: string;
  job_company_name: string;
  job_company_website: string;
  job_company_industry: string;
  job_company_size: string;
  location_name: string;
  location_locality: string;
  location_region: string;
  location_country: string;
  emails: Array<{
    address: string;
    type: string;
  }>;
  [key: string]: any;
}

export interface PDLSearchResponse {
  status: number;
  data: PDLPerson[];
  total: number;
  scroll_token?: string;
}

/**
 * Search for people using PDL's Person Search API
 * Documentation: https://docs.peopledatalabs.com/docs/person-search-api
 * Uses SQL mode for simpler queries (recommended by PDL)
 */
export async function searchPeoplePDL(
  filters: PDLSearchFilters
): Promise<PDLSearchResponse> {
  const url = `${PDL_API_BASE_URL}/person/search`;

  // Build SQL query - PDL's recommended approach
  // Reference: https://docs.peopledatalabs.com/docs/input-parameters-person-search-api
  const conditions: string[] = [];

  // Job titles
  if (filters.job_title && filters.job_title.length > 0) {
    const titleConditions = filters.job_title
      .map(title => `job_title LIKE '%${title}%'`)
      .join(' OR ');
    conditions.push(`(${titleConditions})`);
  }

  // Locations - search across locality, region, and country
  if (filters.location_name && filters.location_name.length > 0) {
    const locationConditions = filters.location_name
      .map(location => 
        `(location_locality='${location}' OR location_region='${location}' OR location_country='${location}')`
      )
      .join(' OR ');
    conditions.push(`(${locationConditions})`);
  }

  // Company size
  if (filters.job_company_size && filters.job_company_size.length > 0) {
    const sizeConditions = filters.job_company_size
      .map(size => `job_company_size='${size}'`)
      .join(' OR ');
    conditions.push(`(${sizeConditions})`);
  }

  // Build final SQL query
  const sqlQuery = conditions.length > 0 
    ? `SELECT * FROM person WHERE ${conditions.join(' AND ')}` 
    : 'SELECT * FROM person';

  // PDL API request body using SQL mode
  const body = {
    sql: sqlQuery,
    size: filters.size || 10,
    dataset: 'all',
  };

  try {
    console.log('🔍 PDL API Request:', {
      url,
      hasApiKey: !!PDL_API_KEY,
      apiKeyPrefix: PDL_API_KEY?.substring(0, 10) + '...',
      filters,
      query: body.query,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': PDL_API_KEY!,
      },
      body: JSON.stringify(body),
    });

    console.log('📡 PDL API Response Status:', response.status);
    
    // Check rate limit headers
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (rateLimitRemaining) {
      console.log(`⚡ PDL Credits Remaining: ${rateLimitRemaining}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error('❌ PDL API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        rateLimitRemaining,
        rateLimitReset,
      });

      if (response.status === 400) {
        throw new Error(`PDL API: Invalid request - ${errorData.error || errorData.message || 'Check your search parameters'}`);
      }

      if (response.status === 401) {
        throw new Error('PDL API authentication failed. Check your PDL_API_KEY at https://dashboard.peopledatalabs.com/api-keys');
      }

      if (response.status === 402) {
        throw new Error(`PDL API credits exhausted. You have ${rateLimitRemaining || 0} credits remaining. Upgrade at https://dashboard.peopledatalabs.com/`);
      }

      if (response.status === 429) {
        throw new Error('PDL API rate limit exceeded. Please wait a moment and try again.');
      }

      throw new Error(
        `PDL API error: ${response.status} - ${errorData.error || errorData.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    console.log('✅ PDL API Success:', {
      peopleCount: data.data?.length,
      total: data.total,
      creditsUsed: data.data?.length || 0,
      creditsRemaining: rateLimitRemaining,
    });

    return data;
  } catch (error) {
    console.error('💥 PDL API error:', error);
    throw error;
  }
}

/**
 * Convert PDL company size to Apollo-style ranges
 */
export function convertCompanySizeToRange(size: string): string {
  const ranges: { [key: string]: string } = {
    '1-10': '1,10',
    '11-50': '11,50',
    '51-200': '51,200',
    '201-500': '201,500',
    '501-1000': '501,1000',
    '1001-5000': '1001,5000',
    '5001-10000': '5001,10000',
    '10000+': '10001,10000000000',
  };
  return ranges[size] || size;
}

/**
 * Convert Apollo-style ranges to PDL company size
 */
export function convertRangeToPDLSize(range: string): string {
  const sizes: { [key: string]: string } = {
    '1,10': '1-10',
    '11,50': '11-50',
    '51,200': '51-200',
    '201,500': '201-500',
    '501,1000': '501-1000',
    '1001,5000': '1001-5000',
    '5001,10000': '5001-10000',
    '10001,10000000000': '10000+',
  };
  return sizes[range] || range;
}

/**
 * Convert PDL person to Apollo-compatible format
 * Handles all edge cases and provides clean data
 */
export function convertPDLToApolloFormat(person: PDLPerson): any {
  // Get primary email (prefer work emails, handle different PDL formats)
  let email = '';
  if (person.emails && Array.isArray(person.emails) && person.emails.length > 0) {
    // Try to find professional/work email first
    const workEmail = person.emails.find(e => 
      e.type === 'professional' || 
      e.type === 'work' || 
      e.type === 'current_professional'
    );
    
    if (workEmail?.address) {
      email = workEmail.address;
    } else if (person.emails[0]?.address) {
      // Fallback to first email
      email = person.emails[0].address;
    } else if (typeof person.emails[0] === 'string') {
      // Sometimes PDL returns emails as strings directly
      email = person.emails[0];
    }
  }
  
  // Also check for email as a direct string property
  if (!email && (person as any).email) {
    email = (person as any).email;
  }

  console.log('📧 Email extraction:', {
    name: person.full_name,
    rawEmails: person.emails,
    extractedEmail: email || 'NOT FOUND'
  });

  // Parse company size to get employee count
  let numEmployees = 0;
  if (person.job_company_size) {
    // PDL formats like "11-50", "51-200", "10000+"
    const sizeMatch = person.job_company_size.match(/(\d+)/);
    if (sizeMatch) {
      numEmployees = parseInt(sizeMatch[1]);
    }
  }

  // Build full location string
  const locationParts = [
    person.location_locality,
    person.location_region,
    person.location_country
  ].filter(Boolean);
  
  const fullLocation = locationParts.join(', ') || person.location_name || 'Unknown';

  // Ensure LinkedIn URL is properly formatted with https://
  let linkedinUrl = person.linkedin_url || '';
  if (linkedinUrl && !linkedinUrl.startsWith('http')) {
    linkedinUrl = 'https://' + linkedinUrl;
  }

  return {
    id: person.id || `pdl-${Date.now()}-${Math.random()}`,
    first_name: person.first_name || '',
    last_name: person.last_name || '',
    name: person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown',
    linkedin_url: linkedinUrl,
    title: person.job_title || 'Not specified',
    email: email,
    organization: {
      name: person.job_company_name || 'Unknown Company',
      website_url: person.job_company_website || '',
      industry: person.job_company_industry || 'Not specified',
      num_employees: numEmployees,
    },
    city: person.location_locality || '',
    state: person.location_region || '',
    country: person.location_country || '',
    // Store full location for display
    location: fullLocation,
    // Store raw PDL data for debugging
    _pdl_raw: person,
  };
}

