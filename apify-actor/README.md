# LinkedIn Sales Navigator AI ICP Lead Extractor (No Cookies Required)

**Get LinkedIn Sales Navigator quality leads without cookies, login, or browser automation.**

This actor extracts B2B leads with Sales Navigator-grade filtering, enriches them with professional contact data, and uses AI to score each lead against your Ideal Customer Profile (ICP). You get only the **top 300-500 best-fit prospects** - not 10,000 unqualified contacts.

---

## 🎯 **What This Actor Does**

### **LinkedIn Sales Navigator Alternative - No Cookies Needed!**

Unlike traditional LinkedIn scrapers that require:
- ❌ LinkedIn cookies  
- ❌ Account login  
- ❌ Browser automation  
- ❌ Session management  

This actor provides:
- ✅ **Sales Navigator-style filtering** (titles, locations, industries, company sizes)
- ✅ **Professional data enrichment** (verified emails, phone numbers, LinkedIn profiles)
- ✅ **AI-powered ICP scoring** (ranks every lead against your ideal customer)
- ✅ **Top prospects only** (returns best 300-500 matches, not bulk garbage)

**Perfect for:**
- Sales teams building targeted prospect lists
- Marketers finding decision-makers for campaigns
- Founders doing outbound without Sales Navigator subscription
- Recruiters finding qualified candidates
- Anyone needing high-quality B2B leads

---

## 🚀 **How It Works**

### **Simple 4-Step Process:**

1. **Define Your ICP**  
   Describe your ideal customer in natural language

2. **Set Your Filters**  
   Job titles, locations, industries, company sizes, keywords

3. **AI Scores & Ranks**  
   Every lead is scored 0-100 against your ICP

4. **Get Top Prospects**  
   Download CSV/JSON with 300-500 best-fit leads ready for outreach

---

## 📊 **What You Get**

Each lead includes:

```json
{
  "full_name": "Sarah Johnson",
  "job_title": "VP of Marketing",
  "company_name": "TechStartup Inc",
  "company_website": "https://techstartup.com",
  "company_size": "51-200",
  "industry": "Software",
  "location": "San Francisco, United States",
  "email": "sarah.johnson@techstartup.com",
  "phone": "+1-555-987-6543",
  "linkedin_url": "https://linkedin.com/in/sarahjohnson",
  "fit_score": 94,
  "fit_reason": "Perfect ICP match: VP Marketing at 51-200 person B2B SaaS in target location. LinkedIn profile mentions your key technologies.",
  "fit_label": "good"
}
```

### **Data Fields:**
- ✅ Full name & job title
- ✅ Company name, website, size, industry
- ✅ Geographic location
- ✅ **Verified email address** (70-90% coverage)
- ✅ **Direct phone number** (40-60% coverage)
- ✅ LinkedIn profile URL
- ✅ **AI Fit Score** (0-100, how well they match your ICP)
- ✅ **AI Reasoning** (why they're a good/bad fit)

---

## 🎓 **Input Configuration**

### **Required Inputs:**

#### **1. ICP Description** (Required)
Natural language description of your ideal customer.

**Example:**
```
Founders and Heads of Marketing at B2B SaaS startups in the United States 
with 11-200 employees, using CRM tools like HubSpot or Salesforce, 
interested in sales automation and AI-powered outreach.
```

**Tips:**
- Be specific about seniority level
- Mention tech stack if relevant
- Include pain points or interests
- Specify company stage (startup, growth, enterprise)

#### **2. Job Titles** (Required)
List of LinkedIn job titles to target.

**Examples:**
- `CEO`, `Founder`, `Co-Founder`
- `VP of Marketing`, `Head of Marketing`, `CMO`
- `VP of Sales`, `Head of Sales`, `CRO`
- `CTO`, `VP Engineering`, `Head of Technology`

**Tips:**
- Use exact LinkedIn titles
- Include variations (VP vs Vice President)
- Try both formal and informal versions

### **Optional Filters:**

#### **3. Locations**
Geographic targeting (countries, states, cities)

**Examples:**
- `United States`, `Canada`, `United Kingdom`
- `California`, `New York`, `Texas`
- `San Francisco`, `New York City`, `Austin`

#### **4. Industries**
Target specific industries

**Examples:**
- `Software`, `SaaS`, `Computer Software`
- `Information Technology`, `Internet`
- `Financial Services`, `Healthcare`, `E-commerce`

#### **5. Company Sizes**
Employee count ranges

**Options:**
- `1-10` (Seed stage)
- `11-50` (Early startup)
- `51-200` (Growth stage)
- `201-500` (Mid-market)
- `501-1000`, `1001-5000`, `5001-10000`, `10000+`

#### **6. Keywords to Include**
Must appear in profile/company description

**Examples:**
- `AI`, `automation`, `machine learning`
- `HubSpot`, `Salesforce`, `CRM`
- `B2B`, `SaaS`, `enterprise`

#### **7. Keywords to Exclude**
Filter out unwanted profiles

**Examples:**
- `student`, `intern`, `entry level`
- `recruiter`, `recruiting`, `talent acquisition`
- `agency`, `consultant`, `freelance`

### **Volume Settings:**

#### **8. Max Raw Leads** (Default: 1000, Hard Cap: 1000)
How many leads to search before AI filtering

**Recommendation:**
- Start with 1000 for comprehensive results
- Lower to 500 if you want faster runs

#### **9. Top N Leads** (Default: 300, Hard Cap: 500)
How many best-fit leads to return after AI scoring

**Recommendation:**
- 300 leads = perfect for focused outreach campaign
- 500 leads = larger campaign or multiple segments

#### **10. Output Format**
Choose how to receive your data

**Options:**
- `json` - Machine-readable format for automation
- `csv` - Import directly into CRM (Salesforce, HubSpot, etc.)
- `both` - Get both formats

---

## 💡 **Use Cases**

### **Sales Prospecting**
Find decision-makers at target accounts for outbound sales.

**Example Input:**
```
ICP: "VPs of Sales at 100-500 person B2B software companies in North America, 
likely looking to improve sales efficiency"

Titles: VP of Sales, Head of Sales, Chief Revenue Officer
Locations: United States, Canada
Industries: Software, SaaS
Company Sizes: 51-200, 201-500
Keywords Include: B2B, sales enablement, CRM
```

### **Marketing Campaigns**
Build targeted email/LinkedIn campaigns for specific personas.

**Example Input:**
```
ICP: "CMOs at fast-growing e-commerce brands who care about customer acquisition 
and retention"

Titles: CMO, VP Marketing, Head of Marketing
Industries: E-commerce, Retail, Consumer Goods
Company Sizes: 51-200, 201-500
Keywords Include: customer acquisition, retention, growth marketing
```

### **Partnership Outreach**
Find potential partners, integrations, or channel partners.

**Example Input:**
```
ICP: "Founders of B2B SaaS tools that integrate with Salesforce, 
looking for partnership opportunities"

Titles: CEO, Founder, Co-Founder
Industries: Software, SaaS
Keywords Include: Salesforce, integration, API, partner
Company Sizes: 11-50, 51-200
```

### **Investor Research**
Build lists of VCs, angels, or strategic investors.

**Example Input:**
```
ICP: "Partners at venture capital firms investing in AI/ML startups, 
active in B2B software space"

Titles: Partner, General Partner, Managing Partner, Principal
Industries: Venture Capital, Private Equity
Keywords Include: AI, machine learning, B2B, SaaS, seed, series A
```

---

## 📈 **Output & Results**

### **What Gets Saved:**

1. **Apify Dataset** (Main Results)
   - All leads as individual rows
   - Download as CSV or JSON
   - Perfect for CRM import

2. **Key-Value Store** (Full Report)
   - Complete JSON with summary metrics
   - Access via key: `result`
   - Includes processing stats

### **Result Summary:**

Every run includes:
```json
{
  "job_id": "linkedin_salesnav_run_123456",
  "summary": {
    "raw_leads_fetched": 1000,
    "leads_returned": 300,
    "icp_description": "Your ICP...",
    "average_fit_score": 86.4,
    "credits_used": 1000,
    "processing_time_ms": 45000
  },
  "leads": [ /* array of 300 top leads */ ]
}
```

### **Fit Score Interpretation:**

- **90-100**: 🟢 Perfect match - reach out immediately
- **80-89**: 🟢 Strong match - high priority for outreach
- **70-79**: 🟡 Good match - worth contacting
- **60-69**: 🟡 Potential match - review manually
- **Below 60**: 🔴 Filtered out (not returned)

---

## 🔧 **Technical Details**

### **Actor Specifications:**
- **Runtime**: Node.js 18+ with TypeScript
- **Timeout**: 2 minutes per run
- **Retries**: Auto-retry on temporary errors
- **Rate Limiting**: Built-in safety limits
- **Output Formats**: CSV, JSON, or both

### **No Setup Required:**
- ❌ No LinkedIn cookies needed
- ❌ No API keys to configure
- ❌ No account credentials
- ✅ Just fill the form and run!

### **Data Quality:**
- Email deliverability: 70-90%
- Phone number coverage: 40-60%
- LinkedIn profile accuracy: 95%+
- Company data freshness: Updated regularly

---

## 💳 **Pricing & Limits**

### **Current Limits:**
- **Max raw leads per run**: 1,000
- **Max returned leads**: 500 (top ICP matches)
- **Processing time**: 1-3 minutes typical

### **Cost per Run:**
Pricing varies by usage - check Apify platform for current rates.

**What You Get:**
- 300-500 AI-ranked, enriched leads
- Verified emails & phone numbers
- LinkedIn profiles
- Export-ready CSV/JSON
- No hidden fees or subscriptions

---

## ❓ **FAQ**

**Q: How is this different from LinkedIn Sales Navigator?**  
A: You get the same quality filtering + enriched contact data + AI ICP scoring, without needing a Sales Navigator subscription. Plus, no browser automation or cookie management.

**Q: Do I need LinkedIn cookies or login?**  
A: No! This actor doesn't require cookies or login

**Q: How accurate are the emails and phone numbers?**  
A: Emails: 70-90% coverage with high deliverability. Phones: 40-60% coverage. Both are verified professional contact info.

**Q: What does "AI ICP Scoring" mean?**  
A: Our AI reads your ICP description and each lead's profile, then scores 0-100 based on how well they match. You only get the top scorers.

**Q: Can I use this for recruiting?**  
A: Yes! Perfect for finding qualified candidates by title, location, and company type.

**Q: What if I need more than 500 leads?**  
A: Run the actor multiple times with different filters (different locations, titles, or industries).

**Q: Is this compliant with data privacy laws?**  
A: Yes. All data comes from publicly available professional sources and business contact databases.

**Q: Can I integrate this with my CRM?**  
A: Absolutely! Export as CSV and import directly into Salesforce, HubSpot, Pipedrive, or any CRM.

**Q: What happens if the actor fails?**  
A: We have auto-retry logic for temporary errors. If it still fails, you'll get a clear error message and won't be charged.

---

## 🏷️ **Keywords & Tags**

This actor is optimized for:
- LinkedIn Sales Navigator alternative
- B2B lead generation
- Lead extraction without cookies
- AI-powered ICP scoring
- Email finder
- Phone number enrichment
- Sales prospecting automation
- LinkedIn lead scraper alternative
- No-code lead gen
- Verified business contacts

---

## 📧 **Support**

- **Website**: [backtick.app](https://backtick.app)
- **Email**: aditya@backtick.app
- **Issues**: Report via Apify platform

---

## 🎉 **Ready to Get Started?**

1. Click "Try for free" (no signup required!)
2. Fill in your ICP description & filters
3. Click "Start"
4. Download your 300-500 AI-ranked leads in 2 minutes
5. Import to CRM and start reaching out!

**No cookies. No scrapers. No BS. Just high-quality leads.**

**Get LinkedIn Sales Navigator results without the Sales Navigator price tag.**
