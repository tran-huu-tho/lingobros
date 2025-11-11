'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LessonPlayer } from '@/components/lesson/LessonPlayer';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [params.id]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${params.id}`);
      const data = await response.json();
      setLesson(data.lesson);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Không thể tải bài học');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (score: number) => {
    try {
      const token = await (user as any)?.getIdToken?.();
      
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: lesson.courseId,
          unitId: lesson.unitId,
          lessonId: lesson._id,
          status: 'completed',
          score
        })
      });

      if (response.ok) {
        toast.success(`🎉 Hoàn thành! Bạn nhận được ${lesson.xpReward} XP!`);
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Không tìm thấy bài học</p>
      </div>
    );
  }

  return <LessonPlayer lesson={lesson} onComplete={handleComplete} />;
}
