import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import LearningPath from '@/models/LearningPath';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    await connectDB();

    const paths = await LearningPath.find()
      .populate('topics.topicId')
      .sort({ createdAt: -1 });

    return NextResponse.json(paths);
  } catch (error) {
    console.error('Get learning paths error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning paths' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    await connectDB();

    const body = await req.json();
    console.log('Creating learning path with data:', JSON.stringify(body, null, 2));
    
    const path = await LearningPath.create(body);
    const populatedPath = await LearningPath.findById(path._id).populate('topics.topicId');

    return NextResponse.json(populatedPath, { status: 201 });
  } catch (error: any) {
    console.error('Create learning path error:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    return NextResponse.json({ 
      error: 'Failed to create learning path',
      details: error.message,
      validation: error.errors 
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    await connectDB();

    const body = await req.json();
    const { id, ...updateData } = body;

    const path = await LearningPath.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('topics.topicId');

    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error('Update learning path error:', error);
    return NextResponse.json({ error: 'Failed to update learning path' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Learning path ID required' }, { status: 400 });
    }

    const path = await LearningPath.findByIdAndDelete(id);

    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    console.error('Delete learning path error:', error);
    return NextResponse.json({ error: 'Failed to delete learning path' }, { status: 500 });
  }
}
