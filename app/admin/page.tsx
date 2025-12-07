'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2, 
         FileText, FolderOpen, Layers, Users as UsersIcon, BookOpen, Library, Database, School } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('=== ADMIN PAGE DEBUG ===');
    console.log('Loading:', loading);
    console.log('User:', user?.email);
    console.log('UserData:', userData);
    console.log('isAdmin:', userData?.isAdmin);
  }, [loading, user, userData]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && userData && !userData.isAdmin) {
      console.log('❌ Not admin, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-400 mb-4">
            isAdmin: {userData?.isAdmin ? 'true' : 'false'}<br/>
            Email: {user?.email}
          </p>
          <div className="flex flex-col gap-3 items-center">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
              Quay lại Dashboard
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
    xp: 0,
    streak: 0,
    level: 'admin'
  };

  const userPhoto = userData?.photoURL || user?.photoURL;
  const optimizedPhoto = userPhoto?.includes('googleusercontent.com') && userPhoto?.includes('=s96-c')
    ? userPhoto.replace('=s96-c', '=s400-c')
    : userPhoto;

  const adminModules = [
    {
      title: 'Bài học',
      icon: BookOpen,
      description: 'Tạo và quản lý bài học',
      href: '/admin/lessons',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Bài tập',
      icon: FileText,
      description: 'Quản lý bài tập và câu hỏi',
      href: '/admin/exercises',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Khóa học',
      icon: Library,
      description: 'Quản lý khóa học và chương trình',
      href: '/admin/courses',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Ngân hàng câu hỏi',
      icon: Database,
      description: 'Kho câu hỏi và bài kiểm tra',
      href: '/admin/question-bank',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Quản lý học viên',
      icon: UsersIcon,
      description: 'Quản lý tài khoản học viên',
      href: '/admin/students',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Quản lý cấp độ',
      icon: Layers,
      description: 'Quản lý các cấp độ khóa học',
      href: '/admin/levels',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Quản lý lộ trình',
      icon: FolderOpen,
      description: 'Tạo và quản lý lộ trình học',
      href: '/admin/learning-paths',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-3">
              <div className="text-4xl">
                ☃️
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                LingoBros
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
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

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition group"
              >
                {optimizedPhoto ? (
                  <img 
                    src={optimizedPhoto} 
                    alt={displayData.displayName || 'Admin'}
                    className="w-9 h-9 rounded-full object-cover shadow-lg group-hover:shadow-blue-500/50 transition-shadow"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                    {displayData.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-gray-100 font-semibold text-sm leading-tight">
                    {displayData.displayName}
                  </span>
                  <span className="text-xs text-yellow-400">
                    Admin
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 bg-linear-to-br from-blue-600/20 to-purple-600/20 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      {optimizedPhoto ? (
                        <img 
                          src={optimizedPhoto} 
                          alt={displayData.displayName || 'Admin'}
                          className="w-12 h-12 rounded-full object-cover shadow-lg"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {displayData.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{displayData.displayName}</p>
                        <p className="text-xs text-yellow-400">Quản trị viên</p>
                      </div>
                    </div>
                  </div>
                  
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
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            {/* <h1 className="text-4xl font-bold text-white mb-3">
              Chào mừng, {displayData.displayName}!
            </h1> */}
            {/* <p className="text-gray-400 text-lg">
              Quản lý hệ thống học tập LingoBros
            </p> */}
          </div>

          {/* Admin Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminModules.map((module, index) => {
              const IconComponent = module.icon;
              return (
                <Link
                  key={index}
                  href={module.href}
                  className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:bg-gray-800 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-linear-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg bg-linear-to-br ${module.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      {module.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {module.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="mt-3 flex items-center text-blue-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Truy cập</span>
                      <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Additional Note */}
          {/* <div className="mt-12 bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <School className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Chuyển đổi số cho Nhà trường
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Hệ thống quản lý học tập toàn diện cho giáo viên và học sinh. 
                  Tạo bài tập, đề thi, quản lý lớp học và theo dõi tiến độ học tập một cách dễ dàng.
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
