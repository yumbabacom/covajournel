import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    const user = await usersCollection.findOne(
      { _id: new ObjectId(tokenUser.userId) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    return NextResponse.json({
      message: 'Token is valid',
      user: userResponse,
    }, { status: 200 });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
