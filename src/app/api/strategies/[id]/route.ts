import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid strategy ID' }, { status: 400 });
    }

    const db = await getDatabase();
    const strategy = await db.collection('strategies').findOne({ _id: new ObjectId(id) });

    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Calculate usage statistics
    const trades = await db.collection('trades')
      .find({ strategyId: id })
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

    const strategyWithStats = {
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

    return NextResponse.json(strategyWithStats);
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json({ error: 'Failed to fetch strategy' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid strategy ID' }, { status: 400 });
    }

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

    // Check if strategy exists and belongs to user
    const existingStrategy = await strategiesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId)
    });

    if (!existingStrategy) {
      return NextResponse.json({ error: 'Strategy not found or access denied' }, { status: 404 });
    }

    const updateData = {
      name,
      marketType,
      setupConditions,
      entryRules,
      exitRules,
      timeframe,
      indicators: indicators || [],
      tags: tags || [],
      images: images || [],
      updatedAt: new Date(),
    };

    const result = await strategiesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
    }

    // Fetch the updated strategy
    const updatedStrategy = await strategiesCollection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      id: updatedStrategy!._id.toString(),
      ...updatedStrategy,
      _id: undefined
    });
  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid strategy ID' }, { status: 400 });
    }

    const db = await getDatabase();
    const strategiesCollection = db.collection(COLLECTIONS.STRATEGIES);

    // Check if strategy exists and belongs to user
    const strategy = await strategiesCollection.findOne({ 
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId)
    });
    
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found or access denied' }, { status: 404 });
    }

    // Check if strategy is being used by any trades
    const tradesUsingStrategy = await db.collection(COLLECTIONS.TRADES)
      .countDocuments({ strategyId: id });

    if (tradesUsingStrategy > 0) {
      return NextResponse.json({
        error: `Cannot delete strategy. It is being used by ${tradesUsingStrategy} trade(s).`
      }, { status: 400 });
    }

    // Delete the strategy
    const result = await strategiesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Strategy deleted successfully' });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 });
  }
}
