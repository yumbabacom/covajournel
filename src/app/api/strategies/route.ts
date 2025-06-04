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
      description,
      marketType,
      setupConditions,
      entryRules,
      exitRules,
      riskManagement,
      timeframe,
      tradingStyle,
      complexity,
      expectedDrawdown,
      minCapital,
      sessionTiming,
      indicators,
      tags,
      winRate,
      maxRisk,
      profitTarget,
      avgHoldTime,
      monthlyTarget,
      backtestPeriod,
      sharpeRatio,
      maxConsecutiveLosses,
      // Advanced fields
      stopLossType,
      takeProfitType,
      positionSizing,
      maxPositions,
      correlationLimit,
      drawdownLimit,
      volatilityFilter,
      newsFilter,
      marketHours,
      minVolume,
      maxSpread,
      backtestStartDate,
      backtestEndDate,
      commission,
      slippage,
      images
    } = body;

    // Validate required fields - only check the essential ones
    if (!name || !marketType || !tradingStyle) {
      return NextResponse.json({ error: 'Missing required fields: name, market type, and trading style are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const strategiesCollection = db.collection(COLLECTIONS.STRATEGIES);

    const strategy = {
      name,
      description: description || '',
      marketType,
      setupConditions: setupConditions || '',
      entryRules: entryRules || '',
      exitRules: exitRules || '',
      riskManagement: riskManagement || '',
      timeframe: timeframe || '',
      tradingStyle: tradingStyle || '',
      complexity: complexity || 'Intermediate',
      expectedDrawdown: expectedDrawdown || '',
      minCapital: minCapital || '',
      sessionTiming: sessionTiming || '',
      indicators: indicators || [],
      tags: tags || [],
      winRate: winRate || '',
      maxRisk: maxRisk || '2',
      profitTarget: profitTarget || '',
      avgHoldTime: avgHoldTime || '',
      monthlyTarget: monthlyTarget || '',
      backtestPeriod: backtestPeriod || '',
      sharpeRatio: sharpeRatio || '',
      maxConsecutiveLosses: maxConsecutiveLosses || '',
      // Advanced settings
      stopLossType: stopLossType || 'percentage',
      takeProfitType: takeProfitType || 'ratio',
      positionSizing: positionSizing || 'fixed',
      maxPositions: maxPositions || '3',
      correlationLimit: correlationLimit || '0.7',
      drawdownLimit: drawdownLimit || '15',
      volatilityFilter: volatilityFilter || 'medium',
      newsFilter: newsFilter !== undefined ? newsFilter : true,
      marketHours: marketHours || 'any',
      minVolume: minVolume || '',
      maxSpread: maxSpread || '',
      backtestStartDate: backtestStartDate || '',
      backtestEndDate: backtestEndDate || '',
      commission: commission || '0.1',
      slippage: slippage || '0.05',
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
