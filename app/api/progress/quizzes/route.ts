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

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get quiz progress (UserProgress with quizId field)
    const quizProgress = await UserProgress.find({ 
      userId: user._id,
      quizId: { $exists: true, $ne: null }
    })
    .populate('quizId', 'title')
    .select('quizId status score completedAt lastActivityAt')
    .sort({ lastActivityAt: -1 });

    const progress = quizProgress.map(p => ({
      quizId: p.quizId?._id?.toString() || '',
      quizTitle: (p.quizId as any)?.title || '',
      completed: p.status === 'completed',
      score: p.score || 0,
      passed: p.score >= 70, // Default passing score
      completedAt: p.completedAt,
      lastActivityAt: p.lastActivityAt
    }));

    return NextResponse.json({ 
      success: true,
      progress 
    });

  } catch (error) {
    console.error('Get quiz progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
