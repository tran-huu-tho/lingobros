import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { firebaseUid, email, displayName, photoURL } = await req.json();

    // Check if user exists
    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Update existing user
      user.displayName = displayName;
      user.photoURL = photoURL;
      user.lastActiveAt = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        firebaseUid,
        email,
        displayName,
        photoURL,
        level: 'beginner',
        xp: 0,
        streak: 0,
        hearts: 5,
        gems: 0,
      });
    }

    return NextResponse.json({ 
      success: true, 
      user,
      isNewUser: !user 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}
