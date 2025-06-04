import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const tradesCollection = db.collection(COLLECTIONS.TRADES);

    // Get first 5 trades for debugging
    const trades = await tradesCollection
      .find({})
      .limit(5)
      .toArray();

    console.log('=== DEBUG TRADES ===');
    trades.forEach((trade, index) => {
      console.log(`Trade ${index + 1}:`, {
        _id: trade._id,
        _id_type: typeof trade._id,
        _id_string: trade._id.toString(),
        symbol: trade.symbol
      });
    });

    return NextResponse.json({
      message: 'Debug info logged to console',
      trades: trades.map(trade => ({
        _id: trade._id,
        _id_type: typeof trade._id,
        _id_string: trade._id.toString(),
        symbol: trade.symbol,
        transformed_id: trade._id.toString()
      }))
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 