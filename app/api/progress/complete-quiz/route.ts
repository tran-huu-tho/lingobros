import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import UserProgress from '@/models/UserProgress';

interface Answer {
  exerciseId: string;
  answer: string;
  isCorrect: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const { quizId, answers, score, timeSpent, passed } = await req.json();

    if (!quizId || !answers || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Calculate XP reward based on score
    let xpReward = 0;
    if (passed) {
      // Base XP: 50 points
      // Bonus for high scores
      xpReward = 50;
      if (score >= 90) {
        xpReward += 30; // Perfect/near perfect
      } else if (score >= 80) {
        xpReward += 20;
      } else if (score >= quiz.passingScore) {
        xpReward += 10;
      }
    }

    // Find or create user progress
    let progress = await UserProgress.findOne({
      userId: user._id,
      quizId: quiz._id
    });

    if (progress) {
      // Update existing progress
      progress.status = 'completed';
      progress.score = Math.max(progress.score || 0, score); // Keep highest score
      progress.attemptsCount = (progress.attemptsCount || 0) + 1;
      progress.completedAt = new Date();
      progress.timeSpent = (progress.timeSpent || 0) + (timeSpent || 0);
      progress.exerciseResults = answers.map((a: Answer) => ({
        exerciseId: a.exerciseId,
        isCorrect: a.isCorrect,
        score: a.isCorrect ? 100 : 0,
        timeSpent: 0,
        attempts: 1
      }));
    } else {
      // Create new progress
      progress = new UserProgress({
        userId: user._id,
        quizId: quiz._id,
        topicId: quiz.topicId,
        status: 'completed',
        score: score,
        attemptsCount: 1,
        timeSpent: timeSpent || 0,
        completedAt: new Date(),
        startedAt: new Date(),
        exerciseResults: answers.map((a: Answer) => ({
          exerciseId: a.exerciseId,
          isCorrect: a.isCorrect,
          score: a.isCorrect ? 100 : 0,
          timeSpent: 0,
          attempts: 1
        }))
      });
    }

    await progress.save();

    // Award XP only if this is their best score or first time passing
    const shouldAwardXP = !progress.attemptsCount || progress.attemptsCount === 1 || 
                          (passed && score > (progress.score || 0));
    
    if (shouldAwardXP && xpReward > 0) {
      user.xp = (user.xp || 0) + xpReward;
      await user.save();
    }

    return NextResponse.json({ 
      success: true,
      score,
      passed,
      xpEarned: shouldAwardXP ? xpReward : 0,
      message: passed ? 'Chúc mừng! Bạn đã đạt!' : 'Hãy cố gắng hơn lần sau!'
    });

  } catch (error) {
    console.error('Complete quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz results' },
      { status: 500 }
    );
  }
}
