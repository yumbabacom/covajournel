import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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

    const db = await getDatabase();
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Get all accounts for the user
    const accounts = await accountsCollection
      .find({ userId: new ObjectId(user.userId) })
      .sort({ isDefault: -1, createdAt: 1 })
      .toArray();

    // Convert ObjectId to string for response
    const accountsResponse = accounts.map(account => ({
      ...account,
      id: account._id.toString(),
      userId: account.userId.toString(),
    }));

    return NextResponse.json({
      accounts: accountsResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const accountData = await request.json();
    console.log('Received account data:', accountData);

    // Validate required fields
    if (!accountData.name || accountData.initialBalance === undefined) {
      return NextResponse.json(
        { message: 'Account name and initial balance are required' },
        { status: 400 }
      );
    }

    // Validate initial balance
    const initialBalance = parseFloat(accountData.initialBalance);
    if (isNaN(initialBalance) || initialBalance < 0) {
      return NextResponse.json(
        { message: 'Initial balance must be a valid positive number' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Check if this is the user's first account
    const existingAccountsCount = await accountsCollection.countDocuments({
      userId: new ObjectId(user.userId)
    });

    // Create account record
    const newAccount = {
      userId: new ObjectId(user.userId),
      name: accountData.name.trim(),
      initialBalance: initialBalance,
      currentBalance: initialBalance,
      isDefault: existingAccountsCount === 0, // First account is default
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await accountsCollection.insertOne(newAccount);

    return NextResponse.json({
      message: 'Account created successfully',
      accountId: result.insertedId.toString(),
      account: {
        ...newAccount,
        id: result.insertedId.toString(),
        userId: user.userId,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
