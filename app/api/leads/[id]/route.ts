import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAuth } from '@/lib/auth';

// GET - Fetch a specific lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const lead = await Lead.findOne({
      _id: params.id,
      userId: user._id,
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead });
  } catch (error: any) {
    console.error('Get lead error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const lead = await Lead.findOneAndDelete({
      _id: params.id,
      userId: user._id,
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Lead deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete lead error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

// PATCH - Update a lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    await connectToDatabase();

    const lead = await Lead.findOneAndUpdate(
      {
        _id: params.id,
        userId: user._id,
      },
      {
        ...body,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lead,
      message: 'Lead updated successfully',
    });
  } catch (error: any) {
    console.error('Update lead error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

