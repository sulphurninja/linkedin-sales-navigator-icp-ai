// PDL API Test Utility
// Use this to test your PDL integration before going live

import { searchPeoplePDL } from './pdl';

/**
 * Test PDL API connection and search functionality
 * Run with: npx ts-node lib/pdl-test.ts
 */
export async function testPDLConnection() {
  console.log('🧪 Testing PDL API Connection...\n');

  try {
    // Test 1: Simple search
    console.log('Test 1: Simple job title search');
    const result1 = await searchPeoplePDL({
      job_title: ['Software Engineer'],
      size: 3,
      page: 1,
    });
    console.log(`✅ Found ${result1.data.length} people`);
    console.log(`Total results: ${result1.total}`);
    console.log('---\n');

    // Test 2: Location search
    console.log('Test 2: Location-based search');
    const result2 = await searchPeoplePDL({
      job_title: ['CTO', 'VP Engineering'],
      location_name: ['San Francisco'],
      size: 3,
      page: 1,
    });
    console.log(`✅ Found ${result2.data.length} CTOs/VPs in San Francisco`);
    console.log('---\n');

    // Test 3: Company size filter
    console.log('Test 3: Company size filter');
    const result3 = await searchPeoplePDL({
      job_title: ['Product Manager'],
      job_company_size: ['51-200', '201-500'],
      size: 3,
      page: 1,
    });
    console.log(`✅ Found ${result3.data.length} Product Managers in mid-size companies`);
    console.log('---\n');

    // Test 4: Combined filters
    console.log('Test 4: Combined filters (realistic search)');
    const result4 = await searchPeoplePDL({
      job_title: ['Head of Sales', 'VP Sales'],
      location_name: ['United States'],
      job_company_size: ['201-500', '501-1000'],
      size: 5,
      page: 1,
    });
    console.log(`✅ Found ${result4.data.length} sales leaders in US mid-market companies`);
    
    if (result4.data.length > 0) {
      console.log('\nSample result:');
      const sample = result4.data[0];
      console.log(`  Name: ${sample.full_name}`);
      console.log(`  Title: ${sample.job_title}`);
      console.log(`  Company: ${sample.job_company_name}`);
      console.log(`  Location: ${sample.location_name}`);
      console.log(`  Email: ${sample.emails?.[0]?.address || 'N/A'}`);
    }
    console.log('---\n');

    console.log('🎉 All tests passed! Your PDL integration is working correctly.\n');
    console.log('💡 Tip: Each person returned = 1 credit used');
    console.log('💡 Free tier: 1,000 credits/month\n');

    return true;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your PDL_API_KEY in .env.local');
    console.log('2. Verify you have credits at https://dashboard.peopledatalabs.com/');
    console.log('3. Ensure your API key has search permissions\n');
    return false;
  }
}

// Run test if executed directly
if (require.main === module) {
  testPDLConnection();
}

