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

    const db = await getDatabase();
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Check if user already has accounts
    const existingAccountsCount = await accountsCollection.countDocuments({
      userId: new ObjectId(user.userId)
    });

    if (existingAccountsCount > 0) {
      return NextResponse.json({
        message: 'User already has accounts',
        accountsCount: existingAccountsCount
      }, { status: 200 });
    }

    // Create default account for the user
    const defaultAccount = {
      userId: new ObjectId(user.userId),
      name: 'Main Trading Account',
      initialBalance: 10000,
      currentBalance: 10000,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await accountsCollection.insertOne(defaultAccount);

    return NextResponse.json({
      message: 'Default account created successfully',
      accountId: result.insertedId.toString(),
      account: {
        ...defaultAccount,
        id: result.insertedId.toString(),
        userId: user.userId,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
