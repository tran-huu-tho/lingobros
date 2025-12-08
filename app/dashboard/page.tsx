'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { AIChatbot } from '@/components/ui/AIChatbot';
import OnboardingModal, { OnboardingData } from '@/components/onboarding/OnboardingModal';
import { BookOpen, Play, Trophy, TrendingUp, ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2, Target, Award, BookMarked, CheckCircle2, Lock, Flame, Heart, Gem, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface LearningPath {
  _id: string;
  title: string;
  description?: string;
  purpose: string;
  icon?: string;
  color: string;
  topics: Array<{
    topicId: {
      _id: string;
      title: string;
      icon?: string;
      description?: string;
    };
    order: number;
    isRequired: boolean;
  }>;
  isActive: boolean;
}

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
  thumbnail?: string;
  isPublished: boolean;
}

interface Topic {
  _id: string;
  title: string;
  icon?: string;
  description?: string;
  slug?: string;
  isPublished: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  topicId?: {
    _id: string;
    title: string;
  };
  questions: any[];
  duration?: number;
  passingScore?: number;
  isPublished: boolean;
}

export default function Dashboard() {
  const { user, userData, loading, signOut, refreshUserData } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  // Data states
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show onboarding modal for new users
  useEffect(() => {
    if (userData && userData.hasCompletedOnboarding === false) {
      setShowOnboardingModal(true);
    }
  }, [userData]);

  // Fetch user's learning path and related data
  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoadingData(false);
      return;
    }
    
    try {
      const token = await user.getIdToken();
      
      // Fetch all courses
      const coursesResponse = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }

      // Fetch all topics
      const topicsResponse = await fetch('/api/topics?published=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json();
        setTopics(topicsData.topics || []);
      }

      // Fetch all quizzes
      const quizzesResponse = await fetch('/api/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData.quizzes || []);
      }

      // Fetch learning path if user has completed onboarding
      if (userData?.preferences?.learningGoal) {
        // Map learningGoal to learning path purpose
        const goalToPurposeMap: Record<string, string> = {
          'communication': 'travel',
          'study-abroad': 'study-abroad',
          'exam': 'exam',
          'improvement': 'improvement',
          'other': 'other',
          'casual': 'travel',
          'regular': 'improvement',
          'serious': 'exam',
          'intense': 'exam'
        };
        
        const purpose = goalToPurposeMap[userData.preferences.learningGoal] || 'improvement';

        const pathResponse = await fetch(`/api/learning-paths?purpose=${purpose}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (pathResponse.ok) {
          const pathData = await pathResponse.json();
          setLearningPath(pathData);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user, userData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      await refreshUserData();
      setShowOnboardingModal(false);
      fetchDashboardData();
      toast.success('Hoàn thành thiết lập!');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL,
    level: 'beginner',
    xp: 0,
    streak: 0,
    hearts: 5,
    gems: 0
  };

  const userPhoto = userData?.photoURL || user?.photoURL;
  const optimizedPhoto = userPhoto?.includes('googleusercontent.com') && userPhoto?.includes('=s96-c')
    ? userPhoto.replace('=s96-c', '=s400-c')
    : userPhoto;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="text-4xl">☃️</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                LingoBros
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2 text-blue-400 font-semibold transition">
                <Home className="w-5 h-5" />
                Trang chủ
              </Link>
              <Link href="/leaderboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <BarChart3 className="w-5 h-5" />
                Bảng xếp hạng
              </Link>
              <Link href="/translate" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <Languages className="w-5 h-5" />
                Dịch thuật
              </Link>
              <Link href="/ipa" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <Volume2 className="w-5 h-5" />
                IPA
              </Link>
              <Link href="/forum" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <MessageSquare className="w-5 h-5" />
                Hỏi đáp
              </Link>
            </nav>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition group"
              >
                {optimizedPhoto ? (
                  <img 
                    src={optimizedPhoto} 
                    alt={displayData.displayName || 'User'}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {displayData.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-gray-100 font-semibold text-sm">{displayData.displayName}</span>
                  <span className="text-xs text-gray-500">Học viên</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 transition">
                    <User className="w-5 h-5" />
                    Hồ sơ
                  </Link>
                  <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition">
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{displayData.streak}</div>
                  <div className="text-xs text-gray-400">Chuỗi ngày</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{displayData.hearts}</div>
                  <div className="text-xs text-gray-400">Trái tim</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Gem className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{displayData.gems}</div>
                  <div className="text-xs text-gray-400">Gem</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{displayData.xp}</div>
                  <div className="text-xs text-gray-400">Kinh nghiệm</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white capitalize">{displayData.level}</div>
                  <div className="text-xs text-gray-400">Cấp độ</div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Learning Path Section */}
          {learningPath ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Target className="w-7 h-7 text-green-400" />
                  Lộ trình của bạn
                </h2>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
                    style={{ backgroundColor: learningPath.color + '30', border: `2px solid ${learningPath.color}` }}
                  >
                    {learningPath.icon || '🎯'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{learningPath.title}</h3>
                    <p className="text-gray-400">{learningPath.description || 'Lộ trình học được thiết kế riêng cho bạn'}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-green-400 flex items-center gap-1">
                        <BookMarked className="w-4 h-4" />
                        {learningPath.topics.length} chuyên đề
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {learningPath.topics.map((item, index) => {
                    const topic = item.topicId;
                    const isCompleted = false;
                    const isLocked = index > 0 && !isCompleted;

                    return (
                      <div
                        key={topic._id}
                        className={`bg-gray-900/50 border rounded-lg p-4 transition ${
                          isLocked ? 'border-gray-700/50 opacity-60' : 'border-gray-700 hover:border-green-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl border border-gray-700 shrink-0">
                            {isLocked ? <Lock className="w-5 h-5 text-gray-500" /> : (topic.icon || '📚')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="text-lg font-semibold text-white">{topic.title}</h4>
                              {item.isRequired && (
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                                  Bắt buộc
                                </span>
                              )}
                              {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                            </div>
                            <div className="text-sm text-gray-400">
                              Bước {index + 1}/{learningPath.topics.length}
                            </div>
                          </div>
                          {!isLocked && (
                            <Link
                              href={`/learn/${topic._id}`}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium shrink-0"
                            >
                              Học ngay
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : userData?.hasCompletedOnboarding === false ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Target className="w-7 h-7 text-green-400" />
                  Lộ trình học
                </h2>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Chưa có lộ trình học</h3>
                <p className="text-gray-400 mb-4">
                  Hoàn thành bài khảo sát để nhận lộ trình học phù hợp với mục tiêu của bạn
                </p>
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                >
                  Bắt đầu ngay
                </button>
              </div>
            </div>
          ) : null}

          {/* 2. Courses Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-blue-400" />
                Khóa học
              </h2>
              <Link href="/courses" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Xem tất cả →
              </Link>
            </div>

            {loadingData ? (
              <div className="text-center py-12 text-gray-500">Đang tải...</div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.slice(0, 6).map((course) => (
                  <Link
                    key={course._id}
                    href={`/course/${course._id}`}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-5 hover:border-blue-500/50 transition group"
                  >
                    {course.thumbnail && (
                      <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-900">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      {course.level && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full font-medium"
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
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Chưa có khóa học nào</p>
              </div>
            )}
          </div>

          {/* 3. Topics Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookMarked className="w-7 h-7 text-yellow-400" />
                Chuyên đề
              </h2>
              <Link href="/topics" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                Xem tất cả →
              </Link>
            </div>

            {loadingData ? (
              <div className="text-center py-12 text-gray-500">Đang tải...</div>
            ) : topics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topics.slice(0, 8).map((topic) => (
                  <Link
                    key={topic._id}
                    href={`/learn/${topic._id}`}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-5 hover:border-yellow-500/50 transition group"
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl border border-yellow-500/30 mb-4">
                      {topic.icon || '📚'}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition">
                      {topic.title}
                    </h3>
                    {topic.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{topic.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
                <BookMarked className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Chưa có chuyên đề nào</p>
              </div>
            )}
          </div>

          {/* 4. Quizzes Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-7 h-7 text-purple-400" />
                Bài kiểm tra
              </h2>
              <Link href="/quizzes" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Xem tất cả →
              </Link>
            </div>

            {loadingData ? (
              <div className="text-center py-12 text-gray-500">Đang tải...</div>
            ) : quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.slice(0, 6).map((quiz) => (
                  <div
                    key={quiz._id}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0">
                        <Trophy className="w-6 h-6 text-purple-400" />
                      </div>
                      {quiz.duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-4 h-4" />
                          {quiz.duration} phút
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{quiz.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{quiz.questions?.length || 0} câu hỏi</span>
                      <Link
                        href={`/quiz/${quiz._id}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-medium"
                      >
                        Làm bài
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Chưa có bài kiểm tra nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
