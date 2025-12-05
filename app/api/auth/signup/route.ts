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
      // Update existing user - but DON'T overwrite photoURL if not provided
      user.displayName = displayName;
      if (email) user.email = email; // Only update email if provided
      if (photoURL) {
        // Only update photoURL if explicitly provided (for new users or password signup)
        user.photoURL = photoURL;
      }
      // If photoURL is not in the request, keep the existing one (user uploaded custom photo)
      
      // Ensure preferences exist with all required fields
      if (!user.preferences) {
        user.preferences = {
          learningGoal: 'regular',
          dailyGoalMinutes: 15,
          notificationsEnabled: true,
          soundEnabled: true,
          interests: []
        };
      } else {
        // Merge with defaults for missing fields
        if (!user.preferences.learningGoal) {
          user.preferences.learningGoal = 'regular';
        }
        if (!user.preferences.dailyGoalMinutes) {
          user.preferences.dailyGoalMinutes = 15;
        }
      }
      
      // Ensure hasCompletedOnboarding exists
      if (typeof user.hasCompletedOnboarding !== 'boolean') {
        user.hasCompletedOnboarding = false;
      }
      
      user.lastActiveAt = new Date();
      await user.save();
    } else {
      // Create new user - email is optional for Facebook login
      user = await User.create({
        firebaseUid,
        email: email || `${firebaseUid}@lingobros.app`, // Generate email if not provided
        displayName,
        photoURL,
        level: 'beginner',
        xp: 0,
        streak: 0,
        hearts: 5,
        gems: 0,
        hasCompletedOnboarding: false, // Explicitly set to false for new users
        preferences: {
          learningGoal: 'regular',
          dailyGoalMinutes: 15,
          notificationsEnabled: true,
          soundEnabled: true,
          interests: []
        }
      });
      
      console.log('Created new user:', user.displayName, 'hasCompletedOnboarding:', user.hasCompletedOnboarding);
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
