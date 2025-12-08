import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import Lesson from '@/models/Lesson';
import Exercise from '@/models/Exercise';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    await connectDB();

    const { id: topicId } = await params;

    // Get topic details
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Get all lessons for this topic
    const lessons = await Lesson.find({ topicId })
      .sort({ order: 1 })
      .lean();

    // Get all exercises for this topic
    const exercises = await Exercise.find({ topicId })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      topic,
      lessons,
      exercises
    });
  } catch (error) {
    console.error('Get topic content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic content' },
      { status: 500 }
    );
  }
}
