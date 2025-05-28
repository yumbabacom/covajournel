import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tradesCollection = db.collection(COLLECTIONS.TRADES);

    // Check if trade exists and belongs to user
    const existingTrade = await tradesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId)
    });

    if (!existingTrade) {
      return NextResponse.json(
        { message: 'Trade not found' },
        { status: 404 }
      );
    }

    // Prepare update object
    const updateFields: any = {
      updatedAt: new Date(),
    };

    // Only update allowed fields
    const allowedFields = [
      'status', 'notes', 'tags', 'images', 'entryPrice', 'exitPrice', 'stopLoss',
      'accountSize', 'riskPercentage', 'lotSize', 'profitPips',
      'lossPips', 'profitDollars', 'lossDollars', 'riskRewardRatio'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (['entryPrice', 'exitPrice', 'stopLoss', 'accountSize', 'riskPercentage',
             'lotSize', 'profitPips', 'lossPips', 'profitDollars',
             'lossDollars', 'riskRewardRatio'].includes(field)) {
          updateFields[field] = parseFloat(updateData[field]);
        } else {
          updateFields[field] = updateData[field];
        }
      }
    }

    // Check if trade is being closed (WIN or LOSS) and update account balance
    const isBeingClosed = (updateData.status === 'WIN' || updateData.status === 'LOSS') &&
                         (existingTrade.status !== 'WIN' && existingTrade.status !== 'LOSS');
    let balanceUpdateResult = null;

    if (isBeingClosed && existingTrade.accountId) {
      // Calculate profit/loss based on status
      let profitLoss = 0;

      if (updateData.status === 'WIN') {
        // For WIN: use the original potential profit from the trade
        profitLoss = Math.abs(existingTrade.profitDollars || 0);
      } else if (updateData.status === 'LOSS') {
        // For LOSS: use the original potential loss from the trade (as negative)
        profitLoss = -Math.abs(existingTrade.lossDollars || 0);
      }

      if (profitLoss !== 0) {
        // Update account balance
        const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);
        balanceUpdateResult = await accountsCollection.updateOne(
          {
            _id: new ObjectId(existingTrade.accountId),
            userId: new ObjectId(user.userId)
          },
          {
            $inc: { currentBalance: profitLoss },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }

    // Update the trade
    const result = await tradesCollection.updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(user.userId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Trade not found' },
        { status: 404 }
      );
    }

    // Get updated trade
    const updatedTrade = await tradesCollection.findOne({
      _id: new ObjectId(id)
    });

    // Get updated account balance if it was modified
    let updatedAccount = null;
    if (balanceUpdateResult && balanceUpdateResult.matchedCount > 0) {
      const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);
      updatedAccount = await accountsCollection.findOne({
        _id: new ObjectId(existingTrade.accountId)
      });
    }

    return NextResponse.json({
      message: 'Trade updated successfully',
      trade: {
        ...updatedTrade,
        id: updatedTrade?._id.toString(),
        userId: updatedTrade?.userId.toString(),
        accountId: updatedTrade?.accountId?.toString(),
      },
      balanceUpdated: !!balanceUpdateResult,
      newBalance: updatedAccount?.currentBalance,
      profitLoss: isBeingClosed ? (
        updateData.status === 'WIN'
          ? Math.abs(existingTrade.profitDollars || 0)
          : updateData.status === 'LOSS'
          ? -Math.abs(existingTrade.lossDollars || 0)
          : 0
      ) : null
    }, { status: 200 });

  } catch (error) {
    console.error('Update trade error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tradesCollection = db.collection(COLLECTIONS.TRADES);

    // Delete the trade
    const result = await tradesCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Trade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Trade deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete trade error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
