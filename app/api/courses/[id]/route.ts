import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Unit from '@/models/Unit';
import Lesson from '@/models/Lesson';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const course = await Course.findById(id);
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Get all units for this course
    const units = await Unit.find({ courseId: id }).sort({ order: 1 });
    
    // Get lessons for each unit
    const unitsWithLessons = await Promise.all(
      units.map(async (unit) => {
        const lessons = await Lesson.find({ unitId: unit._id }).sort({ order: 1 });
        return {
          ...unit.toObject(),
          lessons
        };
      })
    );
    
    return NextResponse.json({ 
      course: {
        ...course.toObject(),
        units: unitsWithLessons
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Failed to get course' },
      { status: 500 }
    );
  }
}
