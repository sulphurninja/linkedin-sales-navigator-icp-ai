# RichLead Backend API Contract

This document defines the exact API contract between the Apify Actor and your RichLead backend.

---

## Endpoint

```
POST https://api.richlead.ai/api/apify/run-icp-search
```

---

## Authentication

```http
Authorization: Bearer {RICHLEAD_API_KEY}
X-Actor-Version: 1.0.0
Content-Type: application/json
```

### Where to get `RICHLEAD_API_KEY`:
- Generate in your RichLead admin panel
- Set as Apify Actor secret (encrypted, never exposed)
- Validate on backend to track usage per Actor run

---

## Request Body

```typescript
interface RichLeadAPIRequest {
  // ICP & Filters
  icp_description: string;              // Natural language ICP (50-2000 chars)
  job_titles: string[];                 // Required, 1-20 titles
  locations?: string[];                 // Optional geographic filters
  industries?: string[];                // Optional industry filters
  company_sizes?: string[];             // Optional: ["1-10", "11-50", ...]
  keywords_include?: string[];          // Optional: must include these
  keywords_exclude?: string[];          // Optional: must NOT include these
  
  // Limits
  max_raw_leads: number;                // Max leads to fetch from Apollo (1-1000)
  top_n: number;                        // Max leads to return after AI (50-500)
  
  // Metadata
  apify_run_id: string;                 // Apify run ID for tracking
  source: string;                       // "apify_actor_v1.0.0"
}
```

### Example Request:

```json
{
  "icp_description": "Founders and Heads of Marketing at B2B SaaS startups in the US with 11-200 employees, using HubSpot or Salesforce, interested in AI automation.",
  "job_titles": ["CEO", "Founder", "VP Marketing", "Head of Marketing"],
  "locations": ["United States", "San Francisco", "New York"],
  "industries": ["SaaS", "Software"],
  "company_sizes": ["11-50", "51-200", "201-500"],
  "keywords_include": ["AI", "automation", "CRM"],
  "keywords_exclude": ["student", "intern", "recruiter"],
  "max_raw_leads": 1000,
  "top_n": 300,
  "apify_run_id": "qwerty123456",
  "source": "apify_actor_v1.0.0"
}
```

---

## Success Response (200 OK)

```typescript
interface RichLeadAPIResponse {
  job_id: string;                       // Unique job ID for tracking
  summary: {
    raw_leads_fetched: number;          // How many fetched from Apollo
    leads_returned: number;             // How many returned after AI scoring
    icp_description: string;            // Echo back the ICP
    average_fit_score: number;          // Average score of returned leads (0-100)
    credits_used?: number;              // Optional: Apollo credits consumed
  };
  leads: Lead[];                        // Array of top-ranked leads
}

interface Lead {
  // Core Info
  full_name: string;                    // "John Doe"
  job_title: string;                    // "VP of Marketing"
  company_name: string;                 // "Acme SaaS Inc"
  company_website?: string;             // "https://acme.com"
  company_size?: string;                // "51-200"
  industry?: string;                    // "SaaS"
  location: string;                     // "San Francisco, United States"
  
  // Contact Info (if available)
  email?: string;                       // "john.doe@acme.com"
  phone?: string;                       // "+1-555-123-4567"
  linkedin_url?: string;                // "https://linkedin.com/in/johndoe"
  
  // AI Scoring
  fit_score: number;                    // 0-100, higher = better fit
  fit_reason: string;                   // AI explanation of why this is a good fit
  fit_label?: 'good' | 'maybe' | 'bad'; // Optional categorical label
}
```

### Example Success Response:

```json
{
  "job_id": "richlead_20241116_abc123",
  "summary": {
    "raw_leads_fetched": 1000,
    "leads_returned": 300,
    "icp_description": "Founders and Heads of Marketing at B2B SaaS...",
    "average_fit_score": 84.2,
    "credits_used": 1000
  },
  "leads": [
    {
      "full_name": "Sarah Johnson",
      "job_title": "VP of Marketing",
      "company_name": "CloudTech SaaS",
      "company_website": "https://cloudtech.com",
      "company_size": "51-200",
      "industry": "SaaS",
      "location": "San Francisco, United States",
      "email": "sarah.johnson@cloudtech.com",
      "phone": "+1-555-987-6543",
      "linkedin_url": "https://linkedin.com/in/sarahjohnson",
      "fit_score": 95,
      "fit_reason": "Perfect ICP match: VP Marketing at 51-200 person B2B SaaS in SF. LinkedIn mentions HubSpot and AI automation. Company uses Salesforce.",
      "fit_label": "good"
    },
    {
      "full_name": "Michael Chen",
      "job_title": "Founder & CEO",
      "company_name": "GrowthAI",
      "company_website": "https://growthai.io",
      "company_size": "11-50",
      "industry": "Software",
      "location": "New York, United States",
      "email": "michael@growthai.io",
      "linkedin_url": "https://linkedin.com/in/michaelchen",
      "fit_score": 92,
      "fit_reason": "Excellent fit: Founder of 11-50 person AI SaaS startup in NYC. Active in automation space, mentions CRM integration needs.",
      "fit_label": "good"
    }
    // ... 298 more leads
  ]
}
```

---

## Error Responses

### 400 Bad Request - Invalid Input

```json
{
  "error": "ValidationError",
  "message": "icp_description must be at least 50 characters"
}
```

### 401 Unauthorized - Invalid API Key

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

### 429 Too Many Requests - Rate Limit

```json
{
  "error": "RateLimitExceeded",
  "message": "Too many requests. Please wait before retrying.",
  "retry_after": 60
}
```

### 402 Payment Required - Quota Exceeded

```json
{
  "error": "QuotaExceeded",
  "message": "Apollo Professional plan quota reached for this month. Please upgrade or wait for monthly reset.",
  "quota_exceeded": true,
  "credits_remaining": 0
}
```

### 500 Internal Server Error

```json
{
  "error": "InternalServerError",
  "message": "An error occurred while processing your request. Please try again."
}
```

### 503 Service Unavailable - Apollo API Down

```json
{
  "error": "ServiceUnavailable",
  "message": "Apollo API is temporarily unavailable. Please try again later."
}
```

---

## Implementation Notes for Backend

### 1. Authentication
```typescript
// Verify API key from header
const apiKey = req.headers.authorization?.replace('Bearer ', '');
if (!apiKey || !isValidApiKey(apiKey)) {
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Invalid or missing API key'
  });
}
```

### 2. Input Validation
```typescript
// Validate required fields
if (!body.icp_description || body.icp_description.length < 50) {
  return res.status(400).json({
    error: 'ValidationError',
    message: 'icp_description must be at least 50 characters'
  });
}

// Enforce hard limits
const maxRawLeads = Math.min(body.max_raw_leads, 1000);
const topN = Math.min(body.top_n, 500);
```

### 3. Apollo Search
```typescript
// Translate filters to Apollo API
const apolloFilters = {
  person_titles: body.job_titles,
  person_locations: body.locations,
  organization_num_employees_ranges: translateCompanySizes(body.company_sizes),
  q_keywords: body.keywords_include?.join(' '),
  // ... etc
  per_page: maxRawLeads,
};

const apolloResults = await searchPeople(apolloFilters);
```

### 4. AI Scoring
```typescript
// Score each lead against ICP
const scoredLeads = await Promise.all(
  apolloResults.people.map(async (person) => {
    const score = await scoreLeadAgainstICP(person, body.icp_description);
    return {
      ...person,
      fit_score: score.score,
      fit_reason: score.reason,
      fit_label: score.label,
    };
  })
);

// Sort by score descending
scoredLeads.sort((a, b) => b.fit_score - a.fit_score);

// Return top N
const topLeads = scoredLeads.slice(0, topN);
```

### 5. Credit Tracking
```typescript
// Track Apollo credits used
await logCreditUsage({
  api_key: apiKey,
  apify_run_id: body.apify_run_id,
  credits_used: apolloResults.people.length,
  timestamp: new Date(),
});

// Check if approaching limits
const remainingCredits = await getRemainingCredits(apiKey);
if (remainingCredits < 100) {
  // Send alert email
  await sendLowCreditAlert(apiKey);
}
```

### 6. Response Format
```typescript
return res.status(200).json({
  job_id: generateJobId(),
  summary: {
    raw_leads_fetched: apolloResults.people.length,
    leads_returned: topLeads.length,
    icp_description: body.icp_description,
    average_fit_score: calculateAverage(topLeads.map(l => l.fit_score)),
    credits_used: apolloResults.people.length,
  },
  leads: topLeads.map(formatLead),
});
```

---

## Testing the API

### Using cURL:

```bash
curl -X POST https://api.richlead.ai/api/apify/run-icp-search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Actor-Version: 1.0.0" \
  -d '{
    "icp_description": "Founders at B2B SaaS startups in the US",
    "job_titles": ["CEO", "Founder"],
    "locations": ["United States"],
    "max_raw_leads": 100,
    "top_n": 50,
    "apify_run_id": "test_run_123",
    "source": "manual_test"
  }'
```

### Using Postman:
1. Import the example requests
2. Set Authorization header with your API key
3. Adjust the request body as needed
4. Send request and verify response format

---

## Performance SLAs

- **Expected response time**: 30-90 seconds for 1000 leads
- **Timeout**: 120 seconds (2 minutes)
- **Retry policy**: Actor will retry 2x on 5xx errors
- **Rate limit**: TBD based on load (suggest 10 requests/minute per API key)

---

## Monitoring & Logging

Log these events on backend:
- API key used
- Apify run ID
- Input parameters (ICP, filters, limits)
- Apollo credits consumed
- Processing time
- Number of leads fetched vs returned
- Average fit score
- Any errors or warnings

This enables:
- Usage tracking per Actor run
- Apollo credit forecasting
- Performance optimization
- Debugging failed runs
- Customer support

---

## Security Considerations

1. **API Key**: Never expose in client code, always in backend
2. **Rate Limiting**: Prevent abuse with per-key limits
3. **Input Sanitization**: Validate all inputs, escape for Apollo API
4. **Credit Guards**: Hard-stop if monthly quota exhausted
5. **Logging**: Log IP, timestamps, usage for audit trail

---

## Scaling Considerations

### Current (Professional Plan):
- Max 1,000 leads per run
- ~1,000-2,000 leads per month total
- Handle 5-10 Actor runs per day

### Future (With Add-on Credits):
- Increase `ABSOLUTE_MAX_RAW_LEADS` to 2,000 / 5,000 / 10,000
- Increase `ABSOLUTE_MAX_TOP_N` to 500 / 1,000 / 2,000
- Scale backend to handle more concurrent requests
- Consider caching Apollo results for common searches
- Implement job queue for async processing

---

## Questions?

Contact: support@richlead.ai

