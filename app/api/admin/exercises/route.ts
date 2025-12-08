import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exercise from '@/models/Exercise';
import Topic from '@/models/Topic';
import { adminAuth } from '@/lib/firebase-admin';

// GET - Get all exercises
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    await connectDB();
    
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    const query: any = {};
    if (topicId) {
      query.topicId = topicId;
    }

    const exercises = await Exercise.find(query)
      .sort({ order: 1 })
      .lean();

    console.log(`✅ Found ${exercises.length} exercises`);

    // Manually populate topics
    const topicIds = [...new Set(exercises.map((e: any) => e.topicId.toString()))];
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const topicMap = new Map(topics.map((t: any) => [t._id.toString(), t]));

    const exercisesWithTopics = exercises.map((e: any) => ({
      ...e,
      topicId: topicMap.get(e.topicId.toString()) || e.topicId
    }));

    return NextResponse.json({ 
      exercises: exercisesWithTopics,
      total: exercisesWithTopics.length 
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST - Create new exercise
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    await connectDB();
    
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.topicId || !body.type || !body.question) {
      return NextResponse.json(
        { error: 'Topic, type and question are required' },
        { status: 400 }
      );
    }

    const topic = await Topic.findById(body.topicId);
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const exercise = await Exercise.create(body);
    await exercise.populate('topicId', 'title icon');

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}

// PATCH - Update exercise
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    await connectDB();
    
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 }
      );
    }

    const exercise = await Exercise.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('topicId', 'title icon');

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

// DELETE - Delete exercise
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    await connectDB();
    
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 }
      );
    }

    const exercise = await Exercise.findByIdAndDelete(id);

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}
