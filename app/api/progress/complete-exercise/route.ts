import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserProgress from '@/models/UserProgress';
import Topic from '@/models/Topic';
import mongoose from 'mongoose';
import { calculateLevel, deductHeart, calculateHearts } from '@/lib/user-progression';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    await connectDB();

    const { 
      topicId, 
      exerciseId, 
      isCorrect, 
      timeSpent,
      exerciseType
    } = await req.json();
    
    console.log('📝 Complete exercise API called:', { topicId, exerciseId, isCorrect, timeSpent, exerciseType });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      console.error('❌ Invalid topicId format:', topicId);
      return NextResponse.json({ error: 'Invalid topicId' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
      console.error('❌ Invalid exerciseId format:', exerciseId);
      return NextResponse.json({ error: 'Invalid exerciseId' }, { status: 400 });
    }

    // Tìm user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      console.error('❌ User not found:', firebaseUid);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('✅ User found:', user.email);

    // Regenerate hearts if needed
    const heartRegen = calculateHearts(user.hearts || 50, user.lastHeartUpdate || new Date());
    if (heartRegen.hearts !== user.hearts) {
      user.hearts = heartRegen.hearts;
      user.lastHeartUpdate = heartRegen.lastUpdate;
      console.log('❤️ Hearts regenerated:', user.hearts);
    }

    // Check if user has hearts - if not, prevent from continuing
    if (user.hearts <= 0) {
      console.log('❌ No hearts remaining!');
      return NextResponse.json(
        { 
          error: 'No hearts remaining',
          hearts: 0,
          minutesUntilNextHeart: heartRegen.minutesUntilNext
        },
        { status: 403 }
      );
    }

    // XP thưởng
    const xpReward = isCorrect ? 50 : 0;
    
    // Trừ heart nếu làm sai
    let heartDeducted = false;
    if (!isCorrect) {
      const heartResult = deductHeart(user.hearts || 50);
      user.hearts = heartResult.hearts;
      user.lastHeartUpdate = new Date(); // Reset timer when heart is lost
      heartDeducted = true;
      console.log('💔 Heart deducted:', user.hearts, 'remaining');
      
      if (!heartResult.canContinue) {
        console.log('❌ Out of hearts!');
      }
    }
    
    // Kiểm tra topic đã hoàn thành chưa trước khi tặng XP
    const existingProgress = await UserProgress.findOne({
      userId: user._id,
      topicId
    });
    
    const topicAlreadyCompleted = existingProgress && existingProgress.status === 'completed';
    
    // Cập nhật XP và Level cho user (chỉ khi chưa hoàn thành topic)
    if (isCorrect && !topicAlreadyCompleted) {
      user.xp = (user.xp || 0) + xpReward;
      
      // Auto update level based on XP
      const { levelName } = calculateLevel(user.xp);
      user.level = levelName;
      
      console.log('💰 XP updated:', user.xp, '| Level:', levelName);
    }
    
    // Track study time (always update, even if topic completed)
    if (timeSpent && timeSpent > 0) {
      user.studyTime = (user.studyTime || 0) + timeSpent; // Store in seconds
      console.log('⏱️ Study time updated:', user.studyTime, 'seconds (+', timeSpent, 's)');
    }
    
    // Save user changes (XP, hearts, level, studyTime)
    await user.save();

    // Validate ObjectIds
    console.log('🔍 Validating IDs...', { 
      userId: user._id, 
      userIdType: typeof user._id,
      topicId, 
      topicIdType: typeof topicId,
      exerciseId,
      exerciseIdType: typeof exerciseId
    });

    // Tìm hoặc tạo progress
    console.log('🔍 Finding progress...', { userId: user._id.toString(), topicId });
    let progress = await UserProgress.findOne({
      userId: user._id,
      topicId
    });

    console.log('📊 Existing progress:', progress ? {
      id: progress._id,
      status: progress.status,
      resultsCount: progress.exerciseResults?.length || 0
    } : 'null');

    // Kiểm tra xem topic đã hoàn thành chưa
    const isAlreadyCompleted = progress && progress.status === 'completed';

    if (!progress) {
      console.log('➕ Creating new progress document...');
      try {
        progress = new UserProgress({
          userId: user._id,
          topicId,
          status: 'in-progress',
          exerciseResults: [],
          score: 0,
          timeSpent: 0,
          exercisesCompleted: 0,
          startedAt: new Date()
        });
        console.log('✅ Progress document created (not saved yet)');
      } catch (createError) {
        console.error('❌ Error creating progress document:', createError);
        throw createError;
      }
    }
    
    console.log('📊 Progress status:', progress.status);

    // Thêm kết quả exercise
    const existingResultIndex = progress.exerciseResults.findIndex(
      (r: any) => r.exerciseId.toString() === exerciseId
    );

    if (existingResultIndex >= 0) {
      // Cập nhật nếu đã tồn tại
      progress.exerciseResults[existingResultIndex].isCorrect = isCorrect;
      progress.exerciseResults[existingResultIndex].timeSpent = timeSpent;
      progress.exerciseResults[existingResultIndex].attempts += 1;
    } else {
      // Thêm mới
      progress.exerciseResults.push({
        exerciseId,
        isCorrect,
        timeSpent,
        attempts: 1,
        score: isCorrect ? 50 : 0
      });
    }

    // Fetch topic to get total exercises count
    const topic = await Topic.findById(topicId);
    if (!topic) {
      console.error('❌ Topic not found:', topicId);
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Count total exercises in this topic
    const Exercise = mongoose.model('Exercise');
    const totalExercises = await Exercise.countDocuments({ topicId });
    console.log('📊 Total exercises in topic:', totalExercises);

    // Cập nhật tổng điểm và thời gian
    progress.score = progress.exerciseResults.reduce(
      (sum: number, r: any) => sum + (r.isCorrect ? 50 : 0), 
      0
    );
    progress.timeSpent = (progress.timeSpent || 0) + timeSpent;
    progress.exercisesCompleted = progress.exerciseResults.filter(
      (r: any) => r.isCorrect
    ).length;
    progress.lastAccessedAt = new Date();

    // Check if all exercises are completed
    if (progress.exercisesCompleted >= totalExercises && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();
      console.log('🎉 Topic completed!');
    }

    console.log('💾 About to save progress...', {
      score: progress.score,
      exercisesCompleted: progress.exercisesCompleted,
      resultsCount: progress.exerciseResults.length,
      userId: progress.userId,
      topicId: progress.topicId,
      status: progress.status
    });
    
    // Validate before saving
    try {
      const validationError = progress.validateSync();
      if (validationError) {
        console.error('❌ Validation error:', validationError);
        return NextResponse.json(
          { error: 'Validation failed', details: validationError.message },
          { status: 400 }
        );
      }
    } catch (valError) {
      console.error('❌ Validation check failed:', valError);
    }
    
    try {
      await progress.save();
      console.log('✅ Progress saved successfully');
    } catch (saveError) {
      console.error('💥 Error saving to database:', saveError);
      console.error('Error name:', saveError instanceof Error ? saveError.name : 'Unknown');
      console.error('Error message:', saveError instanceof Error ? saveError.message : 'Unknown');
      console.error('Error stack:', saveError instanceof Error ? saveError.stack : 'Unknown');
      throw saveError;
    }

    // Chỉ tặng XP nếu topic chưa hoàn thành (lần đầu làm)
    const actualXpReward = !isAlreadyCompleted && isCorrect ? xpReward : 0;
    
    // Get heart regen info for response
    const currentHeartInfo = calculateHearts(user.hearts, user.lastHeartUpdate || new Date());

    return NextResponse.json({
      success: true,
      xpReward: actualXpReward,
      heartDeducted,
      hearts: user.hearts,
      minutesUntilNextHeart: currentHeartInfo.minutesUntilNext,
      totalXP: user.xp,
      level: user.level,
      progress: {
        score: progress.score,
        exercisesCompleted: progress.exercisesCompleted
      }
    });
  } catch (error) {
    console.error('💥 Complete exercise error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to save progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
