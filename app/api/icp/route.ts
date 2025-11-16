import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ICPProfile from '@/models/ICPProfile';
import { requireAuth } from '@/lib/auth';

// GET - Fetch user's ICP profile
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const icpProfile = await ICPProfile.findOne({ userId: user._id });

    if (!icpProfile) {
      return NextResponse.json(
        { error: 'ICP profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ icp: icpProfile });
  } catch (error: any) {
    console.error('Get ICP error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch ICP profile' },
      { status: 500 }
    );
  }
}

// POST - Create or update ICP profile
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const {
      description,
      industries,
      locations,
      minEmployees,
      maxEmployees,
      roleTitles,
    } = body;

    // Validation
    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'ICP description is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Upsert (update if exists, create if not)
    const icpProfile = await ICPProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        description,
        industries: industries || [],
        locations: locations || [],
        minEmployees,
        maxEmployees,
        roleTitles: roleTitles || [],
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      icp: icpProfile,
      message: 'ICP profile saved successfully',
    });
  } catch (error: any) {
    console.error('Save ICP error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to save ICP profile' },
      { status: 500 }
    );
  }
}

