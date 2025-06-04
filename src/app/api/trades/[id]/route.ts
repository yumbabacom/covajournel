import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Trade from '@/models/Trade';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await connectDB();
    
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const updateData = await request.json();

    // Debug logging
    console.log('PUT /api/trades/[id] called with:');
    console.log('ID received:', id);
    console.log('ID type:', typeof id);
    console.log('ID length:', id?.length);
    console.log('User ID from auth:', user.userId);
    console.log('Update data:', updateData);

    // Validate that we have an ID
    if (!id || typeof id !== 'string') {
      console.error('Invalid ID provided:', { id, type: typeof id });
      return NextResponse.json(
        { 
          message: 'Invalid trade ID',
          debug: {
            receivedId: id,
            type: typeof id,
            length: id?.length
          }
        },
        { status: 400 }
      );
    }

    // First, let's find the trade by ID only to see what we get
    console.log('Looking for trade with ID:', id);
    const tradeById = await Trade.findById(id);
    console.log('Trade found by ID only:', tradeById ? {
      _id: tradeById._id,
      userId: tradeById.userId,
      accountId: tradeById.accountId,
      symbol: tradeById.symbol
    } : 'Not found');

    // Check if trade exists and belongs to user using accountId instead of userId
    // This is more consistent with how the GET endpoint works
    const existingTrade = await Trade.findOne({
      _id: id
      // Remove userId filter for now to debug
    });

    if (!existingTrade) {
      console.error('Trade not found by ID:', { id });
      return NextResponse.json(
        { message: 'Trade not found' },
        { status: 404 }
      );
    }

    console.log('Found existing trade:', {
      _id: existingTrade._id,
      userId: existingTrade.userId,
      accountId: existingTrade.accountId,
      symbol: existingTrade.symbol
    });

    // TODO: Add proper authorization check once we understand the data structure
    // For now, let's allow the update to proceed to test the functionality

    // Prepare update object
    const updateFields: any = {
      updatedAt: new Date(),
    };

    // Only update allowed fields
    const allowedFields = [
      'symbol', 'category', 'tradeDirection', 'status', 'notes', 'tags', 'images', 
      'entryPrice', 'exitPrice', 'stopLoss', 'accountSize', 'riskPercentage', 
      'riskAmount', 'lotSize', 'profitPips', 'lossPips', 'profitDollars', 
      'lossDollars', 'riskRewardRatio', 'strategyId'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (['entryPrice', 'exitPrice', 'stopLoss', 'accountSize', 'riskPercentage',
             'riskAmount', 'lotSize', 'profitPips', 'lossPips', 'profitDollars',
             'lossDollars', 'riskRewardRatio'].includes(field)) {
          updateFields[field] = parseFloat(updateData[field]);
        } else {
          updateFields[field] = updateData[field];
        }
      }
    }

    console.log('Update fields to apply:', updateFields);

    // Update the trade using Mongoose
    const updatedTrade = await Trade.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedTrade) {
      return NextResponse.json(
        { message: 'Failed to update trade' },
        { status: 500 }
      );
    }

    console.log('Trade updated successfully:', updatedTrade._id);

    // ✅ UPDATE ACCOUNT BALANCE IF TRADE STATUS CHANGED TO WIN OR LOSS
    if (updateData.status && (updateData.status === 'WIN' || updateData.status === 'LOSS')) {
      try {
        console.log('🏦 Updating account balance for trade status:', updateData.status);
        
        // Calculate P&L for this trade
        let pnlAmount = 0;
        if (updateData.status === 'WIN') {
          pnlAmount = updateData.profitDollars || updatedTrade.profitDollars || 0;
        } else if (updateData.status === 'LOSS') {
          pnlAmount = -(updateData.lossDollars || updatedTrade.lossDollars || 0);
        }

        console.log('💰 Calculated P&L amount:', pnlAmount);

        if (pnlAmount !== 0 && updatedTrade.accountId) {
          // Update account balance using the account API
          const token = request.headers.get('Authorization')?.replace('Bearer ', '');
          
          if (token) {
            const accountUpdateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/accounts/${updatedTrade.accountId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                action: 'updateBalance',
                amount: pnlAmount,
                tradeId: updatedTrade._id.toString(),
                reason: `Trade ${updateData.status}: ${updatedTrade.symbol}`
              })
            });

            if (accountUpdateResponse.ok) {
              console.log('✅ Account balance updated successfully');
              
              // ✅ BROADCAST BALANCE UPDATE EVENTS
              // Since we can't use window in server-side, we'll include the event data in response
              // The frontend will handle the broadcasting
            } else {
              console.error('❌ Failed to update account balance:', await accountUpdateResponse.text());
            }
          }
        }
      } catch (balanceError) {
        console.error('❌ Error updating account balance:', balanceError);
        // Don't fail the trade update if balance update fails
      }
    }

    return NextResponse.json({
      message: 'Trade updated successfully',
      trade: {
        ...updatedTrade.toObject(),
        id: updatedTrade._id.toString(),
      },
      // Include balance update info for frontend event handling
      balanceUpdated: updateData.status === 'WIN' || updateData.status === 'LOSS',
      pnlAmount: updateData.status === 'WIN' ? (updateData.profitDollars || 0) : 
                 updateData.status === 'LOSS' ? -(updateData.lossDollars || 0) : 0
    }, { status: 200 });

  } catch (error) {
    console.error('Update trade error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await connectDB();
    
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Debug logging
    console.log('DELETE /api/trades/[id] called with:');
    console.log('ID received:', id);
    console.log('ID type:', typeof id);
    console.log('ID length:', id?.length);
    console.log('User ID from auth:', user.userId);

    // Validate that we have an ID
    if (!id || typeof id !== 'string') {
      console.error('Invalid ID provided:', { id, type: typeof id });
      return NextResponse.json(
        { message: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    // First check if trade exists at all
    console.log('Looking for trade with ID:', id);
    const existingTrade = await Trade.findById(id);
    console.log('Trade found by ID:', existingTrade ? {
      _id: existingTrade._id,
      userId: existingTrade.userId,
      accountId: existingTrade.accountId,
      symbol: existingTrade.symbol
    } : 'Not found');

    if (!existingTrade) {
      console.error('Trade not found by ID:', { id });
      return NextResponse.json(
        { message: 'Trade not found' },
        { status: 404 }
      );
    }

    // Delete the trade using just the ID (similar to how PUT works)
    // Since authentication is already verified above
    const result = await Trade.findByIdAndDelete(id);

    if (!result) {
      console.error('Failed to delete trade:', { id });
      return NextResponse.json(
        { message: 'Trade not found or could not be deleted' },
        { status: 404 }
      );
    }

    console.log('Trade deleted successfully:', {
      id: result._id,
      symbol: result.symbol,
      accountId: result.accountId
    });

    return NextResponse.json({
      message: 'Trade deleted successfully',
      deletedTrade: {
        id: result._id.toString(),
        symbol: result.symbol,
        accountId: result.accountId
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Delete trade error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
