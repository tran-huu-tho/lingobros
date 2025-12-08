'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, Lock, CheckCircle2, Play, Trophy, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Topic {
  _id: string;
  title: string;
  description?: string;
  icon?: string;
  color: string;
  xpReward: number;
  totalLessons: number;
  estimatedMinutes: number;
  isLocked: boolean;
  isPublished: boolean;
  courseId?: {
    _id: string;
    title: string;
  };
}

interface TopicProgress {
  topicId: string;
  completed: boolean;
  score: number;
  completedAt?: Date;
}

export default function TopicsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, TopicProgress>>({});
  const [displayCount, setDisplayCount] = useState(6); // Hiển thị 6 topics ban đầu
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
    
    if (user) {
      fetchTopics();
      fetchUserProgress();
    }
  }, [user, loading]);

  const fetchTopics = async () => {
    try {
      const token = await user!.getIdToken();
      const response = await fetch('/api/topics?published=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      } else {
        toast.error('Không thể tải danh sách chuyên đề');
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setLoadingTopics(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const token = await user!.getIdToken();
      const response = await fetch('/api/progress/topics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert array to map for easy lookup
        const progressMap: Record<string, TopicProgress> = {};
        data.progress?.forEach((p: TopicProgress) => {
          progressMap[p.topicId] = p;
        });
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6);
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || topic.courseId?._id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const displayedTopics = filteredTopics.slice(0, displayCount);
  const hasMore = displayCount < filteredTopics.length;

  // Get unique courses for filter
  const uniqueCourseIds = new Set<string>();
  const courses = topics
    .map(t => t.courseId)
    .filter(Boolean)
    .filter(course => {
      if (uniqueCourseIds.has(course._id)) {
        return false;
      }
      uniqueCourseIds.add(course._id);
      return true;
    });

  if (loading || loadingTopics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-7 h-7 text-blue-400" />
                  Chuyên đề
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Khám phá và luyện tập theo từng chủ đề
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700 px-4 py-2 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-white">{userData?.xp || 0}</span>
                </div>
                <div className="w-px h-6 bg-gray-600"></div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-white">
                    {Object.values(userProgress).filter(p => p.completed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm chuyên đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {courses.length > 1 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả khóa học</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tổng chuyên đề</p>
                <p className="text-2xl font-bold text-white">{topics.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(userProgress).filter(p => p.completed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-bold text-white">
                  {topics.length > 0 
                    ? Math.round((Object.values(userProgress).filter(p => p.completed).length / topics.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        {displayedTopics.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Không tìm thấy chuyên đề
            </h3>
            <p className="text-gray-400">
              Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTopics.map((topic) => {
                const progress = userProgress[topic._id];
                const isCompleted = progress?.completed || false;

                return (
                  <Link
                    key={topic._id}
                    href={`/topic/${topic._id}`}
                    className="group relative bg-gray-800/50 border border-gray-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden hover:scale-105"
                  >
                    {/* Color bar */}
                    <div 
                      className="h-2 w-full"
                      style={{ background: topic.color || '#3B82F6' }}
                    />

                    {/* Content */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="text-4xl p-3 rounded-xl"
                            style={{ backgroundColor: `${topic.color}15` }}
                          >
                            {topic.icon || '📚'}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                              {topic.title}
                            </h3>
                            {topic.courseId && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {topic.courseId.title}
                              </p>
                            )}
                          </div>
                        </div>

                        {isCompleted && (
                          <div className="bg-green-500/20 p-2 rounded-full border border-green-500/30">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {topic.description && (
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {topic.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>{topic.totalLessons || 0} bài</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span>+{topic.xpReward} XP</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                          isCompleted
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Ôn tập lại
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Bắt đầu học
                          </>
                        )}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-4 bg-gray-800/50 border border-gray-700 text-blue-400 font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all flex items-center gap-2 mx-auto group"
                >
                  Xem thêm {filteredTopics.length - displayCount} chuyên đề
                  <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
