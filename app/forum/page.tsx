'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Plus, ThumbsUp, MessageCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: string;
  };
  title: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: Date;
  tags: string[];
}

export default function Forum() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - sẽ thay bằng API call thực
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: { name: 'Nguyễn Văn A', avatar: 'N', level: 'Advanced' },
      title: 'Cách phân biệt "have been" và "had been"?',
      content: 'Mình thường bị nhầm lẫn giữa 2 thì này, có bạn nào có cách nhớ đơn giản không ạ? Mình cảm ơn!',
      likes: 24,
      comments: 12,
      timestamp: new Date('2025-11-22T10:30:00'),
      tags: ['Ngữ pháp', 'Thì']
    },
    {
      id: '2',
      author: { name: 'Trần Thị B', avatar: 'T', level: 'Intermediate' },
      title: 'Chia sẻ tài liệu luyện IELTS Writing Task 2',
      content: 'Mình có một số tài liệu hay về IELTS Writing, ai cần thì comment bên dưới nhé!',
      likes: 45,
      comments: 28,
      timestamp: new Date('2025-11-22T08:15:00'),
      tags: ['IELTS', 'Writing', 'Tài liệu']
    },
    {
      id: '3',
      author: { name: 'Lê Văn C', avatar: 'L', level: 'Beginner' },
      title: 'Làm sao để cải thiện phát âm tiếng Anh?',
      content: 'Mình học tiếng Anh được 3 tháng rồi nhưng phát âm vẫn chưa tốt. Các bạn có tips gì không?',
      likes: 18,
      comments: 15,
      timestamp: new Date('2025-11-21T16:45:00'),
      tags: ['Phát âm', 'Tips']
    }
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    xp: 0,
    streak: 0,
    level: 'beginner'
  };

  const userPhoto = userData?.photoURL || user?.photoURL;
  const optimizedPhoto = userPhoto?.includes('googleusercontent.com') && userPhoto?.includes('=s96-c')
    ? userPhoto.replace('=s96-c', '=s400-c')
    : userPhoto;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
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
              <Link href="/forum" className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
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
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-3">
                  Hỏi Đáp Cộng Đồng
                </h1>
                <p className="text-xl text-gray-400">
                  Chia sẻ kiến thức và học hỏi từ cộng đồng
                </p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg">
                <Plus className="w-5 h-5" />
                Đăng bài mới
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <button className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl transition">
                <Filter className="w-5 h-5" />
                Lọc
              </button>
            </div>

            {/* Filter Tags */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'grammar', 'vocabulary', 'ielts', 'tips'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {filter === 'all' ? 'Tất cả' : 
                   filter === 'grammar' ? 'Ngữ pháp' : 
                   filter === 'vocabulary' ? 'Từ vựng' : 
                   filter === 'ielts' ? 'IELTS' : 'Tips'}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition cursor-pointer"
              >
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                    {post.author.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{post.author.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full">
                        {post.author.level}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{formatTimestamp(post.timestamp)}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 hover:text-blue-400 transition">
                  {post.title}
                </h3>
                <p className="text-gray-400 mb-4 line-clamp-2">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-gray-400 text-sm">
                  <button className="flex items-center gap-2 hover:text-blue-400 transition">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-400 transition">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments} bình luận</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
