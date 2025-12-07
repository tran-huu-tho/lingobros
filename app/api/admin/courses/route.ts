import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Topic from '@/models/Topic';

// GET - Lấy danh sách khóa học
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

    const courses = await Course.find()
      .populate('level', 'name displayName description color')
      .sort({ createdAt: -1 })
      .lean();
    
    // Đếm số topics cho mỗi course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const topicCount = await Topic.countDocuments({ courseId: course._id });
        return {
          ...course,
          _id: course._id.toString(),
          totalTopics: topicCount
        };
      })
    );

    return NextResponse.json({ courses: coursesWithStats });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST - Tạo khóa học mới
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
    
    // Tạo slug từ title
    const slug = body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const courseDoc = await Course.create({
      ...body,
      slug,
      totalTopics: 0,
      totalLessons: 0
    });

    // Populate level trước khi trả về
    const course = await Course.findById(courseDoc._id)
      .populate('level', 'name displayName description color');

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}

// PATCH - Cập nhật khóa học
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

    // Cập nhật slug nếu title thay đổi
    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }

    const course = await Course.findByIdAndUpdate(_id, updateData, { new: true })
      .populate('level', 'name displayName description color');

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE - Xóa khóa học
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
    const courseId = searchParams.get('id');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    // Đếm số topics để thông báo (nhưng KHÔNG xóa)
    const topicCount = await Topic.countDocuments({ courseId });

    // Chỉ xóa khóa học, GIỮ LẠI các topics
    // (Topics có thể thuộc nhiều khóa học hoặc dùng lại sau)
    await Course.findByIdAndDelete(courseId);

    return NextResponse.json({ 
      success: true,
      message: `Đã xóa khóa học. ${topicCount} chuyên đề vẫn được giữ lại.`
    });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
