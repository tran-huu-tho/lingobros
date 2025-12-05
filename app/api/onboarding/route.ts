import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await connectDB();
    
    const { learningPurpose, dailyGoalMinutes } = await req.json();

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      {
        $set: {
          'preferences.learningGoal': learningPurpose,
          'preferences.dailyGoalMinutes': dailyGoalMinutes,
          hasCompletedOnboarding: true,
          lastActiveAt: new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Save onboarding preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
