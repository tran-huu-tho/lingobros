import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    
    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to get lesson' },
      { status: 500 }
    );
  }
}
