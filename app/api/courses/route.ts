import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Level from '@/models/Level';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const levelParam = searchParams.get('level');
    
    const query: any = { isPublished: true };
    
    // Nếu có filter theo level, tìm level ID
    if (levelParam) {
      const level = await Level.findOne({ name: levelParam });
      if (level) {
        query.level = level._id;
      }
    }
    
    const courses = await Course.find(query)
      .populate('level', 'name displayName color icon')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Failed to get courses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const courseData = await req.json();
    
    const course = await Course.create(courseData);
    
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
