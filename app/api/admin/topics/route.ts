import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import Course from '@/models/Course';
import { adminAuth } from '@/lib/firebase-admin';

// GET - Get all topics
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    await connectDB();
    
    // Get user and check admin
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Build query
    const query: any = {};
    if (courseId) {
      query.courseId = courseId;
    }

    // Fetch topics with course info
    const topics = await Topic.find(query)
      .populate('courseId', 'title level')
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ 
      topics,
      total: topics.length 
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

// POST - Create new topic
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    await connectDB();
    
    // Get user and check admin
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, courseId, icon, order, xpReward, color, estimatedMinutes, isLocked } = body;

    // Validate required fields
    if (!title || !courseId) {
      return NextResponse.json(
        { error: 'Title and course are required' },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create topic
    const topic = await Topic.create({
      title,
      description,
      courseId,
      icon: icon || '📚',
      order: order || 1,
      xpReward: xpReward || 50,
      color: color || '#3B82F6',
      estimatedMinutes: estimatedMinutes || 45,
      isLocked: isLocked ?? false,
      isPublished: true,
      totalLessons: 0
    });

    // Populate course info
    await topic.populate('courseId', 'title level');

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}

// PATCH - Update topic
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    await connectDB();
    
    // Get user and check admin
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Update topic
    const topic = await Topic.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('courseId', 'title level');

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

// DELETE - Delete topic
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    await connectDB();
    
    // Get user and check admin
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Check if topic has lessons
    const Lesson = (await import('@/models/Lesson')).default;
    const lessonCount = await Lesson.countDocuments({ topicId: id });
    
    if (lessonCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete topic with ${lessonCount} lesson(s). Please delete all lessons first.` },
        { status: 400 }
      );
    }

    // Delete topic
    const topic = await Topic.findByIdAndDelete(id);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Topic deleted successfully',
      deletedTopic: topic 
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
