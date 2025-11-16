/**
 * Enhanced OpenAI qualification with LinkedIn verification
 * Uses user's LinkedIn OAuth token to fetch and verify profile data
 */

import OpenAI from 'openai';
import { IICPProfile } from '@/models/ICPProfile';
import { fetchLinkedInProfileByUrl, compareDataWithLinkedIn } from './linkedin-oauth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ApolloPerson {
  id: string;
  name: string;
  title: string;
  linkedin_url: string;
  email?: string;
  organization?: {
    name: string;
    website_url?: string;
    industry?: string;
    num_employees?: number;
  };
  city?: string;
  state?: string;
  country?: string;
}

export interface EnhancedLeadQualificationResult {
  score: number; // 0-100
  label: 'good' | 'maybe' | 'bad';
  reason: string;
  tags: string[];
  linkedinVerified: boolean;
  dataAccuracy?: number; // 0-100 (only if LinkedIn verified)
  discrepancies?: string[]; // Data mismatches found
}

/**
 * Qualify lead with LinkedIn verification
 * Fetches actual LinkedIn profile and compares with PDL data
 */
export async function qualifyLeadWithLinkedIn(
  person: ApolloPerson,
  icp: IICPProfile,
  linkedInAccessToken?: string
): Promise<EnhancedLeadQualificationResult> {
  
  let linkedinVerified = false;
  let dataAccuracy: number | undefined = undefined;
  let discrepancies: string[] = [];
  let linkedInData: any = null;

  // Step 1: If user has LinkedIn token, fetch actual profile data
  if (linkedInAccessToken && person.linkedin_url) {
    try {
      console.log(`🔍 Fetching LinkedIn profile with user token: ${person.linkedin_url}`);
      
      linkedInData = await fetchLinkedInProfileByUrl(
        person.linkedin_url,
        linkedInAccessToken
      );

      if (linkedInData.verified) {
        linkedinVerified = true;
        
        // Compare PDL data with real LinkedIn data
        const comparison = compareDataWithLinkedIn(
          {
            name: person.name,
            title: person.title,
            companyName: person.organization?.name || '',
            location: person.city || '',
            industry: person.organization?.industry,
          },
          linkedInData
        );

        dataAccuracy = comparison.accuracyScore;
        discrepancies = comparison.discrepancies;

        console.log(`✅ LinkedIn verified! Data accuracy: ${dataAccuracy}%`);
        if (discrepancies.length > 0) {
          console.warn(`⚠️ Discrepancies found:`, discrepancies);
        }
      }
    } catch (error: any) {
      console.error('❌ LinkedIn verification failed:', error.message);
    }
  }

  // Step 2: Build comprehensive AI prompt with LinkedIn verification
  const linkedinStatus = linkedinVerified
    ? `✓ VERIFIED via LinkedIn OAuth - Data accuracy: ${dataAccuracy}%`
    : person.linkedin_url
      ? '✗ UNVERIFIED - Profile URL exists but not verified'
      : '✗ NOT PROVIDED';

  let discrepancyWarning = '';
  if (discrepancies.length > 0) {
    discrepancyWarning = `\n\nDATA DISCREPANCIES FOUND:\n${discrepancies.map(d => `- ${d}`).join('\n')}\n\nREDUCE SCORE BY ${10 + discrepancies.length * 5} POINTS due to data quality issues.`;
  }

  const prompt = `You are an AI lead qualification expert. Analyze this prospect against the provided Ideal Customer Profile (ICP).

LINKEDIN VERIFICATION STATUS: ${linkedinStatus}
${linkedinVerified ? `Data Accuracy: ${dataAccuracy}% (PDL data vs real LinkedIn profile)` : ''}
${discrepancyWarning}

ICP Description:
${icp.description}

Target Industries: ${icp.industries.length > 0 ? icp.industries.join(', ') : 'Not specified'}
Target Locations: ${icp.locations.length > 0 ? icp.locations.join(', ') : 'Not specified'}
Target Role Titles: ${icp.roleTitles.length > 0 ? icp.roleTitles.join(', ') : 'Not specified'}
Company Size: ${icp.minEmployees || 'Any'} - ${icp.maxEmployees || 'Any'} employees

Prospect Data (from PDL):
Name: ${person.name}
Title: ${person.title}
Company: ${person.organization?.name || 'Unknown'}
Industry: ${person.organization?.industry || 'Unknown'}
Company Size: ${person.organization?.num_employees || 'Unknown'} employees
Location: ${person.city ? `${person.city}, ${person.state || person.country}` : 'Unknown'}
Email: ${person.email || 'Not available'}

${linkedinVerified && linkedInData ? `
Real LinkedIn Profile Data (VERIFIED):
Name: ${linkedInData.firstName} ${linkedInData.lastName}
Title: ${linkedInData.headline || linkedInData.currentPosition?.title || 'Not specified'}
Company: ${linkedInData.currentPosition?.companyName || 'Not specified'}
Location: ${linkedInData.location || 'Not specified'}
Industry: ${linkedInData.industry || 'Not specified'}
` : ''}

Scoring Guidelines:
- 90-100: Perfect fit + LinkedIn verified + accurate data (${dataAccuracy}% >= 90%)
- 80-89: Excellent fit + LinkedIn verified
- 70-79: Good fit OR LinkedIn verified with minor discrepancies
- 50-69: Potential fit OR unverified LinkedIn OR significant data discrepancies
- 0-49: Poor fit OR fake/outdated data

${!linkedinVerified ? 'REDUCE SCORE BY 10-15 POINTS if LinkedIn is unverified.' : ''}
${discrepancies.length > 0 ? `REDUCE SCORE BY ${10 + discrepancies.length * 5} POINTS due to data discrepancies.` : ''}

Provide a JSON response:
{
  "score": <number 0-100>,
  "label": "<good|maybe|bad>",
  "reason": "<2-3 sentences explaining fit, data quality, and verification status>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}

Tags should include:
- "linkedin-verified" if verified
- "data-accurate" if accuracy >= 90%
- "data-discrepancy" if discrepancies found
- "decision-maker", "target-industry", etc. as relevant`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert B2B lead qualification AI. You analyze prospect data quality, LinkedIn verification status, and ICP fit to provide accurate lead scoring.',
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

    const result = JSON.parse(content);

    // Validate and sanitize
    result.score = Math.max(0, Math.min(100, result.score));

    if (!['good', 'maybe', 'bad'].includes(result.label)) {
      if (result.score >= 80) result.label = 'good';
      else if (result.score >= 50) result.label = 'maybe';
      else result.label = 'bad';
    }

    return {
      ...result,
      linkedinVerified,
      dataAccuracy,
      discrepancies: discrepancies.length > 0 ? discrepancies : undefined,
    };
  } catch (error) {
    console.error('OpenAI qualification error:', error);

    // Fallback scoring
    let score = 50;
    const tags: string[] = [];

    if (!linkedinVerified) {
      score -= 15;
      tags.push('no-linkedin');
    } else {
      tags.push('linkedin-verified');
      if (dataAccuracy && dataAccuracy >= 90) {
        score += 10;
        tags.push('data-accurate');
      } else if (discrepancies.length > 0) {
        score -= 10 + discrepancies.length * 5;
        tags.push('data-discrepancy');
      }
    }

    // Basic ICP matching
    if (icp.roleTitles.length > 0) {
      const titleMatch = icp.roleTitles.some(title =>
        person.title.toLowerCase().includes(title.toLowerCase())
      );
      if (titleMatch) {
        score += 20;
        tags.push('matching-title');
      }
    }

    let label: 'good' | 'maybe' | 'bad';
    if (score >= 80) label = 'good';
    else if (score >= 50) label = 'maybe';
    else label = 'bad';

    return {
      score: Math.max(0, Math.min(100, score)),
      label,
      reason: `AI qualification unavailable. ${linkedinVerified ? `LinkedIn verified with ${dataAccuracy}% data accuracy.` : 'No LinkedIn verification.'}`,
      tags,
      linkedinVerified,
      dataAccuracy,
      discrepancies: discrepancies.length > 0 ? discrepancies : undefined,
    };
  }
}

