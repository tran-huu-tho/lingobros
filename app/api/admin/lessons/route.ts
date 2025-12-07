import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Lesson from '@/models/Lesson';
import Topic from '@/models/Topic';

// GET - Lấy danh sách bài học
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    await connectDB();
    
    const adminUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');

    let query = {};
    if (topicId) {
      query = { topicId };
    }

    const lessons = await Lesson.find(query)
      .populate('topicId', 'title courseId')
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Get lessons error:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

// POST - Tạo bài học mới
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    await connectDB();
    
    const adminUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { topicId, title, description, type, order, xpReward, difficulty, estimatedMinutes, isPublished } = body;

    if (!topicId || !title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Kiểm tra topic tồn tại
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Tạo lesson
    const lesson = await Lesson.create({
      topicId,
      title,
      description: description || '',
      type,
      order: order || 1,
      xpReward: xpReward || 10,
      difficulty: difficulty || 'medium',
      estimatedMinutes: estimatedMinutes || 15,
      isPublished: isPublished !== undefined ? isPublished : true,
      content: {
        introduction: '',
        vocabulary: [],
        grammarPoints: [],
        tips: []
      }
    });

    // Cập nhật totalLessons trong topic
    await Topic.findByIdAndUpdate(topicId, {
      $inc: { totalLessons: 1 }
    });

    const populatedLesson = await Lesson.findById(lesson._id)
      .populate('topicId', 'title courseId');

    return NextResponse.json({ lesson: populatedLesson }, { status: 201 });
  } catch (error) {
    console.error('Create lesson error:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}

// PATCH - Cập nhật bài học
export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    await connectDB();
    
    const adminUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    const lesson = await Lesson.findByIdAndUpdate(_id, updateData, { new: true })
      .populate('topicId', 'title courseId');

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

// DELETE - Xóa bài học
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    await connectDB();
    
    const adminUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('id');

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Cập nhật totalLessons trong topic
    await Topic.findByIdAndUpdate(lesson.topicId, {
      $inc: { totalLessons: -1 }
    });

    await Lesson.findByIdAndDelete(lessonId);

    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
