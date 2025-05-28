import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    // Find user by email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    // Return user data (without password) and token
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
      lastLogin: new Date(),
    };

    return NextResponse.json({
      message: 'Login successful',
      user: userResponse,
      token,
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
