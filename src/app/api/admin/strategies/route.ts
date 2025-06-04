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

    // For now, return mock strategies since we don't have a strategies collection yet
    const mockStrategies = [
      {
        id: '1',
        userId: decoded.userId,
        userName: 'Admin User',
        name: 'Scalping Strategy',
        description: 'Quick scalping strategy for major pairs',
        type: 'scalping',
        symbols: ['EURUSD', 'GBPUSD'],
        rules: ['Enter on RSI oversold', 'Exit at 10 pips profit'],
        riskManagement: {
          maxRiskPerTrade: 2,
          stopLoss: 10,
          takeProfit: 10,
          maxDrawdown: 5
        },
        performance: {
          totalTrades: 150,
          winRate: 65.5,
          avgReturn: 2.3,
          maxDrawdown: 3.2,
          sharpeRatio: 1.8
        },
        isPublic: true,
        tags: ['scalping', 'forex'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      },
      {
        id: '2',
        userId: decoded.userId,
        userName: 'Pro Trader',
        name: 'Swing Trading Strategy',
        description: 'Medium-term swing trading approach',
        type: 'swing',
        symbols: ['EURUSD', 'GBPJPY', 'USDJPY'],
        rules: ['Daily chart analysis', 'Support/resistance levels'],
        riskManagement: {
          maxRiskPerTrade: 3,
          stopLoss: 50,
          takeProfit: 150,
          maxDrawdown: 8
        },
        performance: {
          totalTrades: 89,
          winRate: 72.1,
          avgReturn: 4.8,
          maxDrawdown: 5.2,
          sharpeRatio: 2.1
        },
        isPublic: false,
        tags: ['swing', 'daily'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      }
    ];

    return NextResponse.json({ strategies: mockStrategies });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 