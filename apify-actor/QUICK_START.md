# RichLead Apify Actor - Quick Start

**Get your Actor running in 15 minutes.**

---

## For Local Development

### 1. Install Dependencies

```bash
cd apify-actor
npm install
```

### 2. Setup Environment

Create `.env`:

```env
RICHLEAD_API_KEY=your_api_key_here
RICHLEAD_API_BASE=http://localhost:3000
```

### 3. Test Locally

```bash
# Run with test input
cp test-input.json apify_storage/key_value_stores/default/INPUT.json
npm run dev
```

---

## For Apify Deployment

### 1. Login to Apify

```bash
npm install -g apify-cli
apify login
```

### 2. Push to Apify

```bash
apify push
```

### 3. Set Secrets

In Apify Console:
- Go to your Actor → Settings → Environment variables
- Add: `RICHLEAD_API_KEY` (mark as secret)
- Add: `RICHLEAD_API_BASE` = `https://api.richlead.ai`

### 4. Test Run

- Click "Try for free"
- Use `test-input.json` content
- Click "Start"
- Check logs and dataset output

---

## File Structure

```
apify-actor/
├── .actor/
│   ├── actor.json              # Actor metadata
│   └── input_schema.json       # Input form definition
├── src/
│   └── main.ts                 # Main Actor logic
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── Dockerfile                  # Docker build
├── README.md                   # Apify Store listing
├── BACKEND_API_CONTRACT.md     # API contract for your backend
├── DEPLOYMENT_GUIDE.md         # Full deployment guide
├── CONFIG.md                   # Configuration reference
└── test-input.json             # Sample input for testing
```

---

## Key Files to Customize

### 1. `src/main.ts` - CONFIG section

**Adjust these as you scale Apollo credits:**

```typescript
const CONFIG = {
  ABSOLUTE_MAX_RAW_LEADS: 1000,  // ← Change to 2000, 5000, etc.
  ABSOLUTE_MAX_TOP_N: 500,       // ← Change to 1000, 2000, etc.
  // ...
};
```

### 2. `.actor/input_schema.json` - Limits

**Match with main.ts CONFIG:**

```json
{
  "max_raw_leads": {
    "maximum": 1000  // ← Keep in sync with CONFIG
  }
}
```

### 3. Environment Variables (Apify Secrets)

```env
RICHLEAD_API_KEY=rk_prod_...    # Generate in your admin panel
RICHLEAD_API_BASE=https://api.richlead.ai
```

---

## Testing Checklist

- [ ] Install dependencies
- [ ] Create `.env` with test API key
- [ ] Run `npm run dev` locally
- [ ] Verify logs show proper flow
- [ ] Check `apify_storage/datasets/default/` has leads
- [ ] Push to Apify: `apify push`
- [ ] Set production secrets
- [ ] Run test on Apify platform
- [ ] Verify dataset output
- [ ] Check key-value store for result JSON
- [ ] Test CSV export (if output_format=both)

---

## Common Issues

### ❌ "Invalid API key"
**Fix**: Check `RICHLEAD_API_KEY` is set correctly in Apify secrets

### ❌ Timeout after 2 minutes
**Fix**: Increase `API_TIMEOUT_MS` in CONFIG or optimize backend

### ❌ "QuotaExceeded" error
**Fix**: Purchase Apollo add-on credits or wait for monthly reset

### ❌ No emails in results
**Fix**: Verify Apollo enrichment is working in backend

### ❌ Actor build fails
**Fix**: Check `package.json` dependencies, try `npm install` locally first

---

## Next Steps

1. **Read Full Guides:**
   - `BACKEND_API_CONTRACT.md` - Implement backend endpoint
   - `DEPLOYMENT_GUIDE.md` - Deploy to production
   - `CONFIG.md` - Understand all config options

2. **Implement Backend:**
   - Create `POST /api/apify/run-icp-search` endpoint
   - Test with cURL or Postman
   - Verify response format matches contract

3. **Test End-to-End:**
   - Backend → Actor → Output
   - Verify data quality
   - Check credit usage

4. **Polish for Launch:**
   - Upload logo (400x400 px)
   - Add screenshots
   - Set pricing
   - Submit for Apify Store publication

---

## Resources

- **Apify Docs**: https://docs.apify.com
- **Actor SDK**: https://docs.apify.com/sdk/js
- **Support**: support@richlead.ai

---

## Quick Commands

```bash
# Local development
npm run dev

# Build TypeScript
npm run build

# Run built version
npm start

# Push to Apify
apify push

# Run on Apify (after push)
apify run

# View logs
apify logs

# Pull latest from Apify
apify pull
```

---

**Ready to build? Start with `npm install` and follow the checklist!** 🚀

