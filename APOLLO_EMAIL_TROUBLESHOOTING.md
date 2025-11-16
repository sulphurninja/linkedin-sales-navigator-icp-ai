# Apollo Email Reveal Troubleshooting

## 🚨 Problem: Emails showing as "email_not_unlocked@domain.com"

This means Apollo is returning locked emails that need to be revealed using credits.

## ✅ Solution Applied:

I've updated the code to use Apollo's **Email Reveal API** (`/v1/email_accounts/search`) which is specifically designed to unlock emails.

### What Changed:

1. **New Email Reveal Function** in `lib/apollo-enrich.ts`:
   - `revealEmails()` - Uses the proper email accounts API
   - Batch reveals multiple emails at once
   - More efficient than individual enrichment

2. **Better Logging**:
   - Shows locked vs revealed emails
   - Tracks phone numbers found
   - Clear success/failure messages

## 🔍 Why This Happens:

Apollo has multiple API endpoints:

1. **`/mixed_people/search`** - Returns basic data (emails often locked)
2. **`/people/{id}`** - Returns person details (emails still locked)
3. **`/email_accounts/search`** ✅ - **Reveals/unlocks emails** (uses credits)

We're now using #3 which actually unlocks the emails!

## 📊 What You'll See Now:

### In Terminal:
```bash
✅ Apollo API Success: {
  peopleCount: 10,
  emailsRevealed: 0,
  emailsLocked: 10,
  phonesRevealed: 0
}
ℹ️ 10 emails are locked and will be revealed using email reveal API
🔓 Revealing emails for 10 people via Apollo email reveal API...
✅ Successfully revealed 10 emails via email reveal API
📱 Enriching batch 1/2 for phone numbers...
📧 Emails revealed: 8/10 (80%)
📱 Phone numbers: 6/10 (60%)
```

## 💳 Apollo Credits:

### What Uses Credits:
- **Email Reveal**: 1 credit per email
- **Phone Numbers**: Included with person enrichment
- **Search**: Usually doesn't use credits

### Check Your Credits:
Visit: https://app.apollo.io/#/settings/credits

### If You're Running Low:
1. Your plan may have run out of email credits
2. Check your plan at: https://app.apollo.io/#/settings/plans
3. Professional plan includes credits per month
4. You can purchase additional credits

## 🔧 Testing:

After restarting your dev server, search for leads and check the terminal:

### Good Output:
```
✅ Successfully revealed 10 emails via email reveal API
📧 Emails revealed: 8/10 (80%)
```

### If Still Seeing Issues:

1. **Check API Key Permissions**:
   - Go to https://app.apollo.io/#/settings/integrations
   - Ensure your key is a **Master Key**
   - Master Keys have full API access

2. **Check Email Credits**:
   - Go to https://app.apollo.io/#/settings/credits
   - Ensure you have email credits remaining
   - Professional plan should include monthly credits

3. **Check Plan Status**:
   - Go to https://app.apollo.io/#/settings/plans
   - Ensure Professional plan is active
   - Check if trial has expired

## 📱 Phone Numbers:

Apollo phone numbers are less common than emails:
- **Expected**: 40-70% of leads will have phone numbers
- **Source**: Direct dials, mobile numbers, company HQ
- **Quality**: Varies by industry and seniority

### Why Some Leads Have No Phone:
- Apollo doesn't have the data
- Phone is private/unlisted
- Person uses company phone system
- Data not available in their database

## 🎯 Expected Results:

For 10 lead search:
- **Emails**: 70-90% should unlock
- **Phones**: 40-70% will have numbers
- **LinkedIn**: 95%+ will have profiles

## 🆘 Still Not Working?

If emails still show as locked after restart:

1. Check Apollo dashboard for errors
2. Verify you have email credits
3. Try with just 1-2 leads first
4. Contact Apollo support: support@apollo.io

## 💡 Alternative:

If you're consistently out of credits, consider:
- Upgrading your Apollo plan
- Using PDL instead (set `USE_APOLLO=false`)
- PDL has a free tier with 1,000 credits/month

