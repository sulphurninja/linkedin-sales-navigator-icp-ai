# Deploy LinkedIn Sales Navigator Actor to Apify

## ✅ **Prerequisites**

- [ ] Backend deployed to Vercel (see `DEPLOY_TO_VERCEL.md`)
- [ ] `backtick.app` domain active
- [ ] Backend API endpoint tested and working
- [ ] Apify account created (free) - https://apify.com
- [ ] Node.js 18+ installed

---

## 🚀 **Step 1: Install Apify CLI**

```bash
npm install -g apify-cli
```

Verify installation:
```bash
apify --version
```

---

## 🔐 **Step 2: Login to Apify**

### **2.1: Get Your API Token**
1. Go to https://console.apify.com/
2. Click your profile (top right)
3. Click "Settings"
4. Click "Integrations" in sidebar
5. Under "API tokens", click "Create new token"
6. Name it: "CLI Access"
7. Copy the token (starts with `apify_api_...`)

### **2.2: Login via CLI**

```bash
apify login
```

When prompted, paste your API token.

**Success message:**
```
✔ You are logged in.
```

---

## 📦 **Step 3: Prepare Actor for Deployment**

### **3.1: Navigate to Actor Directory**

```bash
cd apify-actor
```

### **3.2: Install Dependencies**

```bash
npm install
```

### **3.3: Test Locally (Optional but Recommended)**

Create test input:
```bash
# Input is already in test-input.json
# Just make sure backend is live first!
```

Run locally:
```bash
npm run dev
```

**What to check:**
- Actor starts
- Calls your backend API
- Returns leads
- No errors

**If local test works → Ready to deploy!**

---

## 🚀 **Step 4: Deploy to Apify**

### **4.1: Push Actor**

```bash
apify push
```

**What happens:**
1. Code is uploaded to Apify
2. Docker image is built (2-3 minutes)
3. Actor is created in your account

**Success message:**
```
✔ Actor was deployed to Apify cloud.
   https://console.apify.com/actors/YOUR_ACTOR_ID
```

### **4.2: Verify Deployment**

1. Click the link from the success message
2. You should see your Actor in Apify Console
3. Check that all files are uploaded

---

## ⚙️ **Step 5: Configure Actor Settings**

### **5.1: Set Environment Variables**

1. In Apify Console → Your Actor
2. Click "Settings" tab
3. Scroll to "Environment variables"
4. Click "Add variable"

Add this variable:
```
Key: BACKTICK_API_BASE
Value: https://backtick.app
```

**Important:** Don't add trailing slash!

### **5.2: Configure Resource Settings**

Still in Settings:

**Memory:**
```
4096 MB (4 GB)
```

**Timeout:**
```
300 seconds (5 minutes)
```

**Restart on error:**
```
No (unchecked)
```

Click "Save"

---

## 🧪 **Step 6: Test Your Actor**

### **6.1: Run Test**

1. Click "Console" tab (or "Start" button)
2. You'll see the input form
3. Fill it in (or paste from `test-input.json`):

```json
{
  "icp_description": "Founders and CEOs at B2B SaaS startups in the United States with 11-200 employees, using CRM tools like HubSpot or Salesforce, interested in sales automation.",
  "job_titles": ["CEO", "Founder", "Co-Founder"],
  "locations": ["United States", "San Francisco"],
  "industries": ["Software", "SaaS"],
  "company_sizes": ["11-50", "51-200"],
  "keywords_include": ["B2B", "SaaS"],
  "keywords_exclude": ["student", "intern"],
  "max_raw_leads": 100,
  "top_n": 50,
  "output_format": "both"
}
```

4. Click "Start"

### **6.2: Monitor Logs**

Watch the logs in real-time. You should see:

```
🚀 LinkedIn Sales Navigator AI ICP Lead Extractor started
📋 No cookies required - Sales Navigator quality results
📌 Version: 1.0.0
✅ Input validation passed
📊 Run Configuration: {...}
🔍 Searching for leads with Sales Navigator-quality filtering...
🌐 API Call attempt 1/3...
✅ Successfully extracted and scored leads!
📊 Results Summary: {...}
💾 Saving leads to Apify dataset...
💾 Saving full result to key-value store...
🎉 LinkedIn Sales Navigator Extraction Complete!
📊 Searched: 100 total leads
🎯 Returned: 50 top ICP matches
⭐ Average ICP fit score: 87.3/100
⚡ Processing time: 45.2s
```

### **6.3: Check Output**

1. Click "Dataset" tab
   - Should show 50 leads
   - Each with email, phone, fit_score, etc.
   - Click "Export" → Download CSV

2. Click "Key-value store" tab
   - Click "result" key
   - Should show full JSON with summary + leads

3. Check for "leads.csv" (if output_format was "both" or "csv")

**If all 3 outputs look good → Actor works! ✅**

---

## 📊 **Step 7: Prepare for Publishing**

### **7.1: Create Assets**

You need to create:

#### **1. Actor Icon (400x400px)**

Create a simple icon:
- LinkedIn logo + AI brain/sparkle
- Blue + purple gradient
- Add text "No Cookies" badge
- Save as PNG with transparency

**Upload:**
1. Settings → Media → Actor icon
2. Upload your 400x400px image

#### **2. Screenshots (5-7 images)**

Take screenshots of:

**Screenshot 1: Input Form**
- Show filled input form with ICP + filters
- Highlight "No cookies required" messaging

**Screenshot 2: Running/Logs**
- Show actor running with clean logs
- Highlight progress messages

**Screenshot 3: Dataset Output**
- Show table of leads with all fields
- Highlight emails, phones, fit scores

**Screenshot 4: Individual Lead Detail**
- Show one lead with all enriched data
- Highlight ICP fit score + reasoning

**Screenshot 5: CSV Export**
- Show exported CSV in Excel/Google Sheets
- Highlight ready-to-import format

**Screenshot 6: Fit Score Distribution**
- If you can, show chart of score distribution
- Highlight quality filtering

**Screenshot 7: Summary Stats**
- Show 1000 searched → 300 returned
- Highlight the filtering value prop

**Upload:**
1. Settings → Media → Screenshots
2. Upload all 5-7 images
3. Add captions for each

#### **3. Demo Video (Optional)**

60-90 second video showing:
1. Problem: "Sales Navigator costs $100/month + needs cookies"
2. Solution: "Our actor = no cookies, better results"
3. Demo: Fill form → Run → Download → Done
4. Results: "300 AI-ranked leads in 2 minutes"

Upload to YouTube (unlisted), then add link in description.

### **7.2: Optimize Description**

Your README is already perfect, but double-check:

1. Click "Settings" → "Description"
2. Make sure README.md is showing
3. Preview looks good

### **7.3: Add Tags**

1. Click "Settings" → "Tags"
2. Add these tags (one by one):

```
linkedin
sales-navigator
linkedin-sales-navigator
lead-extractor
lead-finder
b2b-leads
email-finder
no-cookies
ai
ai-scoring
icp
icp-scoring
lead-generation
sales-prospecting
verified-emails
enriched-leads
```

**Add as many as possible (20+ is good)**

### **7.4: Set Pricing**

1. Settings → Pricing
2. Choose "Pay per run"
3. Set price: **$49** (or $79 if confident)
4. Optional: Enable "Free trial" (1 run)

---

## 📢 **Step 8: Publish to Apify Store**

### **8.1: Submit for Publication**

1. Click "Publication" tab (or "Publish to Apify Store")
2. Check all requirements:
   - ✅ Icon uploaded
   - ✅ Screenshots uploaded (5+)
   - ✅ Tags added (15+)
   - ✅ README detailed
   - ✅ Pricing configured
   - ✅ Test run successful

3. Click "Submit for publication"

### **8.2: Apify Review Process**

Apify team will review in 1-3 business days.

**They check:**
- Actor actually works
- Description is accurate
- Not violating terms
- Quality standards met

**They may ask for:**
- Proof it works (logs, screenshots)
- Clarification on data sources
- Changes to description

**Response tips:**
- Be professional
- Provide test run link
- Explain it uses professional B2B databases
- Emphasize no LinkedIn scraping

### **8.3: Once Approved**

You'll get email notification.

Your actor will be live at:
```
https://apify.com/YOUR_USERNAME/linkedin-sales-navigator-ai-icp-lead-extractor
```

---

## 🚀 **Step 9: Launch & Market**

### **9.1: Announce on LinkedIn**

Post template:
```
🚀 Just launched: LinkedIn Sales Navigator AI ICP Lead Extractor

Find B2B leads WITHOUT:
❌ Cookies
❌ Login
❌ Browser automation

Get 300-500 AI-ranked prospects in 2 minutes.
$49 per run. No subscription.

Try it: [your-apify-link]

#SalesNavigator #B2BLeads #SalesAutomation
```

### **9.2: Share in Communities**

**Reddit:**
- r/sales
- r/SaaS  
- r/Entrepreneur
- r/B2B_Sales

**Facebook Groups:**
- Sales & Marketing groups
- SaaS founder groups

**Apify Community:**
- Post in Apify Discord/Forum
- Share your launch story

### **9.3: Email Your Network**

Send to:
- Beta users
- Newsletter subscribers
- Past customers
- LinkedIn connections

**Email template:**
```
Subject: New: LinkedIn Sales Navigator without the $100/month subscription

Hey [Name],

I built something I thought you'd find useful:

LinkedIn Sales Navigator AI ICP Lead Extractor

It gives you Sales Navigator quality leads WITHOUT:
- Monthly subscription
- LinkedIn cookies/login
- Browser headaches

Plus AI ranks every lead against your ICP.

You get 300-500 perfect-fit prospects in 2 minutes.

Try it: [link]

First run is free!

[Your Name]
```

---

## 📊 **Step 10: Monitor & Optimize**

### **10.1: Track Metrics**

Monitor in Apify Console:
- Views
- Runs
- Rating
- Reviews
- Revenue

### **10.2: Gather Reviews**

After successful runs, ask users:
```
"Thanks for using the actor! Mind leaving a review?
Your feedback helps others discover it."
```

### **10.3: Optimize Based on Feedback**

Common feedback loops:
- "Too slow" → Optimize backend, increase timeout
- "Missing X field" → Add to output
- "Confusing input" → Update descriptions
- "Wrong results" → Improve ICP scoring

### **10.4: Iterate**

Version updates:
- v1.1: Bug fixes + small improvements
- v1.2: Add new filters (technologies, funding stage)
- v1.3: Async processing for large jobs
- v2.0: Multi-source data aggregation

Push updates:
```bash
# Make changes
git commit -m "v1.1: Improved ICP scoring"
apify push
```

---

## 🆘 **Troubleshooting**

### **"Actor build failed"**

Check build logs in Apify Console.

Common issues:
- Missing dependencies in package.json
- TypeScript errors
- Wrong Node version

Fix:
```bash
# Test build locally
npm run build

# If works locally, try clean push:
apify push --force
```

### **"Actor times out"**

Increase timeout:
1. Settings → Timeout → 600 seconds (10 min)
2. Settings → Memory → 8192 MB (8 GB)

Or optimize backend:
- Cache Apollo results
- Parallel AI scoring
- Reduce max_raw_leads default

### **"Backend returns 500 error"**

Check Vercel logs:
1. Go to Vercel Dashboard
2. Click your project
3. Deployments → Latest → View Function Logs
4. Look for errors around time of Actor run

Common fixes:
- MongoDB connection timeout → Increase timeout
- Apollo API rate limit → Add delay between calls
- OpenAI rate limit → Batch requests

### **"No leads returned"**

Check logs for:
- Apollo search returned 0 results → Filters too strict
- Enrichment failed → Apollo API issue
- AI scoring failed → OpenAI API issue

Test with broader filters first.

### **"Not showing in search"**

Give it 24-48h for indexing.

Boost visibility:
- Add more tags (20+)
- Update description with keywords
- Get 3-5 five-star reviews
- Share direct link initially

---

## ✅ **Deployment Checklist**

### **Before Publishing:**
- [ ] Actor code tested locally
- [ ] Deployed to Apify (`apify push`)
- [ ] Environment variables set
- [ ] Test run successful (logs + output good)
- [ ] Icon uploaded (400x400px)
- [ ] 5+ screenshots uploaded
- [ ] 15+ tags added
- [ ] README optimized
- [ ] Pricing configured
- [ ] Test from fresh account (not logged in to your backend)

### **After Publishing:**
- [ ] Submitted for publication
- [ ] Approved by Apify
- [ ] Posted on LinkedIn
- [ ] Shared in Reddit communities
- [ ] Emailed network
- [ ] Posted in Apify community
- [ ] Set up monitoring
- [ ] Responded to first users

---

## 🎉 **Success!**

Your Actor is now live on Apify Store!

**Monitor:**
- First 10 runs → Fix any bugs immediately
- First 5 reviews → Respond and thank users
- First 30 days → Track conversion to SaaS

**Optimize:**
- A/B test pricing ($49 vs $79)
- Try different screenshots
- Refine description based on questions
- Add features users request

**Scale:**
- Once stable, increase marketing
- Create case studies from successful users
- Build landing page on backtick.app
- Launch complementary actors

---

## 📧 **Support**

- **Actor issues**: Check Apify logs + docs.apify.com
- **Backend issues**: Check Vercel logs
- **Questions**: aditya@backtick.app

---

**YOU'RE LIVE! 🚀**

Users can now find your Actor, run it, and get amazing results!

Watch those runs come in! 📈

