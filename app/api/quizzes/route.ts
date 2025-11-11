import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    const query: any = {};
    if (type) {
      query.type = type;
    }
    
    const quizzes = await Quiz.find(query);
    
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
    return NextResponse.json(
      { error: 'Failed to get quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const quizData = await req.json();
    
    const quiz = await Quiz.create(quizData);
    
    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error('Create quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
