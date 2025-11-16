# WowLead - AI-Powered Lead Qualification SaaS

A modern B2B lead generation and qualification platform that combines People Data Labs' vast database with OpenAI's intelligence to automatically qualify leads against your Ideal Customer Profile (ICP).

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## 🚀 Features

- **🎯 ICP Definition**: Define your Ideal Customer Profile with detailed criteria
- **🔍 Smart Search**: Search millions of B2B contacts with filters for titles, locations, and company sizes
- **🤖 AI Qualification**: Automatically score and qualify leads using OpenAI GPT-4
- **📊 Lead Dashboard**: View, filter, and manage all qualified leads
- **📤 CSV Export**: Export qualified leads for your CRM or sales tools
- **🔐 Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **⚡ Serverless-Ready**: Optimized for Vercel deployment with connection pooling
- **💰 Free Tier**: 1,000 free lead searches per month with People Data Labs

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS 4**
- **shadcn/ui** components
- **Lucide React** icons

### Backend
- **Next.js API Routes**
- **MongoDB** with Mongoose ODM
- **People Data Labs (PDL) API** for B2B contact data
- **OpenAI API** (GPT-4o-mini) for lead qualification
- **JWT** for authentication
- **bcrypt** for password hashing

### Deployment
- **Vercel** (serverless functions)
- **MongoDB Atlas** (database)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ or Bun
- MongoDB Atlas account (free tier works)
- People Data Labs (PDL) account (free tier: 1,000 credits/month)
- OpenAI API key

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd wowlead
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wowlead?retryWrites=true&w=majority

# People Data Labs API Key
# Get from: https://dashboard.peopledatalabs.com/api-keys
# Free tier: 1,000 credits/month
PDL_API_KEY=your_pdl_api_key_here

# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret (generate a strong random string)
JWT_SECRET=your_jwt_secret_here_change_in_production

# Node Environment
NODE_ENV=development
```

4. **Run the development server**
```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Project Structure

```
wowlead/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── icp/route.ts          # ICP profile management
│   │   └── leads/                # Lead management
│   │       ├── route.ts          # Get/create leads
│   │       ├── [id]/route.ts     # Update/delete specific lead
│   │       ├── search/route.ts   # Search Apollo & qualify
│   │       └── export/route.ts   # CSV export
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── icp/page.tsx              # ICP definition page
│   ├── search/page.tsx           # Lead search page
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Registration page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   └── dashboard-layout.tsx      # Dashboard layout wrapper
├── lib/                          # Utility functions
│   ├── mongodb.ts                # MongoDB connection
│   ├── apollo.ts                 # Apollo.io API client
│   ├── openai.ts                 # OpenAI integration
│   ├── auth.ts                   # Authentication utilities
│   ├── auth-context.tsx          # Auth React context
│   └── utils.ts                  # Misc utilities
├── models/                       # Mongoose models
│   ├── User.ts                   # User model
│   ├── ICPProfile.ts             # ICP Profile model
│   └── Lead.ts                   # Lead model
└── public/                       # Static assets
```

## 📊 Data Models

### User
```typescript
{
  email: string (unique, required)
  password: string (hashed, required)
  name?: string
  createdAt: Date
}
```

### ICPProfile
```typescript
{
  userId: ObjectId (unique per user)
  description: string (required)
  industries: string[]
  locations: string[]
  minEmployees?: number
  maxEmployees?: number
  roleTitles: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Lead
```typescript
{
  userId: ObjectId
  apolloId: string
  fullName: string
  title: string
  companyName: string
  companyDomain: string
  location: string
  linkedinUrl: string
  email: string
  rawApolloJson: object
  aiFitScore: number (0-100)
  aiFitLabel: 'good' | 'maybe' | 'bad'
  aiReason: string
  aiTags: string[]
  createdAt: Date
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### ICP Profile
- `GET /api/icp` - Get user's ICP profile
- `POST /api/icp` - Create/update ICP profile

### Leads
- `GET /api/leads` - Get all leads (with filters)
- `POST /api/leads` - Save a lead
- `GET /api/leads/[id]` - Get specific lead
- `PATCH /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead
- `POST /api/leads/search` - Search Apollo & qualify leads
- `GET /api/leads/export` - Export leads to CSV

## 🎯 How It Works

1. **Sign Up**: Create an account with email and password
2. **Define ICP**: Set up your Ideal Customer Profile with:
   - Detailed description
   - Target industries
   - Geographic locations
   - Role titles
   - Company size ranges
3. **Search Leads**: Use Apollo.io filters to find prospects:
   - Job titles
   - Locations
   - Company sizes
4. **AI Qualification**: Each lead is automatically qualified by OpenAI:
   - Fit score (0-100)
   - Label (good/maybe/bad)
   - Reasoning
   - Tags
5. **Manage & Export**: View, filter, and export qualified leads

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies for tokens
- Bcrypt password hashing (10 rounds)
- API key protection (server-side only)
- Input validation and sanitization
- CORS protection

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables**

In Vercel dashboard, add all environment variables from `.env.local`

4. **Set MongoDB Atlas IP whitelist**

In MongoDB Atlas, allow connections from `0.0.0.0/0` (all IPs) for Vercel's dynamic IPs

### Environment Variables on Vercel

Add these in your Vercel project settings:
- `MONGODB_URI`
- `APOLLO_API_KEY`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`

## 📝 Apollo.io API Usage

This app uses Apollo.io's People Search API:
- Endpoint: `https://api.apollo.io/v1/mixed_people/search`
- Authentication: `X-Api-Key` header
- Free trial: ~100 API credits
- Filters supported:
  - `person_titles`
  - `person_locations`
  - `organization_num_employees_ranges`

### Company Size Ranges
- `1,10` - 1-10 employees
- `11,50` - 11-50 employees
- `51,200` - 51-200 employees
- `201,500` - 201-500 employees
- `501,1000` - 501-1,000 employees
- `1001,5000` - 1,001-5,000 employees
- `5001,10000` - 5,001-10,000 employees
- `10001,10000000000` - 10,000+ employees

## 🤖 OpenAI Integration

Lead qualification uses GPT-4o-mini:
- Model: `gpt-4o-mini`
- Temperature: 0.3 (for consistency)
- Response format: JSON
- Fallback: Rule-based scoring if API fails

### Scoring Guidelines
- **80-100**: Excellent fit (label: "good")
- **50-79**: Potential fit (label: "maybe")
- **0-49**: Poor fit (label: "bad")

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Modern glassmorphism effects
- Smooth transitions and animations
- Loading states for all async operations
- Error handling with user-friendly messages
- Toast notifications for actions
- Keyboard shortcuts support

## 🔄 Future Enhancements

- [ ] Bulk lead import
- [ ] Email templates for outreach
- [ ] Integration with CRMs (HubSpot, Salesforce)
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Lead enrichment with additional data sources
- [ ] Custom AI prompts for qualification
- [ ] Saved searches
- [ ] Lead scoring customization

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure IP whitelist includes `0.0.0.0/0` for Vercel
- Check connection string format
- Verify database user permissions

### Apollo API Errors
- Check API key is valid
- Verify trial credits remain
- Check header format: `X-Api-Key: YOUR_KEY`

### OpenAI API Errors
- Verify API key is valid
- Check API usage limits
- Ensure sufficient credits

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Apollo.io, and OpenAI
