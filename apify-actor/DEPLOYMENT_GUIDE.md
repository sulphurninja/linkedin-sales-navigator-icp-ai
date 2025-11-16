# RichLead Apify Actor - Deployment Guide

Complete guide to deploying your RichLead Actor to Apify platform.

---

## Prerequisites

1. **Apify Account**
   - Create account at [apify.com](https://apify.com)
   - Verify email
   - Get your Apify API token from Settings

2. **RichLead Backend Ready**
   - Backend API endpoint deployed: `POST /api/apify/run-icp-search`
   - API key generation system in place
   - Apollo integration working
   - AI ICP scoring operational

3. **Development Tools**
   - Node.js 18+ installed
   - npm or yarn
   - Git
   - Apify CLI: `npm install -g apify-cli`

---

## Step 1: Setup Local Environment

### Clone Actor Code

```bash
cd apify-actor
npm install
```

### Configure Environment

Create `.env` file:

```env
RICHLEAD_API_KEY=your_test_api_key_here
RICHLEAD_API_BASE=http://localhost:3000  # or your staging URL
APIFY_TOKEN=your_apify_token_here
```

### Test Locally

```bash
# Run with test input
npm run dev

# Or use Apify CLI
apify run --purge
```

Create `apify_storage/key_value_stores/default/INPUT.json`:

```json
{
  "icp_description": "Founders and Heads of Marketing at B2B SaaS startups in the US with 11-200 employees",
  "job_titles": ["CEO", "Founder", "VP Marketing"],
  "locations": ["United States"],
  "company_sizes": ["11-50", "51-200"],
  "max_raw_leads": 100,
  "top_n": 50,
  "output_format": "json"
}
```

---

## Step 2: Deploy to Apify

### Initialize Apify Actor

```bash
# Login to Apify
apify login

# Push to Apify platform
apify push
```

This will:
- Build the Docker image
- Upload to Apify
- Create the Actor in your account

### Set Secrets

In Apify Console:

1. Go to your Actor
2. Click **Settings** → **Environment variables**
3. Add secrets:
   - `RICHLEAD_API_KEY` = your production API key
   - `RICHLEAD_API_BASE` = https://api.richlead.ai (production)

**Important:** Mark as "Secret" so they're encrypted!

---

## Step 3: Configure Actor Settings

### In Apify Console → Your Actor → Settings:

#### General Settings:
- **Name**: `richlead-ai-lead-finder`
- **Title**: RichLead - AI-Powered B2B Lead Discovery
- **Description**: Premium B2B lead discovery powered by Apollo.io + AI ICP scoring
- **Category**: Business
- **SEO title**: RichLead - AI Lead Discovery | Apollo + AI ICP Scoring
- **SEO description**: Get 300-500 AI-ranked B2B leads that perfectly match your ICP. Powered by Apollo.io + GPT-4. Stop wasting time on unqualified prospects.

#### Pricing:
- **Pricing model**: Pay per run
- **Price**: $49 per run (adjust based on your costs)
- **Free trial**: 1 free run (optional)

#### Resource Settings:
- **Memory**: 4096 MB
- **Timeout**: 300 seconds (5 minutes)

#### Advanced:
- **Restart on error**: No (we handle errors gracefully)
- **Build tag**: latest

---

## Step 4: Test on Apify Platform

### Run a Test

1. Go to your Actor
2. Click **Try for free**
3. Enter test input:

```json
{
  "icp_description": "Founders at early-stage B2B SaaS startups in San Francisco",
  "job_titles": ["CEO", "Founder"],
  "locations": ["San Francisco"],
  "company_sizes": ["1-10", "11-50"],
  "max_raw_leads": 100,
  "top_n": 50,
  "output_format": "both"
}
```

4. Click **Start**
5. Monitor logs
6. Verify output in Dataset

### Check Output

- **Dataset**: Should have 50 leads with fit scores
- **Key-Value Store**: 
  - `result` = full JSON response
  - `leads.csv` = CSV export (if requested)
- **Logs**: Should show clean, professional output

---

## Step 5: Publish to Apify Store

### Prepare for Publishing

1. **Upload Logo**:
   - Size: 400x400 px
   - Format: PNG with transparency
   - Branding: RichLead logo

2. **Screenshots**:
   - Input form (showing ICP fields)
   - Results dataset (showing lead data)
   - CSV export (showing downloaded file)
   - Add to Actor → Media

3. **README**:
   - Already created (see README.md)
   - Preview in Actor settings
   - Add video demo (optional but recommended)

### Submit for Review

1. Go to Actor → **Publishing**
2. Click **Submit for publication**
3. Apify team will review (1-3 days)
4. They may ask for:
   - Proof of Apollo API compliance
   - Data privacy policy
   - Demo run results

---

## Step 6: Backend Implementation

### Create the API Endpoint

In your Next.js backend:

```typescript
// app/api/apify/run-icp-search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { searchPeople } from '@/lib/apollo';
import { batchEnrichPeople } from '@/lib/apollo-enrich';
import { qualifyLead } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey || !await isValidApiKey(apiKey)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API key' },
        { status: 401 }
      );
    }

    // 2. Parse & validate input
    const body = await request.json();
    if (!body.icp_description || body.icp_description.length < 50) {
      return NextResponse.json(
        { error: 'ValidationError', message: 'ICP description required (min 50 chars)' },
        { status: 400 }
      );
    }

    // 3. Enforce limits
    const maxRawLeads = Math.min(body.max_raw_leads, 1000);
    const topN = Math.min(body.top_n, 500);

    // 4. Check Apollo credits
    const creditsRemaining = await getApolloCredits();
    if (creditsRemaining < maxRawLeads) {
      return NextResponse.json(
        {
          error: 'QuotaExceeded',
          message: 'Insufficient Apollo credits',
          quota_exceeded: true,
          credits_remaining: creditsRemaining,
        },
        { status: 402 }
      );
    }

    // 5. Search Apollo
    const apolloResults = await searchPeople({
      person_titles: body.job_titles,
      person_locations: body.locations,
      organization_num_employees_ranges: translateCompanySizes(body.company_sizes),
      per_page: maxRawLeads,
    });

    // 6. Enrich emails
    const enrichedLeads = await batchEnrichPeople(
      apolloResults.people.map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        organization_name: p.organization?.name,
        domain: p.organization?.website_url,
        linkedin_url: p.linkedin_url,
      }))
    );

    // 7. AI scoring
    const scoredLeads = await Promise.all(
      apolloResults.people.map(async (person) => {
        const enriched = enrichedLeads.get(person.id);
        const score = await scoreAgainstICP(person, body.icp_description);
        
        return {
          full_name: person.name,
          job_title: person.title,
          company_name: person.organization?.name || '',
          company_website: person.organization?.website_url,
          company_size: person.organization?.estimated_num_employees,
          industry: person.organization?.industry,
          location: `${person.city}, ${person.country}`,
          email: enriched?.email || '',
          phone: extractPhoneNumber(person.phone_numbers),
          linkedin_url: person.linkedin_url,
          fit_score: score.score,
          fit_reason: score.reason,
          fit_label: score.label,
        };
      })
    );

    // 8. Sort and take top N
    scoredLeads.sort((a, b) => b.fit_score - a.fit_score);
    const topLeads = scoredLeads.slice(0, topN);

    // 9. Log usage
    await logApifyRun({
      api_key: apiKey,
      apify_run_id: body.apify_run_id,
      leads_fetched: apolloResults.people.length,
      leads_returned: topLeads.length,
      credits_used: apolloResults.people.length,
    });

    // 10. Return response
    return NextResponse.json({
      job_id: generateJobId(),
      summary: {
        raw_leads_fetched: apolloResults.people.length,
        leads_returned: topLeads.length,
        icp_description: body.icp_description,
        average_fit_score: average(topLeads.map(l => l.fit_score)),
        credits_used: apolloResults.people.length,
      },
      leads: topLeads,
    });

  } catch (error) {
    console.error('Apify API error:', error);
    return NextResponse.json(
      { error: 'InternalServerError', message: 'Processing failed' },
      { status: 500 }
    );
  }
}

// Helper: Validate API key
async function isValidApiKey(key: string): Promise<boolean> {
  // Check against your API keys collection in MongoDB
  const db = await connectToDatabase();
  const apiKey = await db.collection('apify_api_keys').findOne({ key });
  return !!apiKey && apiKey.active;
}

// Helper: Translate company sizes
function translateCompanySizes(sizes?: string[]): string[] {
  if (!sizes) return [];
  return sizes.map(size => {
    // "1-10" → "1,10"
    return size.replace('-', ',');
  });
}

// Helper: Score lead against ICP
async function scoreAgainstICP(person: any, icp: string) {
  // Use your existing qualifyLead function
  // Or create a simpler version for Apify
  const result = await qualifyLead(person, { description: icp });
  return {
    score: result.score,
    reason: result.reason,
    label: result.label,
  };
}
```

---

## Step 7: Monitoring & Maintenance

### Monitor Usage

Create admin dashboard to track:
- Total runs per day/week/month
- Apollo credits consumed
- Average leads per run
- Revenue (if monetized)
- Error rates

### Apollo Credit Management

```typescript
// Set alerts for low credits
if (creditsRemaining < 1000) {
  await sendAlert({
    type: 'low_credits',
    credits: creditsRemaining,
    message: 'Apollo credits running low - consider purchasing add-ons'
  });
}

// Auto-stop if depleted
if (creditsRemaining === 0) {
  await pauseActor();
  await sendAlert({
    type: 'credits_depleted',
    message: 'Actor paused - Apollo credits exhausted'
  });
}
```

### Update Limits

As you scale Apollo credits, update `CONFIG` in `src/main.ts`:

```typescript
const CONFIG = {
  ABSOLUTE_MAX_RAW_LEADS: 2000,  // Increased from 1000
  ABSOLUTE_MAX_TOP_N: 1000,      // Increased from 500
  // ...
};
```

Then redeploy:

```bash
apify push
```

---

## Step 8: Marketing & Growth

### Optimize Apify Listing

- **Keywords**: B2B leads, Apollo, lead generation, ICP, AI scoring
- **Tags**: sales, marketing, outreach, enrichment
- **Category**: Business → Lead Generation

### Promote Actor

- Blog post: "How to Find Perfect B2B Leads with AI"
- Video demo on YouTube
- Share on LinkedIn, Twitter, ProductHunt
- Add to your RichLead website

### Pricing Strategy

**Tier 1 (Current - Professional Plan):**
- $49/run
- Up to 300-500 leads per run
- Max 1000 raw leads fetched

**Tier 2 (Future - With Add-on Credits):**
- $99/run
- Up to 1000 leads per run
- Max 2000 raw leads fetched

**Enterprise (Future):**
- Custom pricing
- Unlimited leads
- Dedicated support
- API access

---

## Troubleshooting

### Actor Fails with Timeout

- Increase memory: 4GB → 8GB
- Increase timeout: 5min → 10min
- Optimize backend API (caching, parallel processing)

### No Emails Returned

- Check Apollo API key is Master Key
- Verify enrichment is working
- Check logs for enrichment errors

### High Apollo Credit Usage

- Users setting max_raw_leads too high
- Adjust pricing to cover costs
- Consider caching common searches

### Actor Not Showing in Store

- Check publication status
- Ensure all required fields filled
- Contact Apify support

---

## Support

- **Apify Docs**: [docs.apify.com](https://docs.apify.com)
- **RichLead Support**: support@richlead.ai
- **Actor Issues**: GitHub issues (if public repo)

---

## Checklist

Before going live:

- [ ] Backend API deployed and tested
- [ ] API key system implemented
- [ ] Actor tested locally
- [ ] Actor deployed to Apify
- [ ] Secrets configured
- [ ] Test run successful on Apify
- [ ] README polished
- [ ] Screenshots uploaded
- [ ] Logo uploaded
- [ ] Pricing configured
- [ ] Monitoring setup
- [ ] Apollo credit alerts configured
- [ ] Submitted for publication
- [ ] Marketing materials ready

**You're ready to launch! 🚀**

