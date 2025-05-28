import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

// POST - Create initial admin user (one-time setup)
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    // Check if any admin user already exists
    const existingAdmin = await usersCollection.findOne({ isAdmin: true });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        adminExists: true,
      }, { status: 400 });
    }

    // Check if the specific admin email already exists
    const existingUser = await usersCollection.findOne({ email: 'admin@tradingjournal.com' });

    if (existingUser) {
      // Update existing user to admin
      await usersCollection.updateOne(
        { email: 'admin@tradingjournal.com' },
        {
          $set: {
            isAdmin: true,
            updatedAt: new Date()
          }
        }
      );

      return NextResponse.json({
        message: 'Existing user promoted to admin successfully',
        email: 'admin@tradingjournal.com',
        note: 'Use existing password to login',
      }, { status: 200 });
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const adminUser = {
      name: 'Admin User',
      email: 'admin@tradingjournal.com',
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(adminUser);

    return NextResponse.json({
      message: 'Admin user created successfully',
      email: 'admin@tradingjournal.com',
      password: 'admin123',
      userId: result.insertedId.toString(),
      warning: 'Please change the password after first login',
    }, { status: 201 });

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Check if admin exists
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    // Check if any admin user exists
    const adminExists = await usersCollection.findOne({ isAdmin: true });

    return NextResponse.json({
      adminExists: !!adminExists,
      message: adminExists ? 'Admin user exists' : 'No admin user found',
    }, { status: 200 });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
