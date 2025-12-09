'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, Lock, CheckCircle2, Play, Trophy, Search, Filter, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Level {
  _id: string;
  name: string;
  displayName: string;
  color: string;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  level?: Level;
  color: string;
  gradientFrom?: string;
  gradientTo?: string;
  totalTopics: number;
  totalLessons: number;
  estimatedHours: number;
  isPublished: boolean;
}

export default function CoursesPage() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
    
    if (user) {
      fetchCourses();
      fetchLevels();
    }
  }, [user, loading]);

  const fetchCourses = async () => {
    try {
      const token = await user!.getIdToken();
      const response = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        toast.error('Không thể tải danh sách khóa học');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/levels');
      if (response.ok) {
        const data = await response.json();
        setLevels(data.levels || []);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level?._id === selectedLevel;
    return matchesSearch && matchesLevel && course.isPublished;
  });

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
    streak: 0
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
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
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
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
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
          {/* Page Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4 transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quay lại Dashboard
            </Link>
            
            <h1 className="text-4xl font-bold text-white mb-2">Tất cả khóa học</h1>
            <p className="text-gray-400">
              Khám phá các khóa học tiếng Anh từ cơ bản đến nâng cao
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="appearance-none pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition cursor-pointer min-w-[200px]"
              >
                <option value="all">Tất cả cấp độ</option>
                {levels.map(level => (
                  <option key={level._id} value={level._id}>
                    {level.displayName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-400">
              Tìm thấy <span className="text-white font-semibold">{filteredCourses.length}</span> khóa học
            </p>
          </div>

          {/* Courses Grid */}
          {loadingCourses ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải khóa học...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link
                  key={course._id}
                  href={`/course/${course._id}`}
                  className="group bg-gradient-to-br from-gray-800/50 to-gray-800/30 hover:from-gray-800/70 hover:to-gray-800/50 border border-gray-700 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  {/* Course Header with Gradient */}
                  <div 
                    className="h-32 p-6 flex items-end relative overflow-hidden"
                    style={{
                      background: course.gradientFrom && course.gradientTo
                        ? `linear-gradient(135deg, ${course.gradientFrom}, ${course.gradientTo})`
                        : `linear-gradient(135deg, ${course.color}20, ${course.color}40)`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                    <h3 className="text-xl font-bold text-white relative z-10 group-hover:text-blue-300 transition">
                      {course.title}
                    </h3>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Level Badge */}
                    {course.level && (
                      <div className="mb-3">
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                          style={{
                            backgroundColor: course.level.color + '20',
                            borderColor: course.level.color + '40',
                            color: course.level.color
                          }}
                        >
                          {course.level.displayName}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {course.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Chuyên đề:</span>
                        <span className="text-white font-semibold">{course.totalTopics}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Bài học:</span>
                        <span className="text-white font-semibold">{course.totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Thời lượng:</span>
                        <span className="text-white font-semibold">{course.estimatedHours}h</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2 group-hover:bg-blue-500">
                      <Play className="w-4 h-4" />
                      Bắt đầu học
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-20 h-20 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery 
                  ? `Không có khóa học nào phù hợp với "${searchQuery}"`
                  : 'Chưa có khóa học nào trong danh sách'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
