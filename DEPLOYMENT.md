# Deployment Guide for WowLead

This guide will walk you through deploying WowLead to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Apollo.io Account**: Sign up at [apollo.io](https://www.apollo.io) (Professional trial)
4. **OpenAI Account**: Sign up at [platform.openai.com](https://platform.openai.com)

## Step 1: MongoDB Atlas Setup

1. **Create a Cluster**
   - Log in to MongoDB Atlas
   - Click "Build a Cluster" (free tier is fine)
   - Choose your cloud provider and region
   - Click "Create Cluster"

2. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Grant "Read and write to any database" privilege
   - Click "Add User"

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Vercel's dynamic IPs
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `wowlead`
   - Example: `mongodb+srv://user:password@cluster.mongodb.net/wowlead?retryWrites=true&w=majority`

## Step 2: Apollo.io API Key

1. **Sign Up for Professional Trial**
   - Go to [apollo.io](https://www.apollo.io)
   - Sign up or log in
   - Start Professional trial (14 days free, ~100 API credits)

2. **Get API Key**
   - Click your profile icon → Settings
   - Navigate to "Integrations"
   - Find "API" section
   - Click "Create new key" or copy existing key
   - Save this key securely

## Step 3: OpenAI API Key

1. **Create API Key**
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign in or create account
   - Click "Create new secret key"
   - Name it "WowLead"
   - Copy and save the key immediately (you won't see it again!)

2. **Add Credits**
   - Go to "Billing" → "Payment methods"
   - Add a payment method
   - Add at least $5-10 in credits
   - The app uses GPT-4o-mini which is very cost-effective (~$0.15 per 1M tokens)

## Step 4: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow prompts**
   - Set up and deploy? Yes
   - Which scope? Select your account
   - Link to existing project? No
   - Project name? wowlead (or your choice)
   - Directory? ./
   - Override settings? No

## Step 5: Configure Environment Variables

In Vercel Dashboard:

1. **Go to Project Settings**
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables"

2. **Add Variables**

Add each of these variables:

```
MONGODB_URI
mongodb+srv://username:password@cluster.mongodb.net/wowlead?retryWrites=true&w=majority

APOLLO_API_KEY
your_apollo_api_key_here

OPENAI_API_KEY
sk-your-openai-key-here

JWT_SECRET
generate-a-strong-random-secret-here-use-32-chars-min

NODE_ENV
production
```

**To generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Select Environments**
   - Check "Production", "Preview", and "Development"
   - Click "Save"

## Step 6: Redeploy

After adding environment variables:

1. **Trigger Redeploy**
   - Go to "Deployments" tab
   - Click the three dots on latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

2. **Wait for Deployment**
   - Should take 1-2 minutes
   - Check build logs for any errors

## Step 7: Test Your Deployment

1. **Visit Your Site**
   - Click "Visit" or go to your Vercel URL
   - Example: `https://wowlead.vercel.app`

2. **Create an Account**
   - Click "Get Started" or "Register"
   - Create a test account
   - You should be redirected to dashboard

3. **Test Flow**
   - Create an ICP profile
   - Search for leads
   - Verify AI qualification works
   - Export leads to CSV

## Troubleshooting

### MongoDB Connection Error

**Error**: "MongoServerError: bad auth"
- **Fix**: Check your username and password in MONGODB_URI
- Make sure to URL-encode special characters in password

**Error**: "MongoServerError: user is not authorized"
- **Fix**: Ensure database user has "Read and write to any database" permissions

**Error**: "MongoNetworkError"
- **Fix**: Check Network Access settings in MongoDB Atlas
- Ensure 0.0.0.0/0 is whitelisted

### Apollo API Error

**Error**: "Apollo API error: 401"
- **Fix**: Check your APOLLO_API_KEY is correct
- Verify it's set in Vercel environment variables
- Make sure you're using Professional plan (not free)

**Error**: "Apollo API error: 429"
- **Fix**: You've hit rate limits
- Wait or upgrade your Apollo plan

### OpenAI API Error

**Error**: "OpenAI API error: 401"
- **Fix**: Check your OPENAI_API_KEY is correct
- Make sure it starts with "sk-"

**Error**: "OpenAI API error: 429"
- **Fix**: Add more credits to your OpenAI account
- Check usage at platform.openai.com/usage

### Vercel Build Error

**Error**: Module not found
- **Fix**: Run `npm install` locally to ensure package.json is correct
- Commit and push package-lock.json or bun.lock

**Error**: Environment variable not defined
- **Fix**: Double-check all environment variables are set in Vercel
- Redeploy after adding variables

## Performance Optimization

### Enable Vercel Analytics (Optional)

1. Go to "Analytics" tab in Vercel
2. Enable Web Analytics
3. Monitor page load times and performance

### Enable Vercel Logs (Debugging)

1. Go to "Logs" tab in Vercel
2. View real-time logs for API routes
3. Filter by function or search term

### Database Indexes

For better performance, create these indexes in MongoDB:

```javascript
// Run in MongoDB Atlas Shell or Compass

// User collection
db.users.createIndex({ email: 1 }, { unique: true })

// ICPProfile collection
db.icpprofiles.createIndex({ userId: 1 }, { unique: true })

// Lead collection
db.leads.createIndex({ userId: 1, apolloId: 1 }, { unique: true })
db.leads.createIndex({ userId: 1, aiFitLabel: 1 })
db.leads.createIndex({ userId: 1, aiFitScore: -1 })
db.leads.createIndex({ userId: 1, createdAt: -1 })
```

## Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to "Settings" → "Domains"
   - Add your domain (e.g., wowlead.com)
   - Follow DNS instructions

2. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or A record to Vercel's IP

3. **Wait for SSL**
   - Vercel automatically provisions SSL
   - Takes 5-10 minutes

## Monitoring

### Check Application Health

```bash
# Check if API is responding
curl https://your-app.vercel.app/api/auth/me

# Expected: 401 Unauthorized (since not logged in)
```

### Monitor Costs

- **MongoDB Atlas**: Free tier includes 512MB storage
- **Vercel**: Free tier includes 100GB bandwidth
- **OpenAI**: ~$0.10-0.50 per 100 leads qualified (using GPT-4o-mini)
- **Apollo.io**: Professional trial = ~100 API credits

## Scaling Considerations

### When to Upgrade

**MongoDB Atlas**: Upgrade when you hit 512MB storage or need more connections

**Vercel**: Upgrade to Pro when you need:
- More bandwidth (>100GB/month)
- More build time
- Team collaboration

**OpenAI**: Monitor usage at platform.openai.com/usage
- Set usage limits to avoid surprises
- GPT-4o-mini is very cost-effective

**Apollo.io**: Upgrade when you need:
- More API credits
- Advanced features
- Bulk exports

## Backup Strategy

1. **MongoDB Backups**
   - Atlas automatically backs up data
   - Free tier: daily backups for 2 days
   - Paid tier: continuous backups

2. **Export Data Regularly**
   - Use the CSV export feature
   - Download and store lead data locally

## Security Checklist

- [ ] Change default JWT_SECRET to a strong random value
- [ ] Enable 2FA on all accounts (Vercel, MongoDB, OpenAI, Apollo)
- [ ] Review MongoDB network access regularly
- [ ] Monitor API key usage for suspicious activity
- [ ] Set up alerts for unusual traffic patterns
- [ ] Keep dependencies updated (`npm audit`)

## Support

If you encounter issues:
1. Check Vercel logs first
2. Review this troubleshooting section
3. Open an issue on GitHub

---

🎉 **Congratulations!** Your WowLead application is now deployed and ready to use.

