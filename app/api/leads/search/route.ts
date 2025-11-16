import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { searchPeople, ApolloSearchFilters } from '@/lib/apollo';
import { batchEnrichPeople, needsEmailUnlock, extractPhoneNumber, parseName } from '@/lib/apollo-enrich';
import { searchPeoplePDL, convertPDLToApolloFormat, convertRangeToPDLSize } from '@/lib/pdl';
import { qualifyLead } from '@/lib/openai';
import ICPProfile from '@/models/ICPProfile';
import Lead from '@/models/Lead';

// Choose data provider based on env variable
// Apollo is recommended if you have Professional plan (better data + email reveal)
// PDL is the fallback option (free tier available)
const USE_APOLLO = process.env.USE_APOLLO === 'true';

// Debug logging to verify environment variable
console.log('🔧 Environment Check:', {
  USE_APOLLO_ENV: process.env.USE_APOLLO,
  USE_APOLLO_VALUE: USE_APOLLO,
  APOLLO_API_KEY_SET: !!process.env.APOLLO_API_KEY,
  PDL_API_KEY_SET: !!process.env.PDL_API_KEY,
  WILL_USE: USE_APOLLO ? 'APOLLO' : 'PDL'
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const {
      titles,
      locations,
      companySizes,
      industries,
      page = 1,
      perPage = 10,
    } = body;

    await connectToDatabase();

    // Get user's ICP profile
    const icpProfile = await ICPProfile.findOne({ userId: user._id });
    if (!icpProfile) {
      return NextResponse.json(
        { error: 'Please create an ICP profile first' },
        { status: 400 }
      );
    }

    // Build search filters based on provider
    // PDL is the default and recommended provider
    let searchResults;

    if (USE_APOLLO) {
      // Use Apollo.io (Professional plan with email reveal)
      console.log('🔵 Using Apollo.io API with email reveal enabled');
      const filters: ApolloSearchFilters = {
        page,
        per_page: perPage,
      };

      if (titles && titles.length > 0) {
        filters.person_titles = titles;
      }

      if (locations && locations.length > 0) {
        filters.person_locations = locations;
      }

      if (companySizes && companySizes.length > 0) {
        filters.organization_num_employees_ranges = companySizes;
      }

      console.log('🔍 Apollo Search Filters:', {
        titles: titles?.length || 0,
        locations: locations?.length || 0,
        companySizes: companySizes?.length || 0,
      });

      searchResults = await searchPeople(filters);
      
      // CRITICAL: Enrich ALL people to reveal emails
      // NOTE: Phone numbers require webhook setup, so we'll use phones from initial search
      console.log(`\n🔓 Enriching all ${searchResults.people.length} people to reveal emails...`);
      
      const peopleToEnrich = searchResults.people.map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        organization_name: p.organization?.name,
        domain: p.organization?.website_url,
        linkedin_url: p.linkedin_url,
      }));

      const enrichedData = await batchEnrichPeople(peopleToEnrich);

      // Update ALL people with enriched email data + existing phone data
      searchResults.people = searchResults.people.map(person => {
        const enriched = enrichedData.get(person.id);
        
        // Always use phone numbers from the initial search (they're already there!)
        const phoneFromSearch = extractPhoneNumber(person.phone_numbers);
        
        if (enriched && enriched.email) {
          return {
            ...person,
            email: enriched.email, // Use enriched email
            email_status: enriched.email_status,
            phone: phoneFromSearch, // Use phone from initial search
          };
        }
        
        return {
          ...person,
          phone: phoneFromSearch, // Use phone from initial search
        };
      });
      
      // Log final results
      const emailCount = searchResults.people.filter(p => p.email && !needsEmailUnlock(p.email)).length;
      const phoneCount = searchResults.people.filter(p => (p as any).phone).length;
      console.log(`\n📊 Final Results:`);
      console.log(`   📧 Emails: ${emailCount}/${searchResults.people.length} (${Math.round((emailCount / searchResults.people.length) * 100)}%)`);
      console.log(`   📱 Phones: ${phoneCount}/${searchResults.people.length} (${Math.round((phoneCount / searchResults.people.length) * 100)}%)`);
      
    } else {
      // Use PDL (fallback - free tier available)
      console.log('🟢 Using People Data Labs (PDL) API');
      const pdlFilters = {
        job_title: titles || [],
        location_name: locations || [],
        job_company_size: companySizes ? companySizes.map(convertRangeToPDLSize) : [],
        page,
        size: perPage,
      };

      const pdlResults = await searchPeoplePDL(pdlFilters);
      
      // Convert to Apollo-compatible format
      searchResults = {
        people: pdlResults.data.map(convertPDLToApolloFormat),
        pagination: {
          page,
          per_page: perPage,
          total_entries: pdlResults.total,
          total_pages: Math.ceil(pdlResults.total / perPage),
        },
      };
    }

    // Qualify each lead with AI
    const qualifiedLeads = await Promise.all(
      searchResults.people.map(async (person) => {
        try {
          // Check if lead already exists for this user
          const existingLead = await Lead.findOne({
            userId: user._id,
            apolloId: person.id,
          });

          if (existingLead) {
            return {
              ...existingLead.toObject(),
              alreadySaved: true,
            };
          }

          // Qualify with AI
          const qualification = await qualifyLead(person, icpProfile);

          return {
            apolloId: person.id,
            fullName: person.name,
            title: person.title,
            companyName: person.organization?.name || 'Unknown',
            companyDomain: person.organization?.website_url || '',
            location: person.city
              ? `${person.city}, ${person.state || person.country}`
              : person.country || 'Unknown',
            linkedinUrl: person.linkedin_url,
            email: person.email && !needsEmailUnlock(person.email) ? person.email : '',
            phone: (person as any).phone || '',
            aiFitScore: qualification.score,
            aiFitLabel: qualification.label,
            aiReason: qualification.reason,
            aiTags: qualification.tags,
            rawApolloJson: person,
            alreadySaved: false,
          };
        } catch (error) {
          console.error('Error qualifying lead:', error);
          // Return basic lead info if qualification fails
          return {
            apolloId: person.id,
            fullName: person.name,
            title: person.title,
            companyName: person.organization?.name || 'Unknown',
            companyDomain: person.organization?.website_url || '',
            location: person.city
              ? `${person.city}, ${person.state || person.country}`
              : person.country || 'Unknown',
            linkedinUrl: person.linkedin_url,
            email: person.email || '',
            aiFitScore: 50,
            aiFitLabel: 'maybe' as const,
            aiReason: 'AI qualification failed',
            aiTags: [],
            rawApolloJson: person,
            alreadySaved: false,
          };
        }
      })
    );

    return NextResponse.json({
      leads: qualifiedLeads,
      pagination: searchResults.pagination,
    });
  } catch (error: any) {
    console.error('Search leads error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to search leads' },
      { status: 500 }
    );
  }
}

