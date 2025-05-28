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

// GET - Get all trades for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const tradesCollection = db.collection(COLLECTIONS.TRADES);
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Check if user exists
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's accounts
    const accounts = await accountsCollection.find({ userId: new ObjectId(userId) }).toArray();

    // Get user's trades with pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const trades = await tradesCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalTrades = await tradesCollection.countDocuments({ userId: new ObjectId(userId) });

    // Calculate detailed statistics
    const allTrades = await tradesCollection.find({ userId: new ObjectId(userId) }).toArray();

    const winTrades = allTrades.filter(t => t.status === 'WIN');
    const lossTrades = allTrades.filter(t => t.status === 'LOSS');
    const openTrades = allTrades.filter(t => t.status === 'OPEN' || t.status === 'ACTIVE');
    const planningTrades = allTrades.filter(t => t.status === 'PLANNING' || t.status === 'PLANNED');

    const totalProfit = winTrades.reduce((sum, t) => sum + (t.profitDollars || 0), 0);
    const totalLoss = lossTrades.reduce((sum, t) => sum + (t.lossDollars || 0), 0);
    const netPnL = totalProfit - totalLoss;
    const winRate = (winTrades.length + lossTrades.length) > 0 ? (winTrades.length / (winTrades.length + lossTrades.length)) * 100 : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;

    const avgWin = winTrades.length > 0 ? totalProfit / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? totalLoss / lossTrades.length : 0;

    const bestTrade = winTrades.length > 0 ? Math.max(...winTrades.map(t => t.profitDollars || 0)) : 0;
    const worstTrade = lossTrades.length > 0 ? Math.max(...lossTrades.map(t => t.lossDollars || 0)) : 0;

    // Symbol breakdown
    const symbolStats = allTrades.reduce((acc, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = { count: 0, pnl: 0 };
      }
      acc[trade.symbol].count++;
      if (trade.status === 'WIN') {
        acc[trade.symbol].pnl += trade.profitDollars || 0;
      } else if (trade.status === 'LOSS') {
        acc[trade.symbol].pnl -= trade.lossDollars || 0;
      }
      return acc;
    }, {} as Record<string, { count: number; pnl: number }>);

    const formattedTrades = trades.map(trade => ({
      ...trade,
      id: trade._id.toString(),
    }));

    const formattedAccounts = accounts.map(account => ({
      ...account,
      id: account._id.toString(),
    }));

    return NextResponse.json({
      message: 'User trades retrieved successfully',
      user: {
        ...user,
        id: user._id.toString(),
      },
      accounts: formattedAccounts,
      trades: formattedTrades,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTrades / limit),
        totalTrades,
        limit,
      },
      statistics: {
        totalTrades: allTrades.length,
        winTrades: winTrades.length,
        lossTrades: lossTrades.length,
        openTrades: openTrades.length,
        planningTrades: planningTrades.length,
        totalProfit,
        totalLoss,
        netPnL,
        winRate,
        profitFactor,
        avgWin,
        avgLoss,
        bestTrade,
        worstTrade,
        symbolBreakdown: Object.entries(symbolStats)
          .map(([symbol, stats]) => ({ symbol, ...stats }))
          .sort((a, b) => b.count - a.count),
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Admin user trades fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
