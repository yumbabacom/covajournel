import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In production, implement proper rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Simple rate limiting (in production, use Redis or proper solution)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const attempts = loginAttempts.get(clientIP);
    
    if (attempts && attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1000) { // 15 minutes
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    // Find user by email (case insensitive)
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (!user) {
      // Track failed attempt
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      loginAttempts.set(clientIP, { 
        count: currentAttempts.count + 1, 
        lastAttempt: now 
      });
      
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Track failed attempt
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      loginAttempts.set(clientIP, { 
        count: currentAttempts.count + 1, 
        lastAttempt: now 
      });
      
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(clientIP);

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
      { 
        $set: { 
          lastLogin: new Date(), 
          updatedAt: new Date(),
          lastLoginIP: clientIP
        } 
      }
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
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
