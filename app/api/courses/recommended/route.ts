import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    await connectDB();

    if (!token) {
      // Guest mode - return all published courses
      const courses = await Course.find({ isPublished: true }).limit(10);
      return NextResponse.json({ 
        courses,
        isRecommended: false 
      });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recommended courses based on user preferences
    const learningPurpose = user.preferences?.learningGoal;
    const level = user.level || 'beginner';

    let query: any = { isPublished: true };

    // Filter by learning purpose if available
    if (learningPurpose) {
      query.categories = learningPurpose;
    }

    // Try to get courses matching purpose and level
    let courses = await Course.find(query).limit(10);

    // If no courses found with purpose, try with just level
    if (courses.length === 0 && learningPurpose) {
      query = { 
        isPublished: true,
        level: level 
      };
      courses = await Course.find(query).limit(10);
    }

    // If still no courses, get any published courses
    if (courses.length === 0) {
      courses = await Course.find({ isPublished: true }).limit(10);
    }

    return NextResponse.json({ 
      courses,
      isRecommended: !!learningPurpose,
      basedOn: {
        learningPurpose: learningPurpose || null,
        level: level
      }
    });
  } catch (error) {
    console.error('Get recommended courses error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommended courses' },
      { status: 500 }
    );
  }
}
