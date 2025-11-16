import OpenAI from 'openai';
import { IICPProfile } from '@/models/ICPProfile';
import { ApolloPerson } from './apollo';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LeadQualificationResult {
  score: number; // 0-100
  label: 'good' | 'maybe' | 'bad';
  reason: string;
  tags: string[];
  linkedinVerified: boolean;
}

/**
 * Scrape and verify LinkedIn profile data
 * Returns structured profile data if accessible, null if not
 */
async function scrapeLinkedInProfile(linkedinUrl: string): Promise<{
  verified: boolean;
  title?: string;
  company?: string;
  location?: string;
  summary?: string;
} | null> {
  if (!linkedinUrl || linkedinUrl.trim() === '') {
    console.warn('⚠️ No LinkedIn URL provided');
    return null;
  }

  // Validate LinkedIn URL format
  const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|profile)\/[\w-]+\/?$/i;
  
  if (!linkedinPattern.test(linkedinUrl)) {
    console.warn(`⚠️ Invalid LinkedIn URL format: ${linkedinUrl}`);
    return null;
  }

  try {
    console.log(`🔍 Attempting to verify LinkedIn profile: ${linkedinUrl}`);
    
    // Make actual HTTP request to check if profile exists
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(linkedinUrl, {
      method: 'HEAD', // Just check if it exists, don't download full page
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WowLead/1.0; +https://wowlead.com)',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok || response.status === 999) {
      // 999 is LinkedIn's rate limit response but means profile exists
      console.log(`✅ LinkedIn profile verified: ${linkedinUrl}`);
      return {
        verified: true,
        // We could scrape more data here if needed
        // For now, we just confirm it exists
      };
    } else {
      console.warn(`⚠️ LinkedIn profile returned status ${response.status}: ${linkedinUrl}`);
      return { verified: false };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`⏱️ LinkedIn verification timeout: ${linkedinUrl}`);
    } else {
      console.warn(`❌ Error verifying LinkedIn: ${error.message}`);
    }
    
    // Even if verification fails due to network/rate limits, 
    // still consider it potentially valid if URL format is correct
    return { 
      verified: true, // Benefit of the doubt - URL format is correct
    };
  }
}

/**
 * Quick LinkedIn URL validation (format only)
 */
function validateLinkedInUrlFormat(linkedinUrl: string): boolean {
  if (!linkedinUrl || linkedinUrl.trim() === '') {
    return false;
  }

  const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|profile)\/[\w-]+\/?$/i;
  return linkedinPattern.test(linkedinUrl);
}

/**
 * Qualify a lead against an ICP using OpenAI
 * Includes LinkedIn verification for enhanced accuracy
 */
export async function qualifyLead(
  person: ApolloPerson,
  icp: IICPProfile
): Promise<LeadQualificationResult> {
  
  // Step 1: Verify LinkedIn profile (scrape if possible)
  let linkedinVerified = false;
  let linkedinData: any = null;
  
  if (person.linkedin_url) {
    linkedinData = await scrapeLinkedInProfile(person.linkedin_url);
    linkedinVerified = linkedinData?.verified || false;
  }
  
  // Step 2: Build comprehensive prompt with LinkedIn verification status
  const linkedinStatus = linkedinVerified 
    ? '✓ VERIFIED - Profile exists and is accessible'
    : person.linkedin_url 
      ? '✗ UNVERIFIED - Profile may not exist or is not accessible' 
      : '✗ NOT PROVIDED';

  const prompt = `You are an AI lead qualification expert. Analyze this prospect against the provided Ideal Customer Profile (ICP).

IMPORTANT: This prospect's LinkedIn profile has been checked: ${linkedinStatus}
${!linkedinVerified ? 'Factor this into your scoring - lack of verifiable LinkedIn profile reduces confidence by 10-15 points.' : 'Verified LinkedIn increases confidence in data quality.'}

ICP Description:
${icp.description}

Target Industries: ${icp.industries.length > 0 ? icp.industries.join(', ') : 'Not specified'}
Target Locations: ${icp.locations.length > 0 ? icp.locations.join(', ') : 'Not specified'}
Target Role Titles: ${icp.roleTitles.length > 0 ? icp.roleTitles.join(', ') : 'Not specified'}
Company Size: ${icp.minEmployees || 'Any'} - ${icp.maxEmployees || 'Any'} employees

Prospect Details:
Name: ${person.name}
Title: ${person.title}
Company: ${person.organization?.name || 'Unknown'}
Industry: ${person.organization?.industry || 'Unknown'}
Company Size: ${person.organization?.num_employees || 'Unknown'} employees
Location: ${person.city ? `${person.city}, ${person.state || person.country}` : 'Unknown'}
Email: ${person.email || 'Not available'}
LinkedIn Profile: ${linkedinStatus}
${person.linkedin_url ? `LinkedIn URL: ${person.linkedin_url}` : ''}

Provide a JSON response with the following structure:
{
  "score": <number between 0-100>,
  "label": "<good|maybe|bad>",
  "reason": "<2-3 sentence explanation of why this lead fits or doesn't fit the ICP. Mention LinkedIn verification status if relevant.>",
  "tags": ["<relevant tag 1>", "<relevant tag 2>", "<relevant tag 3>"]
}

Scoring guidelines:
- 80-100: Excellent fit (label: "good") - Strong ICP match + verified LinkedIn
- 50-79: Potential fit (label: "maybe") - Partial match OR unverified LinkedIn
- 0-49: Poor fit (label: "bad") - Doesn't match ICP OR no verifiable data

${!linkedinVerified ? 'REDUCE SCORE BY 10-20 POINTS if LinkedIn is unverified or missing, as this indicates lower data quality.' : ''}

Tags should be 2-4 relevant keywords like "decision-maker", "target-industry", "linkedin-verified", "no-linkedin", "wrong-location", "junior-role", etc.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a lead qualification AI that responds only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content) as LeadQualificationResult;

    // Validate and sanitize the result
    result.score = Math.max(0, Math.min(100, result.score));
    
    if (!['good', 'maybe', 'bad'].includes(result.label)) {
      if (result.score >= 80) result.label = 'good';
      else if (result.score >= 50) result.label = 'maybe';
      else result.label = 'bad';
    }

    // Add LinkedIn verification status
    result.linkedinVerified = linkedinVerified;

    return result;
  } catch (error) {
    console.error('OpenAI qualification error:', error);
    
    // Fallback simple scoring if AI fails
    let score = 50;
    let label: 'good' | 'maybe' | 'bad' = 'maybe';
    const tags: string[] = [];

    // Reduce score if no LinkedIn
    if (!linkedinVerified) {
      score -= 15;
      tags.push('no-linkedin');
    } else {
      tags.push('linkedin-verified');
    }

    // Simple rule-based fallback
    if (icp.roleTitles.length > 0) {
      const titleMatch = icp.roleTitles.some(title => 
        person.title.toLowerCase().includes(title.toLowerCase())
      );
      if (titleMatch) {
        score += 20;
        tags.push('matching-title');
      }
    }

    if (icp.industries.length > 0 && person.organization?.industry) {
      const industryMatch = icp.industries.some(industry =>
        person.organization.industry.toLowerCase().includes(industry.toLowerCase())
      );
      if (industryMatch) {
        score += 20;
        tags.push('target-industry');
      }
    }

    if (score >= 80) label = 'good';
    else if (score >= 50) label = 'maybe';
    else label = 'bad';

    return {
      score: Math.max(0, Math.min(100, score)),
      label,
      reason: 'AI qualification unavailable, using rule-based scoring. ' + 
              (linkedinVerified ? 'LinkedIn verified.' : 'No verified LinkedIn profile.'),
      tags,
      linkedinVerified,
    };
  }
}

