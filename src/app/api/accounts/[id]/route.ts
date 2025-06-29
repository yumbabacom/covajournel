import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
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
    const db = await getDatabase();
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Get account by ID and verify ownership
    const account = await accountsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId)
    });

    if (!account) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      );
    }

    const accountResponse = {
      ...account,
      id: account._id.toString(),
      userId: account.userId.toString(),
    };

    return NextResponse.json({
      account: accountResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Get account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const db = await getDatabase();
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Verify account ownership
    const existingAccount = await accountsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId)
    });

    if (!existingAccount) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      );
    }

    // Prepare update object
    const updateFields: any = {
      updatedAt: new Date()
    };

    // Handle name update
    if (updateData.name !== undefined) {
      if (!updateData.name.trim()) {
        return NextResponse.json(
          { message: 'Account name cannot be empty' },
          { status: 400 }
        );
      }
      updateFields.name = updateData.name.trim();
    }

    // Handle balance update (for trade closures)
    if (updateData.currentBalance !== undefined) {
      const newBalance = parseFloat(updateData.currentBalance);
      if (isNaN(newBalance)) {
        return NextResponse.json(
          { message: 'Invalid balance value' },
          { status: 400 }
        );
      }
      updateFields.currentBalance = newBalance;
    }

    // ✅ Handle balance update from trade P&L
    if (updateData.action === 'updateBalance' && updateData.amount !== undefined) {
      console.log('🏦 Processing balance update:', {
        currentBalance: existingAccount.currentBalance,
        amount: updateData.amount,
        tradeId: updateData.tradeId,
        reason: updateData.reason
      });

      const currentBalance = parseFloat(existingAccount.currentBalance) || 0;
      const pnlAmount = parseFloat(updateData.amount) || 0;
      const newBalance = currentBalance + pnlAmount;

      console.log('💰 Balance calculation:', {
        current: currentBalance,
        pnl: pnlAmount,
        new: newBalance
      });

      updateFields.currentBalance = newBalance;
      
      // Add transaction record to account if needed (optional feature)
      console.log('💳 Balance updated successfully:', {
        account: existingAccount.name,
        previousBalance: currentBalance,
        newBalance: newBalance,
        change: pnlAmount
      });
    }

    // Handle default account setting
    if (updateData.isDefault === true) {
      // First, unset all other accounts as default
      await accountsCollection.updateMany(
        { userId: new ObjectId(user.userId) },
        { $set: { isDefault: false } }
      );
      updateFields.isDefault = true;
    }

    // Update the account
    const result = await accountsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      );
    }

    // Get updated account
    const updatedAccount = await accountsCollection.findOne({
      _id: new ObjectId(id)
    });

    const accountResponse = {
      ...updatedAccount,
      id: updatedAccount!._id.toString(),
      userId: updatedAccount!.userId.toString(),
    };

    return NextResponse.json({
      message: 'Account updated successfully',
      account: accountResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Update account error:', error);
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
    const db = await getDatabase();
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);
    const tradesCollection = db.collection(COLLECTIONS.TRADES);

    // Verify account ownership
    const existingAccount = await accountsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId)
    });

    if (!existingAccount) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if account has trades
    const tradesCount = await tradesCollection.countDocuments({
      accountId: new ObjectId(id)
    });

    if (tradesCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete account with existing trades' },
        { status: 400 }
      );
    }

    // Delete the account
    await accountsCollection.deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      message: 'Account deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
