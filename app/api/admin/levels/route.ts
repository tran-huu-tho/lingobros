import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Level from '@/models/Level';

// GET - Lấy danh sách cấp độ với số lượng khóa học
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

    // Lấy tất cả levels từ database
    const levels = await Level.find({}).sort({ createdAt: -1 });

    // Đếm số khóa học cho mỗi level
    const levelsWithCounts = await Promise.all(
      levels.map(async (level) => {
        const courseCount = await Course.countDocuments({ level: level._id });
        return {
          _id: level._id,
          name: level.name,
          displayName: level.displayName,
          description: level.description,
          color: level.color,
          isActive: level.isActive,
          createdAt: level.createdAt,
          courseCount
        };
      })
    );

    return NextResponse.json({ levels: levelsWithCounts });
  } catch (error) {
    console.error('Get levels error:', error);
    return NextResponse.json({ error: 'Failed to fetch levels' }, { status: 500 });
  }
}

// POST - Tạo cấp độ mới
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
    const { name, displayName, description, color } = body;

    if (!name || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Kiểm tra xem tên level đã tồn tại chưa
    const existingLevel = await Level.findOne({ name: name.toLowerCase().trim() });
    if (existingLevel) {
      return NextResponse.json({ error: 'Level name already exists' }, { status: 400 });
    }

    // Tạo level mới
    const newLevel = await Level.create({
      name: name.toLowerCase().trim(),
      displayName,
      description: description || '',
      color: color || '#3B82F6',
      isActive: true
    });

    return NextResponse.json({ 
      message: 'Level created successfully', 
      level: {
        _id: newLevel._id,
        name: newLevel.name,
        displayName: newLevel.displayName,
        description: newLevel.description,
        color: newLevel.color,
        isActive: newLevel.isActive,
        createdAt: newLevel.createdAt,
        courseCount: 0
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create level error:', error);
    return NextResponse.json({ error: 'Failed to create level' }, { status: 500 });
  }
}
