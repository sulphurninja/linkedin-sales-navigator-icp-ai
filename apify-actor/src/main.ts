/**
 * LinkedIn Sales Navigator AI ICP Lead Extractor (No Cookies Required)
 * 
 * Extract B2B leads with Sales Navigator quality filtering + AI-powered ICP scoring
 * No LinkedIn cookies, login, or browser automation needed
 * Returns only the TOP 300-500 best-fit prospects for your ICP
 * 
 * @version 1.0.0
 * @author Backtick (backtick.app)
 */

import { Actor, log } from 'apify';
import axios, { AxiosError } from 'axios';

// ============================================================================
// CONFIGURATION - ADJUST THESE AS APOLLO CREDITS SCALE
// ============================================================================

const CONFIG = {
  // Backend API (your WowLead platform)
  BACKTICK_API_BASE: process.env.BACKTICK_API_BASE || 'https://wowlead.vercel.app',
  // No API key needed! Actor calls your backend directly
  
  // Hard limits (safety guards)
  ABSOLUTE_MAX_RAW_LEADS: 1000,    // Never fetch more than this from LinkedIn Sales Navigator
  ABSOLUTE_MAX_TOP_N: 500,         // Never return more than this
  
  // API timeouts
  API_TIMEOUT_MS: 120000,          // 2 minutes for backend processing
  MAX_RETRIES: 2,                  // Retry failed API calls
  RETRY_DELAY_MS: 3000,            // Wait before retry
  
  // Version
  ACTOR_VERSION: '1.0.0',
};

// ============================================================================
// TYPES
// ============================================================================

interface ActorInput {
  icp_description: string;
  job_titles: string[];
  locations?: string[];
  industries?: string[];
  company_sizes?: string[];
  keywords_include?: string[];
  keywords_exclude?: string[];
  max_raw_leads?: number;
  top_n?: number;
  output_format?: 'json' | 'csv' | 'both';
}

interface BacktickAPIRequest {
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

interface BacktickAPIResponse {
  job_id: string;
  summary: {
    raw_leads_fetched: number;
    leads_returned: number;
    icp_description: string;
    average_fit_score: number;
    credits_used?: number;
  };
  leads: Lead[];
}

interface ErrorResponse {
  error: string;
  message: string;
  quota_exceeded?: boolean;
  credits_remaining?: number;
}

// ============================================================================
// MAIN ACTOR LOGIC
// ============================================================================

Actor.main(async () => {
  log.info('🚀 LinkedIn Sales Navigator AI ICP Lead Extractor started');
  log.info('📋 No cookies required - Sales Navigator quality results');
  log.info(`📌 Version: ${CONFIG.ACTOR_VERSION}`);
  
  // Get input
  const input = await Actor.getInput<ActorInput>();
  if (!input) {
    throw new Error('❌ No input provided!');
  }
  
  // Validate input
  log.info('✅ Validating input...');
  validateInput(input);
  
  // Get Apify run context
  const runId = process.env.APIFY_ACTOR_RUN_ID || 'local_test';
  
  // Enforce hard limits (safety first!)
  const safeMaxRawLeads = Math.min(
    input.max_raw_leads || 1000,
    CONFIG.ABSOLUTE_MAX_RAW_LEADS
  );
  const safeTopN = Math.min(
    input.top_n || 300,
    CONFIG.ABSOLUTE_MAX_TOP_N
  );
  
  log.info('📊 Run Configuration:', {
    maxRawLeads: safeMaxRawLeads,
    topNLeads: safeTopN,
    outputFormat: input.output_format || 'json',
    runId,
  });
  
  // Build API request
  const apiRequest: BacktickAPIRequest = {
    icp_description: input.icp_description,
    job_titles: input.job_titles,
    locations: input.locations,
    industries: input.industries,
    company_sizes: input.company_sizes,
    keywords_include: input.keywords_include,
    keywords_exclude: input.keywords_exclude,
    max_raw_leads: safeMaxRawLeads,
    top_n: safeTopN,
    apify_run_id: runId,
    source: `apify_actor_v${CONFIG.ACTOR_VERSION}`,
  };
  
  log.info('🔍 Searching for leads with Sales Navigator-quality filtering...');
  log.info(`📋 ICP: ${input.icp_description.substring(0, 100)}...`);
  log.info(`🎯 Target Titles: ${input.job_titles.join(', ')}`);
  log.info(`📊 Will fetch ${safeMaxRawLeads} leads, return top ${safeTopN} ICP matches`);
  
  try {
    // Call Backtick backend
    const response = await callBacktickAPI(apiRequest);
    
    log.info('✅ Successfully extracted and scored leads!');
    log.info('📊 Results Summary:', {
      totalSearched: response.summary.raw_leads_fetched,
      topICPMatches: response.summary.leads_returned,
      avgFitScore: response.summary.average_fit_score.toFixed(1) + '/100',
      processingTime: (response.summary.processing_time_ms / 1000).toFixed(1) + 's',
    });
    
    // Save leads to Apify dataset
    log.info('💾 Saving leads to Apify dataset...');
    await Actor.pushData(response.leads);
    
    // Save full result to key-value store
    log.info('💾 Saving full result to key-value store...');
    await Actor.setValue('result', {
      job_id: response.job_id,
      summary: response.summary,
      leads: response.leads,
      actor_version: CONFIG.ACTOR_VERSION,
      run_id: runId,
      completed_at: new Date().toISOString(),
    });
    
    // Save CSV if requested
    if (input.output_format === 'csv' || input.output_format === 'both') {
      log.info('📄 Generating CSV export...');
      const csv = convertToCSV(response.leads);
      await Actor.setValue('leads.csv', csv, { contentType: 'text/csv' });
    }
    
    // Log success summary
    log.info('');
    log.info('');
    log.info('🎉 =========================================');
    log.info('🎉 LinkedIn Sales Navigator Extraction Complete!');
    log.info('🎉 =========================================');
    log.info(`📊 Searched: ${response.summary.raw_leads_fetched} total leads`);
    log.info(`🎯 Returned: ${response.summary.leads_returned} top ICP matches`);
    log.info(`⭐ Average ICP fit score: ${response.summary.average_fit_score.toFixed(1)}/100`);
    log.info(`⚡ Processing time: ${(response.summary.processing_time_ms / 1000).toFixed(1)}s`);
    log.info('');
    log.info('📥 Output available in:');
    log.info('   • Dataset (for CSV/JSON download)');
    log.info('   • Key-value store (full result JSON)');
    if (input.output_format === 'csv' || input.output_format === 'both') {
      log.info('   • leads.csv (CSV export)');
    }
    log.info('');
    
  } catch (error) {
    await handleError(error);
    throw error; // Re-throw to mark run as failed
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate actor input
 */
function validateInput(input: ActorInput): void {
  if (!input.icp_description || input.icp_description.length < 50) {
    throw new Error('❌ ICP description is required and must be at least 50 characters');
  }
  
  if (!input.job_titles || input.job_titles.length === 0) {
    throw new Error('❌ At least one job title is required');
  }
  
  if (input.job_titles.length > 20) {
    throw new Error('❌ Maximum 20 job titles allowed');
  }
  
  if (input.max_raw_leads && input.max_raw_leads > CONFIG.ABSOLUTE_MAX_RAW_LEADS) {
    log.warning(`⚠️  max_raw_leads capped at ${CONFIG.ABSOLUTE_MAX_RAW_LEADS} (safety limit)`);
  }
  
  if (input.top_n && input.top_n > CONFIG.ABSOLUTE_MAX_TOP_N) {
    log.warning(`⚠️  top_n capped at ${CONFIG.ABSOLUTE_MAX_TOP_N}`);
  }
  
  log.info('✅ Input validation passed');
}

/**
 * Call Backtick backend API with retry logic
 */
async function callBacktickAPI(request: BacktickAPIRequest): Promise<BacktickAPIResponse> {
  const url = `${CONFIG.BACKTICK_API_BASE}/api/apify/run-icp-search`;
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES + 1; attempt++) {
    try {
      log.info(`🌐 API Call attempt ${attempt}/${CONFIG.MAX_RETRIES + 1}...`);
      
      const response = await axios.post<BacktickAPIResponse>(url, request, {
        headers: {
          'Content-Type': 'application/json',
          'X-Actor-Version': CONFIG.ACTOR_VERSION,
          'X-Apify-Run-Id': request.apify_run_id, // Track usage by Apify run
        },
        timeout: CONFIG.API_TIMEOUT_MS,
      });
      
      return response.data;
      
    } catch (error) {
      lastError = error as Error;
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        
        // Don't retry on client errors (4xx)
        if (axiosError.response?.status && axiosError.response.status < 500) {
          log.error('❌ Client error (not retrying):', axiosError.response.data);
          throw new Error(
            axiosError.response.data?.message || 
            axiosError.response.data?.error ||
            'API request failed'
          );
        }
        
        // Retry on server errors (5xx) or network issues
        if (attempt < CONFIG.MAX_RETRIES + 1) {
          log.warning(`⚠️  Server error, retrying in ${CONFIG.RETRY_DELAY_MS}ms...`);
          await sleep(CONFIG.RETRY_DELAY_MS);
          continue;
        }
      }
      
      throw lastError;
    }
  }
  
  throw lastError || new Error('API call failed after retries');
}

/**
 * Handle errors gracefully
 */
async function handleError(error: unknown): Promise<void> {
  log.error('❌ =========================================');
  log.error('❌ LinkedIn Sales Navigator Extraction Failed');
  log.error('❌ =========================================');
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const errorData = axiosError.response?.data;
    
    if (errorData) {
      log.error(`❌ Error: ${errorData.error || errorData.message}`);
      
      if (errorData.quota_exceeded) {
        log.error('');
        log.error('💳 QUOTA EXCEEDED');
        log.error('   Your monthly quota has been reached.');
        log.error('   Options:');
        log.error('   1. Wait for monthly reset');
        log.error('   2. Purchase additional credits at backtick.app');
        log.error('   3. Upgrade to higher plan');
        log.error('');
        if (errorData.credits_remaining !== undefined) {
          log.error(`   Credits remaining: ${errorData.credits_remaining}`);
        }
      }
      
      // Save error details to key-value store
      await Actor.setValue('error', {
        error: errorData.error,
        message: errorData.message,
        quota_exceeded: errorData.quota_exceeded,
        credits_remaining: errorData.credits_remaining,
        timestamp: new Date().toISOString(),
      });
    }
  } else if (error instanceof Error) {
    log.error(`❌ Error: ${error.message}`);
    await Actor.setValue('error', {
      error: 'ActorError',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
  
  log.error('');
  log.error('📧 Need help? Contact: aditya@backtick.app');
  log.error('');
}

/**
 * Convert leads to CSV format
 */
function convertToCSV(leads: Lead[]): string {
  if (leads.length === 0) {
    return 'No leads found';
  }
  
  // CSV headers
  const headers = [
    'Full Name',
    'Job Title',
    'Company Name',
    'Company Website',
    'Company Size',
    'Industry',
    'Location',
    'Email',
    'Phone',
    'LinkedIn URL',
    'Fit Score',
    'Fit Reason',
    'Fit Label',
  ];
  
  // CSV rows
  const rows = leads.map(lead => [
    escapeCsv(lead.full_name),
    escapeCsv(lead.job_title),
    escapeCsv(lead.company_name),
    escapeCsv(lead.company_website || ''),
    escapeCsv(lead.company_size || ''),
    escapeCsv(lead.industry || ''),
    escapeCsv(lead.location),
    escapeCsv(lead.email || ''),
    escapeCsv(lead.phone || ''),
    escapeCsv(lead.linkedin_url || ''),
    lead.fit_score.toString(),
    escapeCsv(lead.fit_reason),
    escapeCsv(lead.fit_label || ''),
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Escape CSV values
 */
function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

