'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { AIChatbot } from '@/components/ui/AIChatbot';
import OnboardingModal, { OnboardingData } from '@/components/onboarding/OnboardingModal';
import { BookOpen, Play, Trophy, TrendingUp, ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Course } from '@/types';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, userData, loading, signOut, refreshUserData } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/courses/recommended', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCourses(data.courses || []);
      setIsRecommended(data.isRecommended || false);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Show onboarding modal for new users
  useEffect(() => {
    console.log('=== ONBOARDING CHECK ===');
    console.log('userData:', userData);
    console.log('hasCompletedOnboarding:', userData?.hasCompletedOnboarding);
    console.log('Type:', typeof userData?.hasCompletedOnboarding);
    console.log('Should show modal:', userData && userData.hasCompletedOnboarding === false);
    
    if (userData && userData.hasCompletedOnboarding === false) {
      console.log('✓ SHOWING ONBOARDING MODAL');
      setShowOnboardingModal(true);
    } else {
      console.log('✗ NOT SHOWING MODAL - Reason:', 
        !userData ? 'No userData' : 
        userData.hasCompletedOnboarding === true ? 'Already completed' :
        userData.hasCompletedOnboarding === undefined ? 'Field undefined' :
        'Unknown'
      );
    }
  }, [userData]);

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
      
      // Refresh user data to update hasCompletedOnboarding
      await refreshUserData();
      
      setShowOnboardingModal(false);
      
      // Refresh courses with new recommendations
      fetchCourses();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

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
    photoURL: user.photoURL,
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

  // Get photo from database first, fallback to Firebase
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
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="text-4xl">
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
              <Link href="/forum" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <MessageSquare className="w-5 h-5" />
                Hỏi đáp
              </Link>
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition group"
              >
                {optimizedPhoto ? (
                  <img 
                    src={optimizedPhoto} 
                    alt={displayData.displayName || 'User'}
                    className="w-9 h-9 rounded-full object-cover shadow-lg group-hover:shadow-blue-500/50 transition-shadow"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                    {displayData.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-gray-100 font-semibold text-sm leading-tight">
                    {displayData.displayName}
                  </span>
                  <span className="text-xs text-gray-500">
                    Học viên
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      {optimizedPhoto ? (
                        <img 
                          src={optimizedPhoto} 
                          alt={displayData.displayName || 'User'}
                          className="w-12 h-12 rounded-full object-cover shadow-lg"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {displayData.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{displayData.displayName}</p>
                        <p className="text-xs text-gray-400">Học viên</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
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
            

            {/* Khóa học miễn phí */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Khóa học miễn phí</h2>
                  <p className="text-gray-400">Học tiếng Anh từ cơ bản đến nâng cao</p>
                </div>
                <Link href="/learn" className="text-orange-500 hover:text-orange-400 font-semibold flex items-center gap-2 transition">
                  Xem lộ trình
                  <ChevronDown className="w-5 h-5 -rotate-90" />
                </Link>
              </div>

              {/* Cơ bản */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Giới thiệu bản thân */}
                  <div className="group bg-linear-to-br from-red-500 via-pink-500 to-purple-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">👋</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Giới thiệu bản thân</h4>
                      <p className="text-white/80 text-sm">Học cách tự giới thiệu bằng tiếng Anh</p>
                    </div>
                  </div>

                  {/* Sinh hoạt hằng ngày */}
                  <div className="group bg-linear-to-br from-cyan-400 via-cyan-500 to-blue-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">🏠</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Sinh hoạt hằng ngày</h4>
                      <p className="text-white/80 text-sm">Từ vựng và câu thường dùng hàng ngày</p>
                    </div>
                  </div>

                  {/* Gọi đồ ăn */}
                  <div className="group bg-linear-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">🍔</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Gọi đồ ăn</h4>
                      <p className="text-white/80 text-sm">Đặt món tại nhà hàng & quán ăn</p>
                    </div>
                  </div>

                  {/* Thời tiết */}
                  <div className="group bg-linear-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">☀️</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Thời tiết</h4>
                      <p className="text-white/80 text-sm">Nói chuyện về thời tiết</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nâng cao */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Nâng cao
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Nói về thú cưng */}
                  <div className="group bg-linear-to-br from-orange-400 via-orange-500 to-red-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">🐶</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Nói về thú cưng</h4>
                      <p className="text-white/80 text-sm">Từ vựng về động vật và thú cưng</p>
                    </div>
                  </div>

                  {/* Du lịch */}
                  <div className="group bg-linear-to-br from-green-400 via-green-500 to-teal-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">✈️</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Du lịch</h4>
                      <p className="text-white/80 text-sm">Tiếng Anh cho chuyến đi du lịch</p>
                    </div>
                  </div>

                  {/* Đi lại */}
                  <div className="group bg-linear-to-br from-indigo-400 via-indigo-500 to-purple-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">🚗</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Đi lại</h4>
                      <p className="text-white/80 text-sm">Phương tiện và chỉ đường</p>
                    </div>
                  </div>

                  {/* Nghề nghiệp */}
                  <div className="group bg-linear-to-br from-pink-400 via-pink-500 to-rose-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">💼</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Nghề nghiệp</h4>
                      <p className="text-white/80 text-sm">Tiếng Anh trong công việc</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ngữ pháp */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Ngữ pháp
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Các thì */}
                  <div className="group bg-linear-to-br from-violet-400 via-violet-500 to-purple-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">⏰</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Các thì</h4>
                      <p className="text-white/80 text-sm">12 thì trong tiếng Anh</p>
                    </div>
                  </div>

                  {/* Mẫu câu */}
                  <div className="group bg-linear-to-br from-emerald-400 via-emerald-500 to-green-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">📝</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Mẫu câu</h4>
                      <p className="text-white/80 text-sm">Các mẫu câu thường dùng</p>
                    </div>
                  </div>

                  {/* Câu điều kiện */}
                  <div className="group bg-linear-to-br from-amber-400 via-amber-500 to-orange-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">🔀</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Câu điều kiện</h4>
                      <p className="text-white/80 text-sm">If clauses và cách dùng</p>
                    </div>
                  </div>

                  {/* Câu bị động */}
                  <div className="group bg-linear-to-br from-sky-400 via-sky-500 to-blue-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all shadow-lg">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl">🔄</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Câu bị động</h4>
                      <p className="text-white/80 text-sm">Passive voice cơ bản & nâng cao</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Old courses section - hidden for now */}
            <div className="hidden">
              {courses.length === 0 ? (
                <div className="bg-linear-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-xl text-gray-400 mb-6">
                    Chưa có khóa học nào. Hãy làm bài kiểm tra đầu vào để bắt đầu!
                  </p>
                  <Button
                    onClick={() => router.push('/placement-test')}
                    className="px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl text-lg"
                  >
                    Làm Bài Kiểm Tra Đầu Vào
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course._id}
                      className="group bg-linear-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-6 hover:border-blue-600 transition cursor-pointer"
                      onClick={() => router.push(`/learn/${course._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 flex-1">
                          <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shrink-0">
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
                                <div className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '30%' }}></div>
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
