import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserProgress from '@/models/UserProgress';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await connectDB();

    // Tìm user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Lấy tất cả progress của user
    const progressList = await UserProgress.find({ userId: user._id });

    // Tạo map để tra cứu nhanh
    const progressMap: Record<string, any> = {};
    progressList.forEach(p => {
      progressMap[p.topicId.toString()] = {
        status: p.status,
        score: p.score,
        exercisesCompleted: p.exercisesCompleted,
        completedAt: p.completedAt
      };
    });

    return NextResponse.json({
      success: true,
      progressMap
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
