import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import Exercise from '@/models/Exercise';

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
      .limit(100)
      .lean();
    
    // Count actual exercises for each topic
    const topicsWithCounts = await Promise.all(
      topics.map(async (topic) => {
        const exerciseCount = await Exercise.countDocuments({ topicId: topic._id });
        return {
          ...topic,
          totalLessons: exerciseCount
        };
      })
    );
    
    return NextResponse.json({ topics: topicsWithCounts });
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
