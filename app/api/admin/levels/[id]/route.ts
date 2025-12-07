import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Level from '@/models/Level';

// PUT - Cập nhật cấp độ
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await req.json();
    const { name, displayName, description, color, isActive } = body;

    const level = await Level.findById(id);
    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    // Nếu thay đổi tên level, kiểm tra trùng lặp
    if (name && name !== level.name) {
      const existingLevel = await Level.findOne({ name: name.toLowerCase().trim(), _id: { $ne: id } });
      if (existingLevel) {
        return NextResponse.json({ error: 'Level name already exists' }, { status: 400 });
      }
      level.name = name.toLowerCase().trim();
    }

    // Cập nhật các trường khác
    if (displayName) level.displayName = displayName;
    if (description !== undefined) level.description = description;
    if (color) level.color = color;
    if (isActive !== undefined) level.isActive = isActive;

    await level.save();

    // Lấy số lượng courses
    const courseCount = await Course.countDocuments({ level: level._id });

    return NextResponse.json({ 
      message: 'Level updated successfully', 
      level: {
        _id: level._id,
        name: level.name,
        displayName: level.displayName,
        description: level.description,
        color: level.color,
        isActive: level.isActive,
        createdAt: level.createdAt,
        courseCount
      }
    });

  } catch (error) {
    console.error('Update level error:', error);
    return NextResponse.json({ error: 'Failed to update level' }, { status: 500 });
  }
}

// DELETE - Xóa cấp độ
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const level = await Level.findById(id);
    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    // Kiểm tra xem còn khóa học nào sử dụng level này không
    const courseCount = await Course.countDocuments({ level: id });
    if (courseCount > 0) {
      return NextResponse.json({ 
        error: `Không thể xóa cấp độ. Hiện có ${courseCount} khóa học đang sử dụng cấp độ này. Vui lòng xóa hoặc chuyển các khóa học sang cấp độ khác trước.`,
        courseCount
      }, { status: 400 });
    }

    await Level.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: 'Level deleted successfully' 
    });

  } catch (error) {
    console.error('Delete level error:', error);
    return NextResponse.json({ error: 'Failed to delete level' }, { status: 500 });
  }
}
