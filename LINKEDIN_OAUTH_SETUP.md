# 🔗 LinkedIn OAuth Setup Guide

## Why LinkedIn OAuth?

With LinkedIn OAuth, your AI can:
- **Access real LinkedIn profiles** using the user's authentication
- **Verify PDL data** against actual LinkedIn information
- **Cross-check** titles, companies, locations, and industries
- **Score data accuracy** (0-100%) for each lead
- **Flag discrepancies** (e.g., "PDL says CTO but LinkedIn shows VP Engineering")

This dramatically improves lead quality by catching:
- ❌ Outdated data (person changed jobs)
- ❌ Incorrect titles/companies
- ❌ Fake or low-quality leads

---

## 🚀 Setup Steps

### **1. Create LinkedIn OAuth App**

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **"Create app"**
3. Fill in:
   - **App name**: WowLead
   - **LinkedIn Page**: (your company page or create one)
   - **App logo**: (optional)
   - **Legal agreement**: Check and submit

### **2. Configure OAuth Settings**

1. In your app dashboard, go to **"Auth"** tab
2. Add **Redirect URLs**:
   ```
   http://localhost:3000/api/auth/linkedin/callback
   https://your-domain.com/api/auth/linkedin/callback
   ```

3. Note down:
   - **Client ID**
   - **Client Secret**

### **3. Request API Scopes**

In the **"Products"** tab, request access to:
- ✅ **Sign In with LinkedIn using OpenID Connect** (auto-approved)
- ✅ **Share on LinkedIn** (for w_member_social scope)
- 📋 **Profile API** (may need approval - allows reading other profiles)

**Required Scopes:**
- `openid` - OpenID Connect
- `profile` - Basic profile info
- `email` - User's email
- `w_member_social` - Post on behalf of user (helps with approval)

**Advanced (for lead verification):**
- `r_basicprofile` or `r_liteprofile` - Read basic profile info of connections

### **4. Add to `.env.local`**

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
```

### **5. Test OAuth Flow**

1. Start your dev server: `npm run dev`
2. Go to `/login`
3. Click **"Continue with LinkedIn"**
4. Authorize the app
5. You'll be redirected back logged in! 🎉

---

## 🎯 How It Works

### **User Flow:**

```
1. User clicks "Continue with LinkedIn"
   ↓
2. Redirect to LinkedIn authorization page
   ↓
3. User authorizes WowLead to access their LinkedIn
   ↓
4. LinkedIn redirects back with authorization code
   ↓
5. Backend exchanges code for access token
   ↓
6. Access token stored in user's database record
   ↓
7. User logged in with JWT token
```

### **Lead Verification Flow:**

```
1. User searches for leads (PDL returns 10 prospects)
   ↓
2. For each prospect with LinkedIn URL:
   ↓
3. Backend uses user's LinkedIn token to fetch real profile
   ↓
4. Compare PDL data vs LinkedIn data:
   - Name matches? ✅
   - Title matches? ✅
   - Company matches? ❌ (Discrepancy!)
   ↓
5. Calculate data accuracy score (0-100%)
   ↓
6. AI adjusts lead score based on:
   - ICP fit
   - LinkedIn verification status
   - Data accuracy
   ↓
7. Show user with visual indicators:
   ✅ LinkedIn Verified - 95% accurate
   ⚠️ Data discrepancy: Company mismatch
```

---

## 🧠 AI Scoring with LinkedIn

### **Before (No LinkedIn OAuth):**
```
Score: 75
Label: maybe
Reason: "Good fit - CTO at SaaS company"
```

User has no idea if data is accurate.

### **After (With LinkedIn OAuth):**
```
Score: 92
Label: good
Reason: "Excellent fit - CTO at SaaS company. LinkedIn verified with 95% data accuracy."

Data Verification:
✅ Name matches
✅ Title matches  
✅ Company matches
✅ Location matches
```

**OR if data is wrong:**

```
Score: 45
Label: bad
Reason: "Poor fit - Outdated data detected. LinkedIn shows this person is now at a different company."

Data Discrepancies:
❌ Company mismatch: PDL="OldCorp" vs LinkedIn="NewCorp"  
❌ Title mismatch: PDL="CTO" vs LinkedIn="Advisor"
⚠️ Score reduced by 30 points due to data quality issues
```

---

## 📊 Example Comparison

### **Lead 1: High Quality**
```json
{
  "name": "Sarah Chen",
  "pdlData": {
    "title": "Chief Technology Officer",
    "company": "TechCorp Solutions"
  },
  "linkedInData": {
    "headline": "CTO at TechCorp Solutions",
    "currentPosition": {
      "title": "Chief Technology Officer",
      "companyName": "TechCorp Solutions"
    }
  },
  "dataAccuracy": 100,
  "score": 95,
  "label": "good"
}
```

### **Lead 2: Outdated Data**
```json
{
  "name": "John Doe",
  "pdlData": {
    "title": "VP Engineering",
    "company": "StartupXYZ"
  },
  "linkedInData": {
    "headline": "Advisor | Former VP Engineering",
    "currentPosition": {
      "title": "Independent Consultant",
      "companyName": "Self-Employed"
    }
  },
  "dataAccuracy": 30,
  "discrepancies": [
    "Title mismatch: PDL='VP Engineering' vs LinkedIn='Independent Consultant'",
    "Company mismatch: PDL='StartupXYZ' vs LinkedIn='Self-Employed'"
  ],
  "score": 35,
  "label": "bad"
}
```

---

## 🔐 Security & Privacy

### **What we store:**
- LinkedIn ID (for identifying returning users)
- Access token (encrypted, expires in 60 days)
- Token expiry date

### **What we don't store:**
- User's LinkedIn password
- Full LinkedIn profile data
- Any data from other users' profiles

### **Token refresh:**
LinkedIn tokens expire after 60 days. User will need to re-authenticate to continue using LinkedIn verification.

---

## 🎨 UI Updates

### **Login Page:**
- New "Continue with LinkedIn" button
- Blue LinkedIn branding
- OAuth flow starts from here

### **Dashboard:**
- Shows if user has LinkedIn connected
- Option to connect LinkedIn if not already connected

### **Search Results:**
- ✅ **"LinkedIn Verified"** badge (green)
- 📊 **Data Accuracy**: 95%
- ⚠️ **Discrepancies** shown if found

---

## 🚨 Important Notes

### **LinkedIn API Limitations:**

1. **Profile API requires approval** from LinkedIn (can take 1-2 weeks)
2. **Rate limits:** 100,000 API calls per day (per app)
3. **Token expiry:** Access tokens expire after 60 days
4. **Connections only:** Without Profile API approval, you can only see profiles of your connections

### **Development Tips:**

1. **Test with your own profile first**
2. **Add test LinkedIn profiles** to your connections
3. **Request Profile API access early** (includes business justification)
4. **Handle token expiry gracefully** (prompt user to re-auth)

---

## 📝 Next Steps

1. ✅ Create LinkedIn OAuth app
2. ✅ Add credentials to `.env.local`
3. ✅ Test login flow
4. 📋 Request Profile API access (for production)
5. 🚀 Deploy to production with HTTPS redirect URI

---

## 🆘 Troubleshooting

### **Error: "redirect_uri does not match"**
- Check that redirect URI in LinkedIn app settings exactly matches your `.env.local`
- Must include protocol (http/https) and full path

### **Error: "invalid_scope"**
- Make sure you've requested required products in LinkedIn app dashboard
- Wait a few minutes after requesting products

### **Can't fetch other profiles**
- Profile API requires special approval
- In development, you can only fetch profiles of your connections
- Submit your app for Profile API review for production use

---

**Ready to launch!** Your AI can now verify LinkedIn profiles and catch bad data! 🎉

