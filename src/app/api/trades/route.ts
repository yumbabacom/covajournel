import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tradeData = await request.json();
    console.log('Received trade data:', tradeData);

    // Validate required fields
    const requiredFields = [
      'symbol', 'entryPrice', 'exitPrice', 'stopLoss',
      'accountSize', 'riskPercentage', 'lotSize', 'accountId'
    ];

    for (const field of requiredFields) {
      if (tradeData[field] === undefined || tradeData[field] === null || tradeData[field] === '') {
        console.log(`Missing field: ${field}, value:`, tradeData[field]);
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Special validation for lotSize - it can be 0 but not NaN
    if (isNaN(parseFloat(tradeData.lotSize))) {
      console.log('Invalid lotSize:', tradeData.lotSize);
      return NextResponse.json(
        { message: 'lotSize must be a valid number' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tradesCollection = db.collection(COLLECTIONS.TRADES);

    // Create trade record
    const newTrade = {
      userId: new ObjectId(user.userId),
      accountId: new ObjectId(tradeData.accountId),
      symbol: tradeData.symbol,
      category: tradeData.category || 'Forex',
      entryPrice: parseFloat(tradeData.entryPrice),
      exitPrice: parseFloat(tradeData.exitPrice),
      stopLoss: parseFloat(tradeData.stopLoss),
      accountSize: parseFloat(tradeData.accountSize),
      riskPercentage: parseFloat(tradeData.riskPercentage),
      riskAmount: parseFloat(tradeData.riskAmount || 0),
      lotSize: parseFloat(tradeData.lotSize || 0),
      profitPips: parseFloat(tradeData.profitPips || 0),
      lossPips: parseFloat(tradeData.lossPips || 0),
      profitDollars: parseFloat(tradeData.profitDollars || 0),
      lossDollars: parseFloat(tradeData.lossDollars || 0),
      riskRewardRatio: parseFloat(tradeData.riskRewardRatio || 0),
      tradeDirection: tradeData.tradeDirection || 'LONG',
      status: tradeData.status || 'PLANNED', // PLANNED, ACTIVE, CLOSED
      notes: tradeData.notes || '',
      tags: tradeData.tags || [],
      images: tradeData.images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await tradesCollection.insertOne(newTrade);

    return NextResponse.json({
      message: 'Trade saved successfully',
      tradeId: result.insertedId.toString(),
      trade: {
        ...newTrade,
        id: result.insertedId.toString(),
        userId: user.userId,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Save trade error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const symbol = searchParams.get('symbol');
    const accountId = searchParams.get('accountId');

    const db = await getDatabase();
    const tradesCollection = db.collection(COLLECTIONS.TRADES);

    // Build query
    const query: any = { userId: new ObjectId(user.userId) };
    if (status) query.status = status;
    if (symbol) query.symbol = { $regex: symbol, $options: 'i' };
    if (accountId) query.accountId = new ObjectId(accountId);

    // Get total count
    const total = await tradesCollection.countDocuments(query);

    // Get trades with pagination
    const trades = await tradesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Transform trades for response
    const transformedTrades = trades.map(trade => ({
      ...trade,
      id: trade._id.toString(),
      userId: trade.userId.toString(),
      accountId: trade.accountId?.toString(),
    }));

    return NextResponse.json({
      trades: transformedTrades,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get trades error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
