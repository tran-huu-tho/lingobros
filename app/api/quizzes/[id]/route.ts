import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import Exercise from '@/models/Exercise';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    await connectDB();

    const { id } = await params;
    const quiz = await Quiz.findById(id)
      .populate('topicId', 'title')
      .lean();

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Populate exercise details
    const populatedQuestions = await Promise.all(
      quiz.questions.map(async (q: any) => {
        const exercise = await Exercise.findById(q.exerciseId).lean();
        return {
          ...q,
          exerciseId: exercise
        };
      })
    );

    const populatedQuiz = {
      ...quiz,
      questions: populatedQuestions
    };

    return NextResponse.json({ 
      success: true,
      quiz: populatedQuiz
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to get quiz' },
      { status: 500 }
    );
  }
}
