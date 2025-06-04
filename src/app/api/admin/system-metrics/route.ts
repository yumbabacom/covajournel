import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    
    // Check if user is admin
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId),
      isAdmin: true 
    });
    
    if (!user) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Generate realistic system metrics
    const metrics = {
      serverHealth: 'excellent' as const,
      serverUptime: 99.9,
      memoryUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
      cpuUsage: Math.floor(Math.random() * 30) + 20,    // 20-50%
      diskUsage: Math.floor(Math.random() * 15) + 40,   // 40-55%
      databaseConnections: Math.floor(Math.random() * 30) + 40, // 40-70
      responseTime: Math.floor(Math.random() * 50) + 100, // 100-150ms
      errorRate: (Math.random() * 0.05).toFixed(3), // 0-0.05%
      activeConnections: Math.floor(Math.random() * 200) + 500, // 500-700
      queueSize: Math.floor(Math.random() * 10) + 1 // 1-10
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 