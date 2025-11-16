# ⚡ Quick Fix: Enable Apollo API

## The Problem:
Your app is still using PDL instead of Apollo because `USE_APOLLO` is not set to `'true'` in your environment.

## ✅ Solution (3 Steps):

### Step 1: Create/Update `.env.local` File

Create a file called `.env.local` in your project root with:

```bash
# Apollo.io Configuration (Professional Plan)
APOLLO_API_KEY=your-apollo-api-key-here
USE_APOLLO=true

# MongoDB
MONGODB_URI=your-mongodb-uri-here

# OpenAI
OPENAI_API_KEY=your-openai-key-here

# JWT
JWT_SECRET=your-jwt-secret-here

# Optional: LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
```

### Step 2: Get Your Apollo Master API Key

1. Go to: https://app.apollo.io/#/settings/integrations
2. Click **"API"** tab
3. **Delete any existing keys**
4. Click **"Create New Key"**
5. **IMPORTANT**: Toggle **"Set as master key"** ✅
6. Copy the key and paste it in `.env.local` as `APOLLO_API_KEY`

### Step 3: Restart Your Dev Server

**IMPORTANT**: Environment variables only load on server start!

Press `Ctrl+C` to stop the dev server, then:

```bash
npm run dev
```

## ✅ Verify It's Working:

When you search for leads, open your browser console (F12) or terminal and look for:

```
🔵 Using Apollo.io API with email reveal enabled
📧 Emails revealed: 8/10 (80%)
```

If you see:
```
🟢 Using People Data Labs (PDL) API
```

Then `USE_APOLLO` is not set to `true` or the server wasn't restarted.

## 🚨 Common Mistakes:

1. ❌ `.env.local` file not created
2. ❌ `USE_APOLLO=true` has a typo (must be lowercase `true`)
3. ❌ Forgot to restart the dev server
4. ❌ API key is not a Master Key
5. ❌ `.env.local` is in the wrong folder (must be at project root)

## 📁 File Location:

Your `.env.local` should be here:
```
wowlead/
  ├── .env.local          👈 HERE (same level as package.json)
  ├── package.json
  ├── app/
  ├── components/
  └── ...
```

## 🔍 Quick Test:

After restarting, check your terminal output. You should see:

```bash
🔵 Using Apollo.io API with email reveal enabled
🔍 Apollo Search Filters: { titles: X, locations: Y, companySizes: Z }
📡 Apollo API Response Status: 200
📧 Emails revealed: X/Y (Z%)
✅ Apollo API Success
```

## Still Not Working?

Add this temporary debug to check if the env var is loaded:

In `app/api/leads/search/route.ts`, add after line 13:

```typescript
console.log('🔧 Debug - USE_APOLLO:', process.env.USE_APOLLO, 'Type:', typeof process.env.USE_APOLLO);
console.log('🔧 Debug - Evaluated:', process.env.USE_APOLLO === 'true');
```

This will show you exactly what the server sees.

