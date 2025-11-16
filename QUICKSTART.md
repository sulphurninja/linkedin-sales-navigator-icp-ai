# Quick Start Guide - WowLead

Get WowLead running locally in **5 minutes**!

## Prerequisites

- Node.js 18+ or Bun installed
- MongoDB Atlas account (free)
- People Data Labs account (free - 1,000 credits/month)
- OpenAI API key

## Step 1: Clone & Install (1 minute)

```bash
cd wowlead
npm install
# or: bun install
```

## Step 2: Get Your API Keys (2 minutes)

### MongoDB Atlas
1. Sign up at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster
3. Get your connection string
4. Whitelist IP: `0.0.0.0/0` (for development)

### People Data Labs (PDL)
1. Sign up at [peopledatalabs.com/signup](https://www.peopledatalabs.com/signup)
2. Go to [dashboard.peopledatalabs.com/api-keys](https://dashboard.peopledatalabs.com/api-keys)
3. Click "Create API Key"
4. Copy your key
5. **Free tier**: 1,000 credits/month (each search result = 1 credit)

### OpenAI
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Add at least $5 in credits

## Step 3: Environment Variables (1 minute)

Create `.env.local` in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/wowlead?retryWrites=true&w=majority

# People Data Labs (PDL) - Get from dashboard.peopledatalabs.com/api-keys
PDL_API_KEY=your_pdl_api_key_here

# OpenAI
OPENAI_API_KEY=sk-your_openai_key_here

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_random_32_char_secret_here

NODE_ENV=development
```

## Step 4: Run Development Server (30 seconds)

```bash
npm run dev
# or: bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test the App (1 minute)

### 1. Sign Up
- Click "Get Started"
- Create account with email/password

### 2. Create ICP
- Navigate to "ICP Profile"
- Add description: "B2B SaaS companies in fintech with 50-500 employees"
- Add industries: "SaaS", "Fintech"
- Add locations: "San Francisco", "New York"
- Add roles: "CTO", "VP Engineering"
- Company size: 50-500 employees
- Click "Save"

### 3. Search Leads
- Go to "Search Leads"
- Add job title: "CTO"
- Add location: "San Francisco"
- Select company size: "51-200"
- Click "Search & Qualify"
- Wait ~10-30 seconds for AI to qualify leads

### 4. View Dashboard
- Go to "Dashboard"
- See all your qualified leads with AI scores
- Filter by fit score (Good/Maybe/Bad)
- Export to CSV

## That's It! 🎉

You now have a fully functional AI-powered lead qualification system.

## Usage Tips

### PDL Credits
- Free tier: **1,000 credits/month**
- Each person in search results = **1 credit**
- Search for 10 people = 10 credits used
- Perfect for testing and small-scale use
- Upgrade at [peopledatalabs.com/pricing](https://www.peopledatalabs.com/pricing) if you need more

### OpenAI Costs
- Uses **GPT-4o-mini** (very affordable)
- ~**$0.10-0.50 per 100 leads** qualified
- Set usage limits at [platform.openai.com/account/limits](https://platform.openai.com/account/limits)

### Best Practices
1. Start with **specific filters** to get better results
2. Test with **small searches** (5-10 results) first
3. Refine your **ICP description** based on AI results
4. Export leads regularly to your CRM

## Common Issues

### "PDL API authentication failed"
- Check your API key is correct in `.env.local`
- No extra spaces around the `=` sign
- Restart your dev server after changing env variables

### "PDL API credits exhausted"
- You've used your 1,000 monthly credits
- Wait for next month or upgrade at [dashboard.peopledatalabs.com](https://dashboard.peopledatalabs.com)

### "MongoDB connection error"
- Check your connection string is correct
- Make sure you whitelisted IP `0.0.0.0/0` in MongoDB Atlas
- Verify database user has read/write permissions

### "OpenAI API error"
- Check you have credits in your OpenAI account
- Verify API key starts with `sk-`
- Add billing info at [platform.openai.com/billing](https://platform.openai.com/billing)

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide
- Customize AI qualification prompts in `lib/openai.ts`
- Adjust UI styling in component files

## Support

- PDL Docs: [docs.peopledatalabs.com](https://docs.peopledatalabs.com/)
- OpenAI Docs: [platform.openai.com/docs](https://platform.openai.com/docs)
- Issues: Open on GitHub

Happy lead hunting! 🚀
