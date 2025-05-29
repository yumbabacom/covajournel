import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const strategiesCollection = db.collection(COLLECTIONS.STRATEGIES);

    // Get strategies for the authenticated user
    const strategies = await strategiesCollection
      .find({ userId: new ObjectId(user.userId) })
      .sort({ updatedAt: -1 })
      .toArray();

    // Calculate usage statistics for each strategy
    const strategiesWithStats = await Promise.all(
      strategies.map(async (strategy) => {
        const trades = await db.collection(COLLECTIONS.TRADES)
          .find({ strategyId: strategy._id })
          .toArray();

        const usageCount = trades.length;
        const closedTrades = trades.filter(trade =>
          trade.status === 'WIN' || trade.status === 'LOSS'
        );

        let winRate = 0;
        let totalPnL = 0;

        if (closedTrades.length > 0) {
          const winTrades = closedTrades.filter(trade => trade.status === 'WIN');
          winRate = (winTrades.length / closedTrades.length) * 100;

          totalPnL = closedTrades.reduce((sum, trade) => {
            const profit = trade.profitDollars || 0;
            const loss = trade.lossDollars || 0;
            return sum + (trade.status === 'WIN' ? profit : -loss);
          }, 0);
        }

        return {
          id: strategy._id.toString(),
          name: strategy.name,
          marketType: strategy.marketType,
          setupConditions: strategy.setupConditions,
          entryRules: strategy.entryRules,
          exitRules: strategy.exitRules,
          timeframe: strategy.timeframe,
          indicators: strategy.indicators || [],
          tags: strategy.tags || [],
          images: strategy.images || [],
          createdAt: strategy.createdAt,
          updatedAt: strategy.updatedAt,
          userId: strategy.userId,
          accountId: strategy.accountId,
          usageCount,
          winRate: closedTrades.length > 0 ? winRate : undefined,
          totalPnL: closedTrades.length > 0 ? totalPnL : undefined,
        };
      })
    );

    return NextResponse.json(strategiesWithStats);
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      marketType,
      setupConditions,
      entryRules,
      exitRules,
      timeframe,
      indicators,
      tags,
      images
    } = body;

    // Validate required fields
    if (!name || !marketType || !setupConditions || !entryRules || !exitRules || !timeframe) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    const strategiesCollection = db.collection(COLLECTIONS.STRATEGIES);

    const strategy = {
      name,
      marketType,
      setupConditions,
      entryRules,
      exitRules,
      timeframe,
      indicators: indicators || [],
      tags: tags || [],
      images: images || [],
      userId: new ObjectId(user.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await strategiesCollection.insertOne(strategy);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...strategy
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
  }
}
