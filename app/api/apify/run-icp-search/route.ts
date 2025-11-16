/**
 * Apify Actor Backend Endpoint
 * 
 * This endpoint receives requests from the Backtick Apify Actor
 * and returns AI-scored leads from LinkedIn Sales Navigator (Apollo)
 * 
 * NO API KEY REQUIRED - Tracks usage by Apify Run ID instead
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { searchPeople } from '@/lib/apollo';
import { batchEnrichPeople, extractPhoneNumber } from '@/lib/apollo-enrich';
import { qualifyLead } from '@/lib/openai';
import ICPProfile from '@/models/ICPProfile';

// ============================================================================
// TYPES
// ============================================================================

interface ApifyRequest {
  icp_description: string;
  job_titles: string[];
  locations?: string[];
  industries?: string[];
  company_sizes?: string[];
  keywords_include?: string[];
  keywords_exclude?: string[];
  max_raw_leads: number;
  top_n: number;
  apify_run_id: string;
  source: string;
}

interface Lead {
  full_name: string;
  job_title: string;
  company_name: string;
  company_website?: string;
  company_size?: string;
  industry?: string;
  location: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  fit_score: number;
  fit_reason: string;
  fit_label?: 'good' | 'maybe' | 'bad';
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const LIMITS = {
  MAX_RAW_LEADS: 1000,
  MAX_TOP_N: 500,
  RATE_LIMIT_PER_HOUR: 10, // Max runs per hour from same IP
};

// ============================================================================
// MAIN ENDPOINT
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Apify Actor request received');
    
    // 1. Parse request
    const body: ApifyRequest = await request.json();
    const apifyRunId = body.apify_run_id || request.headers.get('x-apify-run-id') || 'unknown';
    
    console.log('📋 Request:', {
      apifyRunId,
      icp: body.icp_description.substring(0, 50) + '...',
      jobTitles: body.job_titles.length,
      maxRawLeads: body.max_raw_leads,
      topN: body.top_n,
    });
    
    // 2. Validate input
    if (!body.icp_description || body.icp_description.length < 50) {
      return NextResponse.json(
        { 
          error: 'ValidationError', 
          message: 'ICP description required (min 50 characters)' 
        },
        { status: 400 }
      );
    }
    
    if (!body.job_titles || body.job_titles.length === 0) {
      return NextResponse.json(
        { 
          error: 'ValidationError', 
          message: 'At least one job title required' 
        },
        { status: 400 }
      );
    }
    
    // 3. Enforce hard limits
    const maxRawLeads = Math.min(body.max_raw_leads, LIMITS.MAX_RAW_LEADS);
    const topN = Math.min(body.top_n, LIMITS.MAX_TOP_N);
    
    console.log('🔒 Limits enforced:', { maxRawLeads, topN });
    
    // 4. Check rate limit (optional - track by Apify Run ID or IP)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await logApifyUsage(apifyRunId, clientIp, body);
    
    // 5. Search Apollo (your existing function)
    console.log('🔍 Searching Apollo...');
    
    const apolloResults = await searchPeople({
      person_titles: body.job_titles,
      person_locations: body.locations,
      organization_num_employees_ranges: translateCompanySizes(body.company_sizes),
      per_page: Math.min(maxRawLeads, 25), // Apollo's per_page limit
      page: 1,
    });
    
    console.log(`✅ Apollo returned ${apolloResults.people.length} leads`);
    
    // 6. Enrich emails (your existing function)
    console.log('💌 Enriching emails...');
    
    const peopleToEnrich = apolloResults.people.map(p => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      organization_name: p.organization?.name,
      domain: p.organization?.website_url,
      linkedin_url: p.linkedin_url,
    }));
    
    const enrichedData = await batchEnrichPeople(peopleToEnrich);
    console.log(`✅ Enriched ${enrichedData.size} emails`);
    
    // 7. AI scoring (your existing function)
    console.log('🤖 AI scoring leads against ICP...');
    
    // Create a temporary ICP profile for scoring
    const tempICP = {
      description: body.icp_description,
      idealTitles: body.job_titles,
      idealLocations: body.locations || [],
      idealIndustries: body.industries || [],
      idealCompanySizes: body.company_sizes || [],
      targetKeywords: body.keywords_include || [],
      excludeKeywords: body.keywords_exclude || [],
    };
    
    const scoredLeads = await Promise.all(
      apolloResults.people.map(async (person) => {
        const enriched = enrichedData.get(person.id);
        const phoneFromSearch = extractPhoneNumber(person.phone_numbers);
        
        // Score this lead against ICP
        const qualification = await qualifyLead(person, tempICP);
        
        return {
          full_name: person.name,
          job_title: person.title,
          company_name: person.organization?.name || 'Unknown',
          company_website: person.organization?.website_url,
          company_size: getCompanySize(person.organization?.estimated_num_employees),
          industry: person.organization?.industry,
          location: `${person.city || ''}, ${person.country || ''}`.trim(),
          email: enriched?.email || '',
          phone: phoneFromSearch,
          linkedin_url: person.linkedin_url,
          fit_score: qualification.score,
          fit_reason: qualification.reason,
          fit_label: qualification.label,
        };
      })
    );
    
    console.log(`✅ Scored ${scoredLeads.length} leads`);
    
    // 8. Sort by score and take top N
    scoredLeads.sort((a, b) => b.fit_score - a.fit_score);
    const topLeads = scoredLeads.slice(0, topN);
    
    const avgScore = topLeads.length > 0 
      ? topLeads.reduce((sum, l) => sum + l.fit_score, 0) / topLeads.length 
      : 0;
    
    console.log(`✅ Returning top ${topLeads.length} leads (avg score: ${avgScore.toFixed(1)})`);
    
    // 9. Return response
    const response = {
      job_id: `apify_${apifyRunId}_${Date.now()}`,
      summary: {
        raw_leads_fetched: apolloResults.people.length,
        leads_returned: topLeads.length,
        icp_description: body.icp_description,
        average_fit_score: avgScore,
        credits_used: apolloResults.people.length,
        processing_time_ms: Date.now() - startTime,
      },
      leads: topLeads,
    };
    
    console.log('✅ Request completed successfully');
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('❌ Apify endpoint error:', error);
    
    // Check for specific errors
    if (error.message?.includes('quota') || error.message?.includes('credits')) {
      return NextResponse.json(
        {
          error: 'QuotaExceeded',
          message: 'Apollo credits exhausted. Please try again later.',
          quota_exceeded: true,
          credits_remaining: 0,
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'InternalServerError',
        message: error.message || 'An error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Translate company size ranges to Apollo format
 */
function translateCompanySizes(sizes?: string[]): string[] {
  if (!sizes || sizes.length === 0) return [];
  
  return sizes.map(size => {
    // "11-50" → "11,50"
    return size.replace('-', ',');
  });
}

/**
 * Get company size label from employee count
 */
function getCompanySize(employees?: number): string {
  if (!employees) return 'Unknown';
  
  if (employees <= 10) return '1-10';
  if (employees <= 50) return '11-50';
  if (employees <= 200) return '51-200';
  if (employees <= 500) return '201-500';
  if (employees <= 1000) return '501-1000';
  if (employees <= 5000) return '1001-5000';
  if (employees <= 10000) return '5001-10000';
  return '10000+';
}

/**
 * Log Apify usage for monitoring
 * Tracks usage by Apify Run ID (no user auth needed)
 */
async function logApifyUsage(
  apifyRunId: string, 
  clientIp: string, 
  request: ApifyRequest
): Promise<void> {
  try {
    await connectToDatabase();
    
    // Check if MongoDB connection is ready
    const mongoose = (global as any).mongoose;
    if (!mongoose || !mongoose.connection || !mongoose.connection.db) {
      console.warn('⚠️  MongoDB not connected, skipping usage log');
      return;
    }
    
    // Store in a collection for monitoring
    const db = mongoose.connection.db;
    await db.collection('apify_usage_logs').insertOne({
      apify_run_id: apifyRunId,
      client_ip: clientIp,
      icp_description: request.icp_description.substring(0, 200),
      job_titles: request.job_titles,
      max_raw_leads: request.max_raw_leads,
      top_n: request.top_n,
      timestamp: new Date(),
      source: request.source,
    });
    
    console.log('📊 Usage logged for run:', apifyRunId);
  } catch (error) {
    console.error('⚠️  Failed to log usage:', error);
    // Don't fail the request if logging fails
  }
}

