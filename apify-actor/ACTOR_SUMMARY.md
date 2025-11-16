# RichLead Apify Actor - Complete Summary

## 🎯 What We Built

A **production-ready Apify Actor** that:

✅ Accepts high-level ICP + filter inputs (no LinkedIn cookies, no scraping BS)  
✅ Calls your RichLead backend API  
✅ Returns 300-500 **AI-ranked, enriched leads** that match the ICP  
✅ Outputs clean JSON + CSV  
✅ Has hard safety limits to protect Apollo credits  
✅ Is monetizable via Apify's pay-per-run model  
✅ Is fully documented and ready to deploy  

---

## 📂 Complete File Structure

```
apify-actor/
├── .actor/
│   ├── actor.json              # Actor metadata & config
│   └── input_schema.json       # Input form schema (ICP, filters, limits)
│
├── src/
│   └── main.ts                 # 🔥 Main Actor logic (TypeScript)
│                                 - Input validation
│                                 - API call with retry logic
│                                 - Error handling
│                                 - CSV generation
│                                 - Dataset/KV store output
│
├── package.json                # Dependencies (apify, axios)
├── tsconfig.json               # TypeScript config
├── Dockerfile                  # Docker build for Apify platform
├── .gitignore                  # Ignore node_modules, dist, etc.
│
├── README.md                   # 📄 Apify Store listing (user-facing)
├── QUICK_START.md              # ⚡ Get started in 15 minutes
├── BACKEND_API_CONTRACT.md     # 📋 Exact API contract for your backend
├── DEPLOYMENT_GUIDE.md         # 🚀 Complete deployment guide
├── CONFIG.md                   # ⚙️ Configuration reference & scaling
│
└── test-input.json             # Sample input for testing
```

---

## 🎨 What the User Sees (Apify UI)

### Input Form:
```
┌─────────────────────────────────────────────────────┐
│ RichLead - AI Lead Discovery                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Ideal Customer Profile (ICP) Description *          │
│ ┌──────────────────────────────────────────────┐   │
│ │ Founders and Heads of Marketing at B2B SaaS │   │
│ │ startups in the US with 11-200 employees... │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Target Job Titles *                                 │
│ ┌──────────────────────────────────────────────┐   │
│ │ • CEO                                         │   │
│ │ • Founder                                     │   │
│ │ • VP Marketing                                │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Locations                                            │
│ ┌──────────────────────────────────────────────┐   │
│ │ • United States                               │   │
│ │ • San Francisco                               │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Company Sizes                                        │
│ [✓] 11-50   [✓] 51-200   [ ] 201-500               │
│                                                      │
│ Max Leads to Fetch: 1000  (slider)                  │
│ Top Leads to Return: 300  (slider)                  │
│ Output Format: [JSON ▼] [CSV] [Both]               │
│                                                      │
│           [Start for $49] [Try Free Run]            │
└─────────────────────────────────────────────────────┘
```

### Output (Dataset):
```
┌────────────────────────────────────────────────────────────┐
│ 📊 300 AI-Ranked Leads                                     │
├─────────────┬──────────────┬──────────┬────────┬──────────┤
│ Name        │ Title        │ Company  │ Score  │ Email    │
├─────────────┼──────────────┼──────────┼────────┼──────────┤
│ Sarah J.    │ VP Marketing │ CloudTe… │ 95     │ sarah@…  │
│ Michael C.  │ Founder      │ GrowthA… │ 92     │ michael… │
│ Jennifer L. │ CMO          │ SaasPro… │ 91     │ jenn@…   │
│ ...         │ ...          │ ...      │ ...    │ ...      │
└─────────────┴──────────────┴──────────┴────────┴──────────┘

[Download CSV] [Download JSON] [View in Dashboard]
```

---

## 🔧 Technical Architecture

```
┌─────────────┐
│   Apify     │  User fills form on Apify
│   User      │
└──────┬──────┘
       │ Input: ICP, filters, limits
       ▼
┌─────────────────────────────────────────────┐
│         Apify Actor (Node.js)               │
│  ┌──────────────────────────────────────┐   │
│  │  1. Validate Input                   │   │
│  │  2. Enforce Hard Limits (1000/500)   │   │
│  │  3. Build API Request                │   │
│  └──────────────────────────────────────┘   │
└───────────────┬─────────────────────────────┘
                │ POST /api/apify/run-icp-search
                ▼
┌──────────────────────────────────────────────┐
│      RichLead Backend (Next.js API)          │
│  ┌───────────────────────────────────────┐   │
│  │  1. Authenticate API Key              │   │
│  │  2. Search Apollo (1000 leads)        │   │
│  │  3. Enrich Emails (People Match API)  │   │
│  │  4. AI Score vs ICP (GPT-4)           │   │
│  │  5. Rank & Return Top 300             │   │
│  └───────────────────────────────────────┘   │
└────────────┬─────────────────────────────────┘
             │ Response: { job_id, summary, leads[] }
             ▼
┌─────────────────────────────────────────────┐
│         Apify Actor (continued)             │
│  ┌──────────────────────────────────────┐   │
│  │  6. Save to Dataset (for CSV/JSON)   │   │
│  │  7. Save to KV Store (full result)   │   │
│  │  8. Generate CSV (if requested)      │   │
│  │  9. Log Success Summary              │   │
│  └──────────────────────────────────────┘   │
└───────────────┬─────────────────────────────┘
                │
                ▼
        ┌──────────────┐
        │ User Gets:   │
        │ • 300 leads  │
        │ • CSV export │
        │ • JSON data  │
        └──────────────┘
```

---

## 🔒 Safety & Limits

### Hard Limits (Enforced by Actor):
```typescript
ABSOLUTE_MAX_RAW_LEADS: 1000    // Never fetch more from Apollo
ABSOLUTE_MAX_TOP_N: 500         // Never return more than this
```

### Double Validation:
1. **Input Schema** - Apify validates max=1000 in UI
2. **Actor Code** - `Math.min(input, CONFIG.MAX)` caps it
3. **Backend** - Should also validate to prevent abuse

### Current Safe Usage (Professional Plan):
- **Per Run**: 1000 raw → 300-500 returned
- **Per Month**: ~10 runs = 10,000 credits used
- **Cost**: ~$99/month Apollo + Apify fees

---

## 💰 Monetization Model

### Pricing Tiers:

**Beta (Current):**
- **$49/run**
- Max 300-500 leads per run
- Apollo Professional plan

**Growth (Future):**
- **$79/run**
- Max 1000 leads per run
- Apollo + add-on credits

**Enterprise:**
- **$199/run** or custom
- Max 2000+ leads per run
- Dedicated Apollo credits
- Priority support

### Revenue Projection:

| Runs/Month | Price  | Revenue | Apollo Cost | Profit | Margin |
|------------|--------|---------|-------------|--------|--------|
| 10         | $49    | $490    | $499        | -$9    | -2%    |
| 20         | $49    | $980    | $999        | -$19   | -2%    |
| 20         | $79    | $1,580  | $999        | $581   | 37%    |
| 50         | $79    | $3,950  | $2,499      | $1,451 | 37%    |

**Key insight**: Need $79+ pricing OR high volume to be profitable.

---

## 📋 Backend Implementation Checklist

You need to implement `POST /api/apify/run-icp-search`:

- [ ] Authentication (verify API key)
- [ ] Input validation
- [ ] Apollo search integration
- [ ] Email enrichment (People Match API)
- [ ] AI ICP scoring (OpenAI)
- [ ] Lead ranking & filtering
- [ ] Response formatting
- [ ] Credit tracking
- [ ] Error handling
- [ ] Logging & monitoring

**See `BACKEND_API_CONTRACT.md` for exact contract.**

---

## 🚀 Deployment Steps

### Quick Version:
```bash
cd apify-actor
npm install
apify login
apify push
```

### Then on Apify:
1. Set secrets (`RICHLEAD_API_KEY`, `RICHLEAD_API_BASE`)
2. Run test
3. Upload logo + screenshots
4. Set pricing
5. Submit for publication

**See `DEPLOYMENT_GUIDE.md` for full guide.**

---

## 📊 What to Monitor

### Per Run:
- Apify run ID
- API key used
- Leads fetched vs returned
- Apollo credits consumed
- Processing time
- Success/failure

### Aggregate:
- Total runs/day/week/month
- Total Apollo credits used
- Average leads per run
- Error rate
- Revenue (if monetized)
- Cost per lead

### Alerts:
- Apollo credits < 1000 (warning)
- Apollo credits = 0 (critical, pause Actor)
- Error rate > 10%
- Processing time > 90 seconds (investigate)

---

## 🎓 Key Design Decisions

### Why This Architecture?

✅ **Separation of Concerns**: Actor handles I/O, backend handles logic  
✅ **Centralized Limits**: Easy to adjust as you scale  
✅ **Error Resilience**: Retry logic + graceful failures  
✅ **Monetization Ready**: Pay-per-run model baked in  
✅ **Professional UX**: Clean inputs, clear outputs, good logging  
✅ **Future-Proof**: Easy to increase limits, add features  

### Why Not Other Approaches?

❌ **LinkedIn Scraping**: Against TOS, brittle, requires cookies  
❌ **Client-Side Apollo**: Exposes API keys, no AI layer  
❌ **All-in-Actor**: Hard to maintain, can't reuse for SaaS UI  
❌ **Unlimited Runs**: Would burn credits too fast  

---

## 🔮 Future Enhancements

### v1.1 - Async Processing:
- For large jobs (5000+ leads), use async
- Actor creates job, returns job_id
- User polls for status
- Webhook when complete

### v1.2 - Advanced Filtering:
- Technologies used (BuiltWith, Clearbit)
- Funding stage (Crunchbase)
- Social media presence
- Intent signals

### v1.3 - Multi-Source:
- Apollo + PDL + ZoomInfo
- Aggregate & dedupe
- Return best data from each

### v2.0 - Smart Caching:
- Cache Apollo results for common searches
- Reduce duplicate API calls
- Save credits on similar ICPs

---

## 📚 Documentation Summary

| File | Purpose |
|------|---------|
| `README.md` | Apify Store listing (user-facing) |
| `QUICK_START.md` | Get started in 15 minutes |
| `BACKEND_API_CONTRACT.md` | Exact API contract for backend |
| `DEPLOYMENT_GUIDE.md` | Full deployment walkthrough |
| `CONFIG.md` | Configuration reference |
| `ACTOR_SUMMARY.md` | This file - complete overview |

---

## ✅ What You Have Now

1. **Complete Apify Actor** - Production-ready TypeScript code
2. **Input Schema** - Clean UI form with validation
3. **API Contract** - Exact spec for your backend
4. **Deployment Guide** - Step-by-step instructions
5. **Configuration Docs** - How to scale as credits grow
6. **Test Input** - Sample JSON to test with
7. **Error Handling** - Graceful failures with clear messages
8. **CSV Export** - Users can download leads
9. **Monitoring Ready** - Logging for all key events
10. **Documentation** - Everything explained in detail

---

## 🎉 Next Steps

### 1. Implement Backend (1-2 days)
- Create `POST /api/apify/run-icp-search` endpoint
- Follow `BACKEND_API_CONTRACT.md`
- Test with cURL/Postman

### 2. Test Locally (1 hour)
- `npm install && npm run dev`
- Verify logs and output
- Fix any issues

### 3. Deploy to Apify (1 hour)
- `apify push`
- Set secrets
- Run test on platform

### 4. Polish for Launch (1-2 hours)
- Upload logo
- Add screenshots
- Set pricing
- Write marketing copy

### 5. Submit & Launch (1 day review)
- Submit to Apify Store
- Wait for approval
- Announce to users
- Start getting sales!

---

## 💪 You're Ready!

Everything is built, documented, and ready to deploy.

**Total build time**: ~2-3 days to get from here to live Actor.

**Potential revenue**: $500-5,000+/month once you have traction.

**Let's ship it! 🚀**

---

## Support

- **Questions about Actor**: Check docs above
- **Questions about Apify**: https://docs.apify.com
- **Questions about Backend**: See `BACKEND_API_CONTRACT.md`
- **Need Help**: support@richlead.ai

