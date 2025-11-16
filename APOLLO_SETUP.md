# Apollo.io Professional Setup Guide

## ✅ You have Apollo Professional - Let's get it working!

### Step 1: Get Your Master API Key

1. Go to **Apollo Settings**: https://app.apollo.io/#/settings/integrations
2. Click on **"API"** tab
3. **Create a new API key** (even if you have one, create a fresh one)
4. **IMPORTANT**: Toggle the **"Set as master key"** option ✅
5. Copy the API key

### Step 2: Update Your `.env.local` File

```bash
# Apollo.io API Key (Professional Plan with Master Key)
APOLLO_API_KEY=your-apollo-master-key-here

# Enable Apollo (set to true)
USE_APOLLO=true

# Other required keys
MONGODB_URI=your-mongodb-uri
OPENAI_API_KEY=your-openai-key
JWT_SECRET=your-jwt-secret
```

### Step 3: Verify Your Setup

Run this test:

```bash
npm run dev
```

Then try searching for leads. You should see in the console:

```
🔵 Using Apollo.io API with email reveal enabled
📧 Emails revealed: 8/10 (80%)
✅ Apollo API Success: { peopleCount: 10, emailsRevealed: 8, ... }
```

### What You'll Get with Apollo Professional:

✅ **Email Reveal** - Real, verified email addresses
✅ **Phone Numbers** - Direct dial numbers when available  
✅ **LinkedIn URLs** - Verified profile links
✅ **Company Data** - Full company information
✅ **Employment History** - Career progression
✅ **Social Profiles** - Twitter, GitHub, Facebook links
✅ **Advanced Filters** - Better targeting

### Email Reveal Details:

- **Request**: `reveal_personal_emails: true`
- **Credits**: Uses your Apollo email credits
- **Rate**: Typically 60-90% email reveal rate
- **Quality**: Verified, deliverable emails

### Troubleshooting:

#### "403 Forbidden" Error
- ❌ Your API key is not a Master Key
- ✅ Create a NEW key and toggle "Set as master key"

#### "No emails revealed"
- ❌ Your plan doesn't include email credits
- ✅ Check your plan at https://app.apollo.io/#/settings/plans
- ✅ Ensure Professional plan is active

#### "Rate limit exceeded"
- ❌ You've hit your API rate limit
- ✅ Wait a few minutes
- ✅ Reduce `per_page` to lower requests

### API Limits (Professional Plan):

- **Rate Limit**: 10 requests/minute
- **Email Credits**: Check your dashboard
- **Search Results**: Up to 25 per page
- **Monthly Exports**: Based on your plan

### Compare: Apollo vs PDL

| Feature | Apollo Pro | PDL Free |
|---------|-----------|----------|
| Email Reveal | ✅ 60-90% | ✅ 40-60% |
| Phone Numbers | ✅ Yes | ❌ No |
| Data Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| API Credits | Plan-based | 1,000/month |
| Best For | Premium leads | Testing |

### Recommended: Use Apollo!

Since you have Professional plan, keep:

```bash
USE_APOLLO=true
```

This will give you the highest quality leads with the most contact information!

### Need Help?

- Apollo Status: https://status.apollo.io/
- Apollo Docs: https://apolloio.github.io/apollo-api-docs/
- Support: support@apollo.io

