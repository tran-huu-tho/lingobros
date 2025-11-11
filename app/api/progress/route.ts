import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import UserProgress from '@/models/UserProgress';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await connectDB();
    
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { courseId, unitId, lessonId, status, score } = await req.json();

    // Find or create progress
    let progress = await UserProgress.findOne({
      userId: user._id,
      lessonId
    });

    if (progress) {
      progress.status = status;
      progress.score = score;
      progress.attemptsCount += 1;
      
      if (status === 'completed') {
        progress.completedAt = new Date();
        
        // Award XP to user
        const xpGain = score || 10;
        user.xp += xpGain;
        await user.save();
      }
      
      await progress.save();
    } else {
      progress = await UserProgress.create({
        userId: user._id,
        courseId,
        unitId,
        lessonId,
        status,
        score,
        attemptsCount: 1,
        completedAt: status === 'completed' ? new Date() : undefined
      });

      if (status === 'completed') {
        const xpGain = score || 10;
        user.xp += xpGain;
        await user.save();
      }
    }

    return NextResponse.json({ progress, user });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await connectDB();
    
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    const query: any = { userId: user._id };
    if (courseId) {
      query.courseId = courseId;
    }

    const progress = await UserProgress.find(query);

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
