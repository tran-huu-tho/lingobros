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

    // Find active learning path matching the purpose
    const path = await LearningPath.findOne({
      purpose: purpose,
      isActive: true
    }).populate('topics.topicId');

    if (!path) {
      return NextResponse.json(null);
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error('Get learning path error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning path' }, { status: 500 });
  }
}
