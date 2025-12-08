import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import UserProgress from '@/models/UserProgress';

export async function GET(req: NextRequest) {
  try {
    // Get Firebase token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await dbConnect();

    // Get user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get progress stats
    const progressStats = await UserProgress.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const completedLessons = progressStats.find(s => s._id === 'completed')?.count || 0;
    const inProgressLessons = progressStats.find(s => s._id === 'in-progress')?.count || 0;
    const totalLessons = 45; // Total available lessons

    // Get actual study time from user model (tracked in minutes)
    const studyTime = user.studyTime || 0;

    // Calculate achievements
    const achievements = [
      {
        id: '1',
        name: '7 Ngày Streak',
        icon: '🔥',
        description: 'Học liên tục 7 ngày',
        unlocked: user.streak >= 7,
        date: user.streak >= 7 ? new Date().toLocaleDateString('vi-VN') : null
      },
      {
        id: '2',
        name: 'Học Giỏi',
        icon: '📚',
        description: 'Hoàn thành 20 bài học',
        unlocked: completedLessons >= 20,
        date: completedLessons >= 20 ? new Date().toLocaleDateString('vi-VN') : null
      },
      {
        id: '3',
        name: 'Siêu Sao',
        icon: '⭐',
        description: 'Đạt 1000 XP',
        unlocked: user.xp >= 1000,
        date: user.xp >= 1000 ? new Date().toLocaleDateString('vi-VN') : null
      },
      {
        id: '4',
        name: 'Chăm Chỉ',
        icon: '💪',
        description: 'Học 30 giờ',
        unlocked: studyTime >= 1800,
        date: studyTime >= 1800 ? new Date().toLocaleDateString('vi-VN') : null
      },
      {
        id: '5',
        name: '30 Ngày Streak',
        icon: '🏆',
        description: 'Học liên tục 30 ngày',
        unlocked: user.streak >= 30,
        date: user.streak >= 30 ? new Date().toLocaleDateString('vi-VN') : null
      },
      {
        id: '6',
        name: 'Thạo Tiếng Anh',
        icon: '🎓',
        description: 'Hoàn thành 100 bài học',
        unlocked: completedLessons >= 100,
        date: completedLessons >= 100 ? new Date().toLocaleDateString('vi-VN') : null
      }
    ];

    return NextResponse.json({
      totalLessons,
      completedLessons,
      inProgressLessons,
      studyTime,
      achievements
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
