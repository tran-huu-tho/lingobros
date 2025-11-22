'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { AIChatbot } from '@/components/ui/AIChatbot';
import { BookOpen, Play, Trophy, TrendingUp, ChevronDown, User, LogOut, Home, BarChart3, Languages } from 'lucide-react';
import Link from 'next/link';
import { Course } from '@/types';

export default function Dashboard() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Use default data if userData is not available yet
  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    level: 'beginner',
    xp: 0,
    streak: 0,
    hearts: 5,
    gems: 0,
    preferences: {
      dailyGoalMinutes: 15,
      learningGoal: 'general'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl">
                ☃️
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                LingoBros
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
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
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  {displayData.displayName?.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-200 font-medium hidden sm:block">
                  {displayData.displayName}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-5 h-5" />
                    Hồ sơ người dùng
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition"
                  >
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
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Xin chào, {displayData.displayName}! 👋
            </h1>
            <p className="text-xl text-gray-400">
              Hôm nay bạn muốn học gì? Hãy tiếp tục hành trình chinh phục tiếng Anh của mình!
            </p>
          </div>

          {/* Learning Path */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-400" />
              Lộ Trình Học Của Bạn
            </h2>

            {courses.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-xl text-gray-400 mb-6">
                  Chưa có khóa học nào. Hãy làm bài kiểm tra đầu vào để bắt đầu!
                </p>
                <Button
                  onClick={() => router.push('/placement-test')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl text-lg"
                >
                  Làm Bài Kiểm Tra Đầu Vào
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-6 hover:border-blue-600 transition cursor-pointer"
                    onClick={() => router.push(`/learn/${course._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                          <p className="text-gray-400 mb-4">{course.description}</p>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">Tiến độ</span>
                              <span className="text-sm font-semibold text-blue-400">30%</span>
                            </div>
                            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6">
                        <div className="w-14 h-14 bg-blue-600 group-hover:bg-blue-500 rounded-full flex items-center justify-center transition">
                          <Play className="w-7 h-7 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-8 hover:border-yellow-600 transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Thử Thách</h3>
                  <p className="text-gray-400">
                    Hoàn thành thử thách hàng ngày để nhận phần thưởng
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-8 hover:border-green-600 transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Tiến Độ Của Bạn</h3>
                  <p className="text-gray-400">
                    Theo dõi tiến độ và thành tích học tập
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}
