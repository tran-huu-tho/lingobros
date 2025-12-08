import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserProgress from '@/models/UserProgress';
import Topic from '@/models/Topic';
import { calculateLevel } from '@/lib/user-progression';

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

    const { topicId, courseId } = await req.json();
    
    console.log('📍 Complete topic API called:', { topicId, courseId, firebaseUid });

    // Tìm user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      console.error('❌ User not found:', firebaseUid);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('✅ User found:', user.email);

    // Tìm topic
    const topic = await Topic.findById(topicId);
    if (!topic) {
      console.error('❌ Topic not found:', topicId);
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    console.log('✅ Topic found:', topic.title);

    // Kiểm tra xem topic đã hoàn thành trước đó chưa
    const existingProgress = await UserProgress.findOne({
      userId: user._id,
      topicId
    });
    
    const wasAlreadyCompleted = existingProgress && existingProgress.status === 'completed';

    // Thưởng 500 XP khi hoàn thành topic (chỉ lần đầu)
    const bonusXP = wasAlreadyCompleted ? 0 : 500;
    
    if (!wasAlreadyCompleted) {
      user.xp = (user.xp || 0) + bonusXP;
      
      // Auto update level
      const { levelName } = calculateLevel(user.xp);
      user.level = levelName;
      
      await user.save();
      console.log('🎉 Bonus awarded! XP:', bonusXP, 'Level:', levelName);
    }

    // Cập nhật progress
    console.log('💾 Updating progress...');
    const progress = await UserProgress.findOneAndUpdate(
      { userId: user._id, topicId },
      {
        status: 'completed',
        completedAt: new Date(),
        lastAccessedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    console.log('✅ Progress updated:', progress.status);

    // Unlock topic tiếp theo trong cùng course
    console.log('🔓 Looking for next topic...', { courseId: topic.courseId, currentOrder: topic.order });
    const nextTopic = await Topic.findOne({
      courseId: topic.courseId,
      order: topic.order + 1
    });

    if (nextTopic) {
      console.log('📌 Next topic found:', nextTopic.title, 'isLocked:', nextTopic.isLocked);
      if (nextTopic.isLocked) {
        nextTopic.isLocked = false;
        await nextTopic.save();
        console.log('🔓 Unlocked next topic:', nextTopic.title);
      }
    } else {
      console.log('ℹ️ No next topic found (end of course)');
    }

    return NextResponse.json({
      success: true,
      bonusXP,
      totalXP: user.xp,
      level: user.level,
      progress,
      nextTopic: nextTopic ? {
        _id: nextTopic._id,
        title: nextTopic.title,
        icon: nextTopic.icon
      } : null
    });
  } catch (error) {
    console.error('Complete topic error:', error);
    return NextResponse.json(
      { error: 'Failed to complete topic' },
      { status: 500 }
    );
  }
}
