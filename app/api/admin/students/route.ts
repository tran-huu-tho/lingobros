import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await connectDB();
    
    // Check if user is admin
    const adminUser = await User.findOne({ firebaseUid });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all students (isAdmin = false)
    const students = await User.find({ isAdmin: { $ne: true } })
      .select('displayName photoURL xp streak level preferences createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Format student data
    const formattedStudents = students.map((student: any) => ({
      _id: student._id.toString(),
      displayName: student.displayName || 'N/A',
      photoURL: student.photoURL,
      xp: student.xp || 0,
      streak: student.streak || 0,
      level: student.level || 'beginner',
      studyTime: student.preferences?.dailyGoalMinutes || 0, // Lấy từ preferences
      learningGoal: student.preferences?.learningGoal || 'Chưa đặt mục tiêu', // Lấy từ preferences
      createdAt: student.createdAt
    }));

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
