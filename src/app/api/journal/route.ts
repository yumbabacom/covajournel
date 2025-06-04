import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import JournalEntry from '@/models/JournalEntry';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  return decoded.userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const entries = await JournalEntry.find({ 
      userId, 
      accountId 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    const body = await request.json();
    
    const {
      accountId,
      title,
      content,
      mood,
      confidence,
      tags,
      marketCondition,
      lessons,
      goals,
      images,
      trades
    } = body;

    if (!accountId || !title || !content) {
      return NextResponse.json(
        { error: 'Account ID, title, and content are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const journalEntry = new JournalEntry({
      userId,
      accountId,
      title,
      content,
      mood: mood || 'neutral',
      confidence: confidence || 3,
      tags: tags || [],
      marketCondition,
      lessons,
      goals,
      images: images || [],
      trades: trades || [],
      date: new Date().toISOString().split('T')[0],
    });

    await journalEntry.save();

    return NextResponse.json(
      { message: 'Journal entry created successfully', entry: journalEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    await connectDB();

    const updatedEntry = await JournalEntry.findOneAndUpdate(
      { _id: id, userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Journal entry updated successfully',
      entry: updatedEntry
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    await connectDB();

    const deletedEntry = await JournalEntry.findOneAndDelete({ _id: id, userId });

    if (!deletedEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
} 