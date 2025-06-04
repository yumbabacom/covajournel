import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Trade from '@/models/Trade';

export async function POST(request: Request) {
  try {
    // Ensure database connection
    await connectDB();
    
    let tradeData: any = {};
    
    // Check content type to handle both JSON and FormData
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle JSON submissions (AM trader)
      tradeData = await request.json();
    } else if (contentType?.includes('multipart/form-data')) {
      // Handle FormData submissions (main dashboard)
      const formData = await request.formData();
      
      // Convert FormData to object
      tradeData = {};
      for (const [key, value] of formData.entries()) {
        if (key === 'images') {
          // Skip images for now - they need proper file upload handling
          continue;
        } else if (key === 'tags') {
          // Handle multiple tags
          if (!tradeData.tags) tradeData.tags = [];
          tradeData.tags.push(value);
        } else {
          tradeData[key] = value;
        }
      }
      
      // Set context to 'main' for FormData submissions (main dashboard trades)
      tradeData.context = 'main';
    } else {
      throw new Error('Unsupported content type');
    }
    
    // Ensure context is set (default to 'main' if not specified)
    if (!tradeData.context) {
      tradeData.context = 'main';
    }
    
    console.log('Creating trade with context:', tradeData.context);
    
    // Create and save trade
    const trade = new Trade(tradeData);
    const savedTrade = await trade.save();
    
    console.log('Trade saved successfully:', savedTrade._id);
    
    return NextResponse.json({ 
      success: true, 
      trade: savedTrade,
      message: 'Trade created successfully' 
    });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trade', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Ensure database connection
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const context = searchParams.get('context');
    const userId = searchParams.get('userId');

    console.log('GET /api/trades called with:', { accountId, context, userId });
    
    // Build query
    const query: any = {};
    
    if (accountId) {
      query.accountId = accountId;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (context) {
      query.context = context;
    }
    
    console.log('MongoDB query:', query);
    
    // Fetch trades from MongoDB
    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${trades.length} trades`);
    
    // Transform trades to have id field instead of _id
    const transformedTrades = trades.map((trade: any) => {
      console.log('Original trade._id:', trade._id, 'Type:', typeof trade._id);
      const transformedTrade = {
        ...trade,
        id: trade._id.toString(),
        // Remove the original _id field to avoid confusion
        _id: undefined
      };
      console.log('Transformed trade.id:', transformedTrade.id, 'Type:', typeof transformedTrade.id);
      return transformedTrade;
    });
    
    // Log context breakdown
    const contextBreakdown = trades.reduce((acc: any, trade) => {
      const ctx = trade.context || 'undefined';
      acc[ctx] = (acc[ctx] || 0) + 1;
      return acc;
    }, {});
    console.log('Context breakdown:', contextBreakdown);

    return NextResponse.json({
      success: true,
      trades: transformedTrades,
      total: transformedTrades.length,
      debug: {
        totalInDatabase: trades.length,
        contextBreakdown,
        filters: { accountId, context, userId },
        query
      }
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trades', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Ensure database connection
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get('clearAll');
    const tradeId = searchParams.get('id');
    
    if (clearAll === 'true') {
      // Delete all trades
      const result = await Trade.deleteMany({});
      const deletedCount = result.deletedCount || 0;
      
      console.log(`Cleared ${deletedCount} trades`);
      
      return NextResponse.json({
        success: true,
        message: `Cleared ${deletedCount} trades`,
        deletedCount
      });
    } else if (tradeId) {
      // Delete specific trade
      const result = await Trade.findByIdAndDelete(tradeId);
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Trade not found' },
          { status: 404 }
        );
      }
      
      console.log(`Deleted trade with ID: ${tradeId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Trade deleted successfully',
        trade: result
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Either clearAll=true or id parameter required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete trades', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
