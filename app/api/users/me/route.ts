import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await connectDB();
    
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  console.log('========================================');
  console.log('PATCH /api/users/me called');
  console.log('========================================');
  
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      console.log('ERROR: No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    console.log('Token received, verifying...');
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    console.log('Token verified for UID:', firebaseUid);

    await connectDB();
    console.log('Connected to DB');
    
    const updates = await req.json();
    console.log('Updates received:', JSON.stringify(updates, null, 2));
    
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { ...updates, lastActiveAt: new Date() },
      { new: true }
    );

    if (!user) {
      console.error('ERROR: User not found for firebaseUid:', firebaseUid);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User updated successfully!');
    console.log('New bio value:', user.bio);
    console.log('========================================');
    return NextResponse.json({ user });
  } catch (error) {
    console.error('PATCH ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
