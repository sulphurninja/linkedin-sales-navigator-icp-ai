# RichLead Actor Configuration Guide

This document explains all configuration options and how to adjust them as you scale.

---

## Core Configuration (src/main.ts)

All magic numbers are centralized in the `CONFIG` object at the top of `main.ts`:

```typescript
const CONFIG = {
  // ============================================================================
  // BACKEND API CONFIGURATION
  // ============================================================================
  
  // RichLead API base URL
  // Development: http://localhost:3000
  // Staging: https://staging.richlead.ai
  // Production: https://api.richlead.ai
  RICHLEAD_API_BASE: process.env.RICHLEAD_API_BASE || 'https://api.richlead.ai',
  
  // API key (set in Apify Actor secrets, NEVER hardcode!)
  RICHLEAD_API_KEY: process.env.RICHLEAD_API_KEY!,
  
  // ============================================================================
  // APOLLO CREDIT LIMITS (ADJUST AS YOU SCALE)
  // ============================================================================
  
  // Maximum leads to fetch from Apollo in a single run
  // Current: 1000 (Apollo Professional plan limit)
  // Future:  2000, 5000, 10000 (with add-on credits)
  ABSOLUTE_MAX_RAW_LEADS: 1000,
  
  // Maximum leads to return after AI scoring
  // Current: 500 (conservative for Professional plan)
  // Future:  1000, 2000, 5000 (as credits increase)
  ABSOLUTE_MAX_TOP_N: 500,
  
  // ============================================================================
  // API TIMEOUTS & RETRIES
  // ============================================================================
  
  // How long to wait for backend response (milliseconds)
  // Increase if processing many leads or AI is slow
  API_TIMEOUT_MS: 120000,  // 2 minutes
  
  // How many times to retry failed API calls
  MAX_RETRIES: 2,
  
  // Delay between retries (milliseconds)
  RETRY_DELAY_MS: 3000,  // 3 seconds
  
  // ============================================================================
  // VERSIONING
  // ============================================================================
  
  ACTOR_VERSION: '1.0.0',
};
```

---

## Scaling Configuration

### Phase 1: Professional Plan (Current)
**Apollo Credits**: ~1,000-2,000/month included

```typescript
ABSOLUTE_MAX_RAW_LEADS: 1000,
ABSOLUTE_MAX_TOP_N: 500,
```

**Recommended pricing**: $49/run  
**Expected usage**: 5-10 runs/month  
**Total leads/month**: 5,000-10,000 raw → 2,500-5,000 returned

---

### Phase 2: With Add-on Credits
**Apollo Credits**: Purchase 10,000-50,000 add-on credits

```typescript
ABSOLUTE_MAX_RAW_LEADS: 2000,
ABSOLUTE_MAX_TOP_N: 1000,
```

**Recommended pricing**: $79-99/run  
**Expected usage**: 20-50 runs/month  
**Total leads/month**: 40,000-100,000 raw → 20,000-50,000 returned

---

### Phase 3: Enterprise Scale
**Apollo Credits**: 100,000+ per month

```typescript
ABSOLUTE_MAX_RAW_LEADS: 5000,
ABSOLUTE_MAX_TOP_N: 2000,
```

**Recommended pricing**: $149-299/run or custom  
**Expected usage**: 50-100+ runs/month  
**Total leads/month**: 250,000-500,000 raw → 100,000-200,000 returned

---

## Environment Variables

### Required (Set in Apify Actor Secrets)

```env
# Production API key (REQUIRED)
RICHLEAD_API_KEY=rk_prod_abc123xyz789

# Production API base (REQUIRED)
RICHLEAD_API_BASE=https://api.richlead.ai
```

### Optional (Auto-set by Apify)

```env
# Apify run ID (auto-set)
APIFY_ACTOR_RUN_ID=qwerty123456

# Apify token (for SDK access)
APIFY_TOKEN=apify_token_here
```

---

## Input Schema Limits

### Current Limits (input_schema.json)

```json
{
  "icp_description": {
    "minLength": 50,
    "maxLength": 2000
  },
  "job_titles": {
    "minItems": 1,
    "maxItems": 20
  },
  "max_raw_leads": {
    "minimum": 100,
    "maximum": 1000,    // ← ADJUST THIS
    "default": 1000
  },
  "top_n": {
    "minimum": 50,
    "maximum": 500,     // ← ADJUST THIS
    "default": 300
  }
}
```

### How to Increase Limits

1. Update `input_schema.json`:
```json
"max_raw_leads": {
  "maximum": 2000  // Increased
}
```

2. Update `src/main.ts` CONFIG:
```typescript
ABSOLUTE_MAX_RAW_LEADS: 2000
```

3. Update pricing to reflect higher credit usage

4. Redeploy:
```bash
apify push
```

---

## Performance Tuning

### If Runs Are Slow

**Increase timeout:**
```typescript
API_TIMEOUT_MS: 180000,  // 3 minutes instead of 2
```

**Increase Apify memory:**
- Go to Actor → Settings → Resource settings
- Increase memory: 4GB → 8GB
- Cost increases proportionally

### If API Calls Fail Often

**Increase retries:**
```typescript
MAX_RETRIES: 3,           // Try 4 times total
RETRY_DELAY_MS: 5000,     // Wait 5 seconds between retries
```

### If Backend is Slow

**Backend optimizations:**
- Cache Apollo results for common searches
- Parallelize AI scoring calls
- Use faster OpenAI model (gpt-3.5-turbo instead of gpt-4)
- Implement result streaming (advanced)

---

## Credit Usage Calculations

### Formula:
```
Credits Used = raw_leads_fetched
Revenue = runs * price_per_run
Profit = Revenue - (Credits Used * apollo_cost_per_credit)
```

### Example (Current Setup):

**Assumptions:**
- Apollo Professional: $99/month = ~2,000 credits included
- Additional credits: $0.05 per credit
- Apify price: $49 per run

**Scenario:**
- 10 runs/month
- 1,000 leads per run
- Total: 10,000 leads/month

**Costs:**
- Apollo: $99/month (included 2,000 credits) + $400 (8,000 additional @ $0.05)
- Total: $499/month

**Revenue:**
- 10 runs × $49 = $490/month

**⚠️ Break-even!** Need to either:
- Increase price to $59-69
- Get Apollo discount for volume
- Increase runs (economies of scale)

### Better Scenario (With More Runs):

- 20 runs/month @ $49 = $980 revenue
- Apollo: $99 + $900 (18,000 credits) = $999 cost
- **Still break-even!**

### Profitable Scenario:

- **Pricing**: $79/run
- **Runs**: 20/month
- **Revenue**: $1,580
- **Apollo Cost**: $999
- **Profit**: $581/month (37% margin)

**OR**

- **Pricing**: $49/run
- **Runs**: 50/month
- **Revenue**: $2,450
- **Apollo Cost**: ~$2,499 (48,000 credits)
- **Break-even at volume**, but user acquisition is the win

---

## Safety Guards

### Hard Limits Enforcement

The Actor enforces limits even if users try to bypass them:

```typescript
// User requests 5000 leads
const userInput = { max_raw_leads: 5000 };

// Actor caps it automatically
const safeMaxRawLeads = Math.min(
  userInput.max_raw_leads,
  CONFIG.ABSOLUTE_MAX_RAW_LEADS  // 1000
);
// Result: 1000 (capped)
```

### Backend Should Also Enforce

**Double-check on backend:**
```typescript
// In backend API
const maxAllowed = 1000;
if (body.max_raw_leads > maxAllowed) {
  return res.status(400).json({
    error: 'LimitExceeded',
    message: `Maximum ${maxAllowed} leads allowed per run`
  });
}
```

---

## Monitoring Configuration

### What to Track

1. **Per Run:**
   - Apify run ID
   - API key used
   - Raw leads fetched
   - Leads returned
   - Credits consumed
   - Processing time
   - Success/failure

2. **Aggregate (Daily/Monthly):**
   - Total runs
   - Total credits used
   - Average leads per run
   - Error rate
   - Revenue (if monetized)

### Alert Thresholds

```typescript
// Low credits warning
if (creditsRemaining < 1000) {
  sendAlert('LOW_CREDITS', creditsRemaining);
}

// Critical: credits depleted
if (creditsRemaining === 0) {
  pauseActor();
  sendAlert('NO_CREDITS');
}

// High error rate
if (errorRate > 0.1) {  // 10% errors
  sendAlert('HIGH_ERROR_RATE', errorRate);
}

// Approaching monthly quota
const daysLeft = 30 - new Date().getDate();
const projectedUsage = (creditsUsedThisMonth / new Date().getDate()) * 30;
if (projectedUsage > monthlyQuota * 0.9) {
  sendAlert('QUOTA_WARNING', {
    projected: projectedUsage,
    quota: monthlyQuota,
    daysLeft,
  });
}
```

---

## Checklist for Scaling Up

When increasing limits:

- [ ] Purchase Apollo add-on credits
- [ ] Update `CONFIG.ABSOLUTE_MAX_RAW_LEADS`
- [ ] Update `CONFIG.ABSOLUTE_MAX_TOP_N`
- [ ] Update `input_schema.json` maximums
- [ ] Update pricing on Apify
- [ ] Test with new limits locally
- [ ] Deploy to Apify: `apify push`
- [ ] Run test with new limits
- [ ] Update README with new limits
- [ ] Update monitoring alerts
- [ ] Announce to users (if Actor is live)

---

## Questions?

- **Technical**: Check `BACKEND_API_CONTRACT.md`
- **Deployment**: Check `DEPLOYMENT_GUIDE.md`
- **Support**: support@richlead.ai

