// Apollo Email & Phone Enrichment Functions
// Uses the People Match API to enrich and reveal contact information
// Documentation: https://docs.apollo.io/docs/enrich-people-data

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_API_BASE_URL = 'https://api.apollo.io/v1';

interface EnrichmentResult {
  email: string;
  email_status: string;
  phone_numbers: any[];
  sanitized_phone?: string;
}

/**
 * Enrich a single person using Apollo's People Match API
 * This is the CORRECT endpoint for revealing emails and phone numbers
 * Documentation: https://docs.apollo.io/docs/enrich-people-data
 */
export async function enrichPerson(person: {
  id?: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  domain?: string;
  linkedin_url?: string;
}): Promise<EnrichmentResult | null> {
  if (!APOLLO_API_KEY) {
    throw new Error('APOLLO_API_KEY is required');
  }

  const url = `${APOLLO_API_BASE_URL}/people/match`;

  try {
    // Build the request body based on available data
    const requestBody: any = {};

    // If we have Apollo ID, use it (most reliable)
    if (person.id) {
      requestBody.id = person.id;
    }
    
    // Add name and company info for matching
    if (person.first_name) requestBody.first_name = person.first_name;
    if (person.last_name) requestBody.last_name = person.last_name;
    if (person.organization_name) requestBody.organization_name = person.organization_name;
    if (person.domain) requestBody.domain = person.domain;
    if (person.linkedin_url) requestBody.linkedin_url = person.linkedin_url;

    // CRITICAL: Request email reveal
    // NOTE: Phone reveals require a webhook_url (asynchronous), so we skip it here
    // We'll get phone numbers from the initial search data if available
    requestBody.reveal_personal_emails = true;
    // requestBody.reveal_phone_number = true; // DISABLED - requires webhook

    console.log(`🔓 Enriching person via /people/match:`, {
      id: person.id,
      name: `${person.first_name} ${person.last_name}`,
      company: person.organization_name,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Enrichment failed for ${person.id}:`, {
        status: response.status,
        error: errorData,
      });
      return null;
    }

    const data = await response.json();
    const enrichedPerson = data.person;

    if (!enrichedPerson) {
      console.warn(`⚠️ No person data returned for ${person.id}`);
      return null;
    }

    // Extract phone number
    const phoneNumber = extractPhoneNumber(enrichedPerson.phone_numbers);

    const result = {
      email: enrichedPerson.email || '',
      email_status: enrichedPerson.email_status || 'unavailable',
      phone_numbers: enrichedPerson.phone_numbers || [],
      sanitized_phone: phoneNumber,
    };

    console.log(`✅ Enriched ${person.id}:`, {
      email: result.email || 'N/A',
      emailStatus: result.email_status,
      phonesInResponse: result.phone_numbers.length,
    });

    return result;
  } catch (error) {
    console.error(`💥 Error enriching person ${person.id}:`, error);
    return null;
  }
}

/**
 * Batch enrich multiple people using the People Match API
 * This is the proper way to reveal emails and phone numbers
 */
export async function batchEnrichPeople(people: Array<{
  id: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  domain?: string;
  linkedin_url?: string;
}>): Promise<Map<string, EnrichmentResult>> {
  if (!APOLLO_API_KEY) {
    throw new Error('APOLLO_API_KEY is required');
  }

  const results = new Map<string, EnrichmentResult>();

  console.log(`🚀 Starting batch enrichment for ${people.length} people using People Match API...`);

  // Process in batches to respect rate limits
  const BATCH_SIZE = 3; // Conservative to avoid rate limits
  const DELAY_MS = 1500; // 1.5 seconds between batches

  for (let i = 0; i < people.length; i += BATCH_SIZE) {
    const batch = people.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(people.length / BATCH_SIZE);

    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} people)...`);

    const promises = batch.map(async (person) => {
      const enriched = await enrichPerson(person);
      if (enriched) {
        results.set(person.id, enriched);
      }
      return enriched;
    });

    await Promise.all(promises);

    // Delay between batches to respect rate limits
    if (i + BATCH_SIZE < people.length) {
      console.log(`⏳ Waiting ${DELAY_MS}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Summary
  const enrichedCount = results.size;
  const emailCount = Array.from(results.values()).filter(r => 
    r.email && !r.email.includes('email_not_unlocked')
  ).length;
  const phoneCount = Array.from(results.values()).filter(r => r.sanitized_phone).length;

  console.log(`\n✅ Batch enrichment complete!`);
  console.log(`   📊 Total enriched: ${enrichedCount}/${people.length}`);
  console.log(`   📧 Emails revealed: ${emailCount}/${enrichedCount} (${enrichedCount > 0 ? Math.round((emailCount/enrichedCount)*100) : 0}%)`);
  console.log(`   ℹ️  Phone numbers from search data: ${phoneCount}/${enrichedCount} (${enrichedCount > 0 ? Math.round((phoneCount/enrichedCount)*100) : 0}%)`);
  console.log(`   💡 Note: Phone reveals require webhook setup (async operation)`);

  return results;
}

/**
 * Check if an email needs to be unlocked/enriched
 */
export function needsEmailUnlock(email: string | undefined): boolean {
  if (!email) return true;
  return (
    email === '' ||
    email.includes('email_not_unlocked') ||
    email.includes('not_unlocked') ||
    email.includes('@domain.com') ||
    email.includes('unavailable')
  );
}

/**
 * Extract the best phone number from Apollo's phone_numbers array
 */
export function extractPhoneNumber(phoneNumbers?: any[]): string {
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return '';
  }

  // Priority order for phone types
  const priorities = [
    'mobile',
    'current_mobile',
    'work_mobile',
    'work_hq',
    'current_work_direct',
    'work_direct',
    'other',
  ];

  // Try to find phone by priority
  for (const priority of priorities) {
    const phone = phoneNumbers.find(p => 
      p.type?.toLowerCase().includes(priority.toLowerCase())
    );
    
    if (phone) {
      // Return sanitized number first, then raw number
      if (phone.sanitized_number) return phone.sanitized_number;
      if (phone.raw_number) return phone.raw_number;
      if (phone.number) return phone.number;
    }
  }

  // Fallback: return first available number
  const firstPhone = phoneNumbers[0];
  if (firstPhone) {
    if (firstPhone.sanitized_number) return firstPhone.sanitized_number;
    if (firstPhone.raw_number) return firstPhone.raw_number;
    if (firstPhone.number) return firstPhone.number;
  }

  return '';
}

/**
 * Parse person name into first and last name
 */
export function parseName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) {
    return { first_name: '', last_name: '' };
  }
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '' };
  }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  };
}
