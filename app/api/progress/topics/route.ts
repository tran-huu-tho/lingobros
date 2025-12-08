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

    // Find user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all topic progress for this user
    const topicProgress = await UserProgress.find({ 
      userId: user._id,
      topicId: { $exists: true, $ne: null }
    })
    .populate('topicId', 'title icon')
    .select('topicId status score completedAt lastActivityAt')
    .sort({ lastActivityAt: -1 });

    // Format response
    const progress = topicProgress.map(p => ({
      topicId: p.topicId?._id?.toString() || '',
      topicTitle: (p.topicId as any)?.title || '',
      topicIcon: (p.topicId as any)?.icon || '',
      completed: p.status === 'completed',
      score: p.score || 0,
      completedAt: p.completedAt,
      lastActivityAt: p.lastActivityAt
    }));

    return NextResponse.json({ 
      success: true,
      progress 
    });

  } catch (error) {
    console.error('Get topic progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
