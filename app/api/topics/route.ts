import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const isPublished = searchParams.get('published');
    
    const query: any = {};
    
    if (isPublished === 'true') {
      query.isPublished = true;
    }
    
    const topics = await Topic.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(100);
    
    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Get topics error:', error);
    return NextResponse.json(
      { error: 'Failed to get topics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const topicData = await req.json();
    
    const topic = await Topic.create(topicData);
    
    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
