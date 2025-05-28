import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Try to ping the database
    await db.admin().ping();
    
    return NextResponse.json({
      message: 'Database connection successful',
      status: 'connected',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      message: 'Database connection failed',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
