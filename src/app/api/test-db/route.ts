import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await connectDB();
    
    const dbName = mongoose.connection.db?.databaseName;
    const readyState = mongoose.connection.readyState;
    const collections = await mongoose.connection.db?.listCollections().toArray();
    
    const readyStateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log('Database test results:', {
      connected: readyState === 1,
      dbName,
      readyState,
      collectionsCount: collections?.length || 0
    });

    return NextResponse.json({
      success: true,
      connection: {
        connected: readyState === 1,
        databaseName: dbName,
        readyState: readyState,
        readyStateText: readyStateMap[readyState] || 'unknown',
        collections: collections?.map(c => c.name) || []
      },
      message: 'Database connection test successful'
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    }, { status: 500 });
  }
}
