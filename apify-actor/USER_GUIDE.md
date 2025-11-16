# Backtick Apify Actor - User Guide

**How users will use your Actor (no API keys needed!)**

---

## 🎯 **For Apify Users (The People Using Your Actor)**

### **Step 1: Find the Actor**
1. Go to [Apify Store](https://apify.com/store)
2. Search for "Backtick" or "AI Lead Discovery"
3. Click on "Backtick - AI-Powered B2B Lead Discovery"

### **Step 2: Fill in the Form**
No signup, no API keys! Just fill in:

```
┌─────────────────────────────────────────────────────┐
│ Ideal Customer Profile (ICP) Description *          │
│ ┌──────────────────────────────────────────────┐   │
│ │ Founders and Heads of Marketing at B2B SaaS │   │
│ │ startups in the US with 11-200 employees... │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Target Job Titles *                                 │
│ • CEO                                                │
│ • Founder                                            │
│ • VP Marketing                                       │
│                                                      │
│ Locations (optional)                                 │
│ • United States                                      │
│ • San Francisco                                      │
│                                                      │
│ Max Leads: [1000] ─────────────────────○            │
│ Top Results: [300] ────────○                         │
│                                                      │
│ Output: [JSON ▼] CSV  Both                          │
│                                                      │
│              [Start for $49]                         │
└─────────────────────────────────────────────────────┘
```

### **Step 3: Run & Wait**
- Click "Start"
- Actor runs for 1-2 minutes
- Watch the logs (shows progress)

### **Step 4: Download Results**
- Go to "Dataset" tab
- Click "Export" → Choose CSV or JSON
- Import to your CRM or use for outreach

**That's it! No API keys, no complex setup!**

---

## 🔧 **For You (The Actor Owner)**

### **How It Works Behind the Scenes:**

```
User on Apify
     ↓
Fills form (no API key needed)
     ↓
Actor runs
     ↓
Calls: POST https://wowlead.vercel.app/api/apify/run-icp-search
     ↓
Your WowLead backend:
  - Searches Apollo
  - Enriches emails
  - AI scores against ICP
     ↓
Returns top 300-500 leads
     ↓
Actor saves to Apify dataset
     ↓
User downloads CSV/JSON
```

### **Tracking Usage:**

Your backend logs each run with:
- `apify_run_id` (unique per run)
- `client_ip` (for rate limiting if needed)
- `timestamp`
- `leads_requested` & `leads_returned`

You can query MongoDB collection `apify_usage_logs` to see:
- Total runs today/week/month
- Apollo credits consumed
- Most popular ICPs
- Error rates

### **Monetization:**

1. **Apify charges users**: $49 per run (you set this price)
2. **Apify pays you**: ~70% = $34 per run
3. **Your cost**: Apollo credits (~$0.05 per lead × 1000 = $50)
4. **Net result**: Break-even at scale, but user acquisition!

**Why break-even is OK:**
- Users discover Backtick through Apify
- They get hooked on the results
- They sign up for your SaaS for more features
- You convert Actor users to paying SaaS customers

### **Deployment:**

1. **Deploy Actor to Apify:**
```bash
cd apify-actor
apify push
```

2. **Deploy Backend to Vercel:**
```bash
# Your WowLead app with the new endpoint
vercel --prod
```

3. **Set Actor Environment Variable:**
In Apify Console → Your Actor → Settings:
```env
BACKTICK_API_BASE=https://wowlead.vercel.app
```

**That's it! No API key management needed!**

---

## 📊 **Monitoring Dashboard (Optional)**

Create an admin page to track Actor usage:

```typescript
// app/admin/apify-stats/page.tsx

export default async function ApifyStatsPage() {
  const db = await connectToDatabase();
  const logs = await db.collection('apify_usage_logs')
    .find({})
    .sort({ timestamp: -1 })
    .limit(100)
    .toArray();
  
  const stats = {
    totalRuns: logs.length,
    totalCredits: logs.reduce((sum, log) => sum + log.max_raw_leads, 0),
    avgLeadsPerRun: logs.reduce((sum, log) => sum + log.top_n, 0) / logs.length,
  };
  
  return (
    <div>
      <h1>Apify Actor Stats</h1>
      <div>Total Runs: {stats.totalRuns}</div>
      <div>Total Apollo Credits Used: {stats.totalCredits}</div>
      <div>Avg Leads Per Run: {stats.avgLeadsPerRun}</div>
      
      <table>
        <thead>
          <tr>
            <th>Run ID</th>
            <th>Timestamp</th>
            <th>ICP</th>
            <th>Leads</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.apify_run_id}</td>
              <td>{log.timestamp.toLocaleString()}</td>
              <td>{log.icp_description.substring(0, 50)}...</td>
              <td>{log.top_n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🚀 **Growth Strategy**

### **Phase 1: Launch (Week 1)**
- Deploy Actor to Apify
- Set price at $39 (introductory)
- Post on Reddit, LinkedIn, ProductHunt
- **Goal**: 10-20 runs

### **Phase 2: Optimize (Week 2-4)**
- Monitor usage logs
- Improve AI scoring based on feedback
- Add more features
- Increase price to $49
- **Goal**: 50-100 runs/month

### **Phase 3: Scale (Month 2+)**
- Convert Actor users to SaaS
- Offer "Premium" tier on Backtick.app
- Actor users get discount code
- **Goal**: 20% conversion rate

---

## ❓ **FAQ for Users**

**Q: Do I need to sign up for Backtick?**  
A: No! The Actor works standalone on Apify. Just fill the form and run.

**Q: How much does it cost?**  
A: $49 per run on Apify. You get 300-500 AI-ranked leads per run.

**Q: Where does the data come from?**  
A: LinkedIn Sales Navigator professional database with 700M+ profiles.

**Q: Can I run it multiple times?**  
A: Yes! Each run is independent. Run as many times as you need.

**Q: What if I need more than 500 leads?**  
A: Run the Actor multiple times with different filters, or sign up for Backtick.app for higher limits.

---

## 🎉 **Summary**

✅ **No API keys needed** - Users just fill a form  
✅ **No auth complexity** - Tracks by Apify Run ID  
✅ **Simple backend** - One endpoint in your WowLead app  
✅ **Easy monetization** - Apify handles billing  
✅ **User acquisition** - Convert Actor users to SaaS  
✅ **Full control** - You own the backend & data  

**This is the simplest possible setup! 🚀**

