import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Topic from '@/models/Topic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const course = await Course.findById(id).populate('level');
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Get all topics for this course
    const topics = await Topic.find({ 
      courseId: id,
      isPublished: true 
    }).sort({ order: 1 });
    
    return NextResponse.json({
      _id: course._id,
      title: course.title,
      description: course.description,
      level: course.level ? {
        _id: course.level._id,
        name: course.level.name,
        displayName: course.level.displayName,
        color: course.level.color,
        icon: course.level.icon
      } : null,
      color: course.color,
      gradientFrom: course.gradientFrom,
      gradientTo: course.gradientTo,
      topics: topics.map(t => ({
        _id: t._id,
        title: t.title,
        description: t.description,
        icon: t.icon,
        order: t.order,
        slug: t.slug
      }))
    });
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Failed to get course' },
      { status: 500 }
    );
  }
}
