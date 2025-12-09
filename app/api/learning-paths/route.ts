import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import LearningPath from '@/models/LearningPath';
import Topic from '@/models/Topic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const purpose = searchParams.get('purpose');

    if (!purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 });
    }

    // Find all active learning paths matching the purpose
    const paths = await LearningPath.find({
      purpose: purpose,
      isActive: true
    }).populate('topics.topicId').sort({ order: 1 });

    return NextResponse.json(paths);
  } catch (error) {
    console.error('Get learning path error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning path' }, { status: 500 });
  }
}
