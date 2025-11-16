# Deploy WowLead Backend to Vercel (backtick.app)

## ✅ **Prerequisites**

Make sure you have:
- [ ] Vercel account (free) - https://vercel.com
- [ ] GitHub account
- [ ] Your WowLead code pushed to GitHub
- [ ] Environment variables ready (.env.local values)

---

## 🚀 **Step 1: Push Code to GitHub**

If not already done:

```bash
# In your wowlead directory
git init
git add .
git commit -m "Initial commit - WowLead for Apify Actor"
git branch -M main

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/wowlead.git
git push -u origin main
```

---

## 🚀 **Step 2: Connect Vercel to GitHub**

### **2.1: Go to Vercel**
1. Visit https://vercel.com
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### **2.2: Import Project**
1. Click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Find your `wowlead` repo
4. Click "Import"

### **2.3: Configure Project**
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**Click "Deploy"** (we'll add env vars in next step)

---

## 🔐 **Step 3: Add Environment Variables**

The deployment will fail first time - that's expected! Now add your env vars:

### **3.1: Go to Project Settings**
1. Go to your project in Vercel
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar

### **3.2: Add All Variables**

Add these one by one (get values from your `.env.local`):

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# Apollo
APOLLO_API_KEY=your_apollo_api_key_here
USE_APOLLO=true

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# JWT
JWT_SECRET=your_jwt_secret_here

# LinkedIn OAuth (if using)
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://backtick.app/api/auth/linkedin/callback

# NextAuth (if using)
NEXTAUTH_URL=https://backtick.app
NEXTAUTH_SECRET=your_nextauth_secret
```

**Important:**
- Select "Production" + "Preview" + "Development" for all
- Click "Add" after each one

### **3.3: Redeploy**
1. Go to "Deployments" tab
2. Click "..." menu on the latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes

---

## 🌐 **Step 4: Add Custom Domain (backtick.app)**

### **4.1: Go to Domains**
1. Still in your Vercel project
2. Click "Settings" tab
3. Click "Domains" in sidebar

### **4.2: Add Domain**
1. Type: `backtick.app`
2. Click "Add"

### **4.3: Configure DNS**

Vercel will show you DNS records to add. Go to your domain registrar (Namecheap, GoDaddy, etc.):

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)
TTL: Auto
```

**CNAME Record (for www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

**Wait 5-60 minutes for DNS propagation**

### **4.4: Verify**
Once DNS propagates, Vercel will show:
- ✅ `backtick.app` - Active
- ✅ `www.backtick.app` - Active

---

## ✅ **Step 5: Test Your Backend**

### **5.1: Test Homepage**
Visit: https://backtick.app

You should see your WowLead app!

### **5.2: Test Apify Endpoint**

```bash
curl -X POST https://backtick.app/api/apify/run-icp-search \
  -H "Content-Type: application/json" \
  -d '{
    "icp_description": "Test ICP for B2B SaaS founders",
    "job_titles": ["CEO", "Founder"],
    "locations": ["United States"],
    "max_raw_leads": 10,
    "top_n": 5,
    "apify_run_id": "test_123",
    "source": "manual_test"
  }'
```

**Expected:**
- Status: 200 OK
- JSON response with leads array
- Takes 10-30 seconds

**If it works → Backend is ready! ✅**

---

## 🔧 **Step 6: Update Apify Actor Config**

Now that backend is live, update your Actor:

### **Option A: Via Environment Variable**

In Apify Console → Your Actor → Settings → Environment Variables:

```env
BACKTICK_API_BASE=https://backtick.app
```

### **Option B: Update Code**

In `apify-actor/src/main.ts`:

```typescript
const CONFIG = {
  BACKTICK_API_BASE: process.env.BACKTICK_API_BASE || 'https://backtick.app',
  // ...
};
```

Then redeploy Actor: `apify push`

---

## 🚨 **Troubleshooting**

### **Deployment Fails**
- Check Vercel logs (Deployments → Click deployment → View Function Logs)
- Common issue: Missing environment variables
- Fix: Add all env vars from Step 3.2

### **Domain Not Working**
- DNS takes 5-60 minutes to propagate
- Check DNS with: https://dnschecker.org
- Verify A record points to Vercel IP
- Verify CNAME record is correct

### **API Endpoint Returns 500**
- Check Vercel Function Logs
- Common issues:
  - MongoDB connection failed → Check MONGODB_URI
  - Apollo API key invalid → Check APOLLO_API_KEY
  - OpenAI key invalid → Check OPENAI_API_KEY
- Test locally first: `npm run dev`

### **CORS Errors**
Your Next.js API routes should work fine, but if you see CORS errors:

Add to `next.config.ts`:
```typescript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ];
  },
};
```

---

## ✅ **Verification Checklist**

Before moving to Actor deployment:

- [ ] Homepage loads at https://backtick.app
- [ ] Can login to your app
- [ ] Dashboard loads
- [ ] curl test to `/api/apify/run-icp-search` returns 200
- [ ] Response includes leads array
- [ ] No errors in Vercel logs

**If all checked → Backend is READY! Move to Actor deployment →**

---

## 📊 **Vercel Dashboard Overview**

Your project should show:
- **Deployments**: Green checkmark (successful)
- **Domains**: backtick.app (Active), www.backtick.app (Active)
- **Environment Variables**: 8-10 variables set
- **Functions**: All API routes deployed
- **Analytics**: Ready to track usage

---

## 💡 **Pro Tips**

### **Monitoring**
- Enable Vercel Analytics (Settings → Analytics)
- Monitor function execution time
- Set up alerts for 500 errors

### **Performance**
- Next.js API routes are serverless (auto-scaling)
- Cold starts: ~1-2 seconds (first request)
- Warm: <100ms response time
- Handles 1000s of requests/hour

### **Costs**
- **Hobby plan** (free):
  - 100 GB bandwidth/month
  - 100 hours function execution/month
  - Good for 500-1000 Actor runs/month

- **Pro plan** ($20/month):
  - 1 TB bandwidth
  - 1000 hours function execution
  - Good for 5000+ Actor runs/month

### **Scaling**
If you get high traffic:
1. Monitor Vercel usage dashboard
2. Upgrade to Pro when needed
3. Optimize Apollo/OpenAI calls (caching)
4. Consider edge functions for static data

---

## 🎉 **Success!**

Once your endpoint returns 200 with leads, you're ready for:

**Next: Deploy Apify Actor →**

See `DEPLOY_TO_APIFY.md` for Actor deployment guide!

