import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { calculateStreak, calculateLevel, calculateHearts } from '@/lib/user-progression';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await connectDB();

    // Find user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate and update streak
    const { streak, isNewDay } = calculateStreak(user.lastActiveAt || new Date(), user.streak || 0);
    
    // Calculate level based on XP
    const { level, levelName } = calculateLevel(user.xp || 0);
    
    // Regenerate hearts based on time elapsed (1 heart per 5 minutes)
    const heartRegen = calculateHearts(user.hearts || 50, user.lastHeartUpdate || new Date());
    
    // Update user
    user.streak = streak;
    user.level = levelName;
    user.hearts = heartRegen.hearts;
    user.lastHeartUpdate = heartRegen.lastUpdate;
    user.lastActiveAt = new Date();
    
    await user.save();

    console.log('✅ Daily check-in:', { 
      email: user.email, 
      streak, 
      isNewDay, 
      level: levelName,
      hearts: heartRegen.hearts,
      heartsRegenerated: heartRegen.hearts - (user.hearts || 50)
    });

    return NextResponse.json({
      success: true,
      streak,
      isNewDay,
      streakBonusXp: isNewDay ? 10 : 0, // Bonus 10 XP for daily login
      hearts: heartRegen.hearts,
      minutesUntilNext: heartRegen.minutesUntilNext,
      level: levelName,
      levelNumber: level
    });
  } catch (error) {
    console.error('Daily check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to update daily check-in' },
      { status: 500 }
    );
  }
}
