import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify admin access
async function verifyAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded.isAdmin) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Get all users with their trade statistics
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const tradesCollection = db.collection(COLLECTIONS.TRADES);
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Get all users (excluding passwords)
    const users = await usersCollection.find(
      {},
      {
        projection: {
          password: 0
        }
      }
    ).toArray();

    // Get trade statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get user's accounts
        const accounts = await accountsCollection.find({ userId: user._id }).toArray();

        // Get user's trades
        const trades = await tradesCollection.find({ userId: user._id }).toArray();

        // Calculate statistics
        const totalTrades = trades.length;
        const winTrades = trades.filter(t => t.status === 'WIN').length;
        const lossTrades = trades.filter(t => t.status === 'LOSS').length;
        const openTrades = trades.filter(t => t.status === 'OPEN' || t.status === 'ACTIVE').length;
        const planningTrades = trades.filter(t => t.status === 'PLANNING' || t.status === 'PLANNED').length;

        const totalProfit = trades
          .filter(t => t.status === 'WIN')
          .reduce((sum, t) => sum + (t.profitDollars || 0), 0);

        const totalLoss = trades
          .filter(t => t.status === 'LOSS')
          .reduce((sum, t) => sum + (t.lossDollars || 0), 0);

        const netPnL = totalProfit - totalLoss;
        const winRate = totalTrades > 0 ? (winTrades / (winTrades + lossTrades)) * 100 : 0;

        const totalAccountBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);

        return {
          ...user,
          id: user._id.toString(),
          statistics: {
            totalTrades,
            winTrades,
            lossTrades,
            openTrades,
            planningTrades,
            totalProfit,
            totalLoss,
            netPnL,
            winRate,
            accountsCount: accounts.length,
            totalAccountBalance,
          },
          accounts: accounts.map(acc => ({
            ...acc,
            id: acc._id.toString(),
          })),
          recentTrades: trades
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map(trade => ({
              ...trade,
              id: trade._id.toString(),
            })),
        };
      })
    );

    return NextResponse.json({
      message: 'Users retrieved successfully',
      users: usersWithStats,
      totalUsers: users.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user and all their data
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const tradesCollection = db.collection(COLLECTIONS.TRADES);
    const accountsCollection = db.collection(COLLECTIONS.ACCOUNTS);

    // Check if user exists
    const user = await usersCollection.findOne({ _id: new (require('mongodb')).ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users
    if (user.isAdmin) {
      return NextResponse.json(
        { message: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete user's trades
    const tradesResult = await tradesCollection.deleteMany({
      userId: new (require('mongodb')).ObjectId(userId)
    });

    // Delete user's accounts
    const accountsResult = await accountsCollection.deleteMany({
      userId: new (require('mongodb')).ObjectId(userId)
    });

    // Delete the user
    const userResult = await usersCollection.deleteOne({
      _id: new (require('mongodb')).ObjectId(userId)
    });

    return NextResponse.json({
      message: 'User and all associated data deleted successfully',
      deletedData: {
        user: userResult.deletedCount,
        trades: tradesResult.deletedCount,
        accounts: accountsResult.deletedCount,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
