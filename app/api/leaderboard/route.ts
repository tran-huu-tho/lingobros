import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get top users sorted by XP
    const topUsers = await User.find({})
      .select('displayName photoURL xp streak level')
      .sort({ xp: -1 })
      .limit(5); // Get top 5 users

    // Format leaderboard data with ranks
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      displayName: user.displayName,
      photoURL: user.photoURL,
      xp: user.xp,
      streak: user.streak,
      level: user.level
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
