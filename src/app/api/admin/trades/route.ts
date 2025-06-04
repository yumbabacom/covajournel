import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify admin access
async function verifyAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded.isAdmin) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Get all trades across all users with detailed information
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const symbol = searchParams.get('symbol');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const tradesCollection = db.collection(COLLECTIONS.TRADES);
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Build filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.userId = new ObjectId(userId);
    if (symbol) filter.symbol = { $regex: symbol, $options: 'i' };

    // Build sort query
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get trades with pagination
    const trades = await tradesCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalTrades = await tradesCollection.countDocuments(filter);

    // Get user information for each trade
    const tradesWithUserInfo = await Promise.all(
      trades.map(async (trade) => {
        const user = await usersCollection.findOne(
          { _id: trade.userId },
          { projection: { password: 0 } }
        );

        const account = await accountsCollection.findOne({ _id: trade.accountId });

        return {
          ...trade,
          id: trade._id.toString(),
          user: user ? {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin || false,
          } : null,
          account: account ? {
            id: account._id.toString(),
            name: account.name,
            currentBalance: account.currentBalance,
          } : null,
        };
      })
    );

    // Calculate summary statistics
    const allTrades = await tradesCollection.find(filter).toArray();
    const summary = {
      totalTrades: allTrades.length,
      winTrades: allTrades.filter(t => t.status === 'WIN').length,
      lossTrades: allTrades.filter(t => t.status === 'LOSS').length,
      openTrades: allTrades.filter(t => t.status === 'OPEN' || t.status === 'ACTIVE').length,
      planningTrades: allTrades.filter(t => t.status === 'PLANNING' || t.status === 'PLANNED').length,
      totalProfit: allTrades
        .filter(t => t.status === 'WIN')
        .reduce((sum, t) => sum + (t.profitDollars || 0), 0),
      totalLoss: allTrades
        .filter(t => t.status === 'LOSS')
        .reduce((sum, t) => sum + (t.lossDollars || 0), 0),
      avgTradeSize: allTrades.length > 0 
        ? allTrades.reduce((sum, t) => sum + (t.lotSize || 0), 0) / allTrades.length 
        : 0,
      mostTradedSymbols: getMostTradedSymbols(allTrades),
      tradingDirections: {
        long: allTrades.filter(t => t.tradeDirection === 'LONG').length,
        short: allTrades.filter(t => t.tradeDirection === 'SHORT').length,
      },
      timeDistribution: getTimeDistribution(allTrades),
    };

    return NextResponse.json({
      message: 'Trades retrieved successfully',
      trades: tradesWithUserInfo,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTrades / limit),
        totalTrades,
        limit,
      },
      summary,
      filters: {
        status,
        userId,
        symbol,
        sortBy,
        sortOrder,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Admin trades fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get most traded symbols
function getMostTradedSymbols(trades: any[]) {
  const symbolCounts = trades.reduce((acc, trade) => {
    acc[trade.symbol] = (acc[trade.symbol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(symbolCounts)
    .map(([symbol, count]) => ({ symbol, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Helper function to get time distribution
function getTimeDistribution(trades: any[]) {
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  const monthCounts = new Array(12).fill(0);

  trades.forEach(trade => {
    const date = new Date(trade.createdAt);
    hourCounts[date.getHours()]++;
    dayCounts[date.getDay()]++;
    monthCounts[date.getMonth()]++;
  });

  return {
    byHour: hourCounts.map((count, hour) => ({ hour, count })),
    byDay: dayCounts.map((count, day) => ({ 
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day], 
      count 
    })),
    byMonth: monthCounts.map((count, month) => ({ 
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month], 
      count 
    })),
  };
}
