'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, Lock, CheckCircle2, Play, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description?: string;
  level?: {
    _id: string;
    name: string;
    displayName: string;
    color: string;
    icon?: string;
  };
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  topics?: Array<{
    _id: string;
    title: string;
    description?: string;
    icon?: string;
    order: number;
    slug?: string;
  }>;
}

interface Progress {
  topicId: string;
  status: string;
  score?: number;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    fetchCourseData();
  }, [user, params.id]);

  const fetchCourseData = async () => {
    try {
      const token = await user?.getIdToken();
      
      // Fetch course details
      const courseRes = await fetch(`/api/courses/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData);
      }

      // Fetch user progress
      const progressRes = await fetch('/api/progress/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(Object.entries(progressData.progressMap || {}).map(([topicId, data]: any) => ({
          topicId,
          ...data
        })));
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Không tìm thấy khóa học</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const getTopicProgress = (topicId: string) => {
    return progress.find(p => p.topicId === topicId);
  };

  const completedCount = course.topics?.filter(t => {
    const prog = getTopicProgress(t._id);
    return prog && prog.status === 'completed';
  }).length || 0;

  const totalTopics = course.topics?.length || 0;
  const progressPercentage = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              {course.level && (
                <span 
                  className="inline-block text-xs px-2 py-1 rounded-full font-medium mt-1"
                  style={{ 
                    backgroundColor: course.level.color + '30',
                    color: course.level.color,
                    border: `1px solid ${course.level.color}50`
                  }}
                >
                  {course.level.icon} {course.level.displayName}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Course Banner */}
        <div 
          className="w-full h-64 rounded-2xl mb-8 flex items-center justify-center text-center p-8"
          style={{
            background: course.gradientFrom && course.gradientTo 
              ? `linear-gradient(135deg, ${course.gradientFrom}, ${course.gradientTo})`
              : course.color || '#3B82F6'
          }}
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">{course.title}</h1>
            {course.description && (
              <p className="text-white/90 text-lg max-w-2xl">{course.description}</p>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Tiến độ học tập</h2>
            <span className="text-2xl font-bold text-blue-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-400">
            {completedCount} / {totalTopics} chủ đề đã hoàn thành
          </p>
        </div>

        {/* Topics List */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Nội dung khóa học
          </h2>

          {course.topics && course.topics.length > 0 ? (
            <div className="space-y-3">
              {course.topics
                .sort((a, b) => a.order - b.order)
                .map((topic, index) => {
                  const topicProgress = getTopicProgress(topic._id);
                  const isCompleted = topicProgress?.status === 'completed';
                  const isInProgress = topicProgress?.status === 'in-progress';
                  const isLocked = index > 0 && !getTopicProgress(course.topics![index - 1]._id);

                  return (
                    <Link
                      key={topic._id}
                      href={isLocked ? '#' : `/topic/${topic._id}`}
                      className={`block p-4 rounded-xl border transition group ${
                        isLocked
                          ? 'bg-gray-800/30 border-gray-700/50 cursor-not-allowed opacity-50'
                          : isCompleted
                          ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                          : isInProgress
                          ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
                          : 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon/Status */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          isLocked
                            ? 'bg-gray-700'
                            : isCompleted
                            ? 'bg-green-500/20'
                            : isInProgress
                            ? 'bg-blue-500/20'
                            : 'bg-gray-700'
                        }`}>
                          {isLocked ? (
                            <Lock className="w-6 h-6 text-gray-500" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : isInProgress ? (
                            <Play className="w-6 h-6 text-blue-400" />
                          ) : (
                            topic.icon || '📚'
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-500">
                              Chủ đề {topic.order}
                            </span>
                          </div>
                          <h3 className={`font-bold mb-1 ${
                            isLocked ? 'text-gray-500' : 'text-white group-hover:text-blue-400'
                          }`}>
                            {topic.title}
                          </h3>
                          {topic.description && (
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {topic.description}
                            </p>
                          )}
                          {!isLocked && topicProgress?.score !== undefined && (topicProgress.status === 'completed' || topicProgress.status === 'in-progress') && (
                            <p className="text-sm text-green-400 mt-1">
                              XP: {topicProgress.score}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        {!isLocked && (
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    </Link>
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Chưa có chủ đề nào trong khóa học này</p>
          )}
        </div>
      </main>
    </div>
  );
}
