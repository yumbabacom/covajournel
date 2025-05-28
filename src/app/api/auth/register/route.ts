import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if this is the first user (make them admin)
    const userCount = await usersCollection.countDocuments();
    const isFirstUser = userCount === 0;

    // Create user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: isFirstUser || email.toLowerCase() === 'admin@tradingjournal.com', // First user or specific admin email becomes admin
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email: email.toLowerCase(),
        name,
        isAdmin: newUser.isAdmin
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const userResponse = {
      id: result.insertedId.toString(),
      name,
      email: email.toLowerCase(),
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
