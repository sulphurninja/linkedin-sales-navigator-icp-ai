import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const label = searchParams.get('label');
    const minScore = searchParams.get('minScore');

    // Build query
    const query: any = { userId: user._id };

    if (label && label !== 'all') {
      query.aiFitLabel = label;
    }

    if (minScore) {
      query.aiFitScore = { $gte: parseInt(minScore) };
    }

    // Fetch all matching leads
    const leads = await Lead.find(query).sort({ aiFitScore: -1 });

    // Convert to CSV
    const headers = [
      'Full Name',
      'Email',
      'Title',
      'Company',
      'Company Domain',
      'Location',
      'LinkedIn URL',
      'AI Fit Score',
      'AI Fit Label',
      'AI Reason',
      'AI Tags',
      'Created At',
    ];

    const rows = leads.map((lead) => [
      lead.fullName,
      lead.email,
      lead.title,
      lead.companyName,
      lead.companyDomain,
      lead.location,
      lead.linkedinUrl,
      lead.aiFitScore,
      lead.aiFitLabel,
      lead.aiReason,
      lead.aiTags.join('; '),
      lead.createdAt.toISOString(),
    ]);

    // Escape CSV fields
    const escapeCsvField = (field: any): string => {
      const str = String(field || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [
      headers.map(escapeCsvField).join(','),
      ...rows.map((row) => row.map(escapeCsvField).join(',')),
    ].join('\n');

    // Return CSV
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export leads error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}

