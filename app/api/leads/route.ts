import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAuth } from '@/lib/auth';

// GET - Fetch all leads for user with optional filtering
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const label = searchParams.get('label');
    const minScore = searchParams.get('minScore');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = { userId: user._id };

    if (label && label !== 'all') {
      query.aiFitLabel = label;
    }

    if (minScore) {
      query.aiFitScore = { $gte: parseInt(minScore) };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit),
      Lead.countDocuments(query),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get leads error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST - Save a lead
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const {
      apolloId,
      fullName,
      title,
      companyName,
      companyDomain,
      location,
      linkedinUrl,
      email,
      rawApolloJson,
      aiFitScore,
      aiFitLabel,
      aiReason,
      aiTags,
    } = body;

    // Validation
    if (!apolloId || !fullName || !title || !companyName) {
      return NextResponse.json(
        { error: 'Missing required lead fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if lead already exists for this user
    const existingLead = await Lead.findOne({
      userId: user._id,
      apolloId,
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead already saved', lead: existingLead },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await Lead.create({
      userId: user._id,
      apolloId,
      fullName,
      title,
      companyName,
      companyDomain: companyDomain || '',
      location: location || '',
      linkedinUrl: linkedinUrl || '',
      email: email || '',
      rawApolloJson: rawApolloJson || {},
      aiFitScore: aiFitScore || 50,
      aiFitLabel: aiFitLabel || 'maybe',
      aiReason: aiReason || '',
      aiTags: aiTags || [],
    });

    return NextResponse.json({
      lead,
      message: 'Lead saved successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Save lead error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}

