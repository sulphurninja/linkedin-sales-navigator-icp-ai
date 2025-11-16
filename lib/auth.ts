import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import User, { IUser } from '@/models/User';
import { connectToDatabase } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract user from request (from Authorization header or cookie)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<IUser | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie
    if (!token) {
      token = request.cookies.get('token')?.value;
    }

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    await connectToDatabase();
    
    const user = await User.findById(payload.userId).select('-password');
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: NextRequest
): Promise<IUser> {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

