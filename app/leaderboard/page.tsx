'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardUser {
  rank: number;
  displayName: string;
  photoURL?: string;
  xp: number;
  streak: number;
  level: string;
}

export default function Leaderboard() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Fetch real leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboardData(data.leaderboard);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, []);

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

  const getRankIcon = (rank: number) => {
    const colors = [
      'text-red-400',
      'text-green-400', 
      'text-pink-400',
      'text-purple-400',
      'text-yellow-400'
    ];
    return <span className={`text-2xl font-bold ${colors[rank - 1]}`}>#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-red-900/20 border-red-700/50';
    if (rank === 2) return 'bg-green-900/20 border-green-700/50';
    if (rank === 3) return 'bg-pink-900/20 border-pink-700/50';
    if (rank === 4) return 'bg-purple-900/20 border-purple-700/50';
    return 'bg-yellow-900/20 border-yellow-700/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={userData?.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3">
              <div className="text-4xl">
                ☃️
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                LingoBros
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href={userData?.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
                <Home className="w-5 h-5" />
                Trang chủ
              </Link>
              <Link href="/leaderboard" className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
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
                  <span className={`text-xs ${userData?.isAdmin ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {userData?.isAdmin ? 'Admin' : 'Học viên'}
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-3">
              Bảng Xếp Hạng
            </h1>
            <p className="text-xl text-gray-400">
              Top 5 học viên xuất sắc nhất
            </p>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-3">
            {loadingLeaderboard ? (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-gray-700 bg-gray-800/50 animate-pulse"
                >
                  <div className="w-16 h-8 bg-gray-700 rounded"></div>
                  <div className="w-14 h-14 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-700 rounded"></div>
                </div>
              ))
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Chưa có dữ liệu</div>
            ) : (
              leaderboardData.map((userItem, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition ${getRankBadgeColor(userItem.rank)}`}
                >
                  {/* Rank */}
                  <div className="w-16 flex items-center justify-center">
                    {getRankIcon(userItem.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {userItem.photoURL ? (
                      <img 
                        src={userItem.photoURL} 
                        alt={userItem.displayName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-600"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextEl) nextEl.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-600 ${userItem.photoURL ? 'hidden' : ''}`}>
                      {userItem.displayName?.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{userItem.displayName}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-400">
                        Level: <span className="text-blue-400 font-semibold">{userItem.level}</span>
                      </span>
                      <span className="text-sm text-gray-400">
                        🔥 <span className="text-orange-400 font-semibold">{userItem.streak} ngày</span>
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-2xl font-bold text-white">{userItem.xp.toLocaleString()}</span>
                    </div>
                    <span className="text-sm text-gray-400">XP</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Your Position */}
          {userData && (
            <div className="mt-8 p-5 bg-blue-600/20 border-2 border-blue-600 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-400">
                    #{leaderboardData.find(u => u.displayName === displayData.displayName)?.rank || '-'}
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {optimizedPhoto ? (
                    <img 
                      src={optimizedPhoto} 
                      alt={displayData.displayName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-600"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-600">
                      {displayData.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{displayData.displayName} (Bạn)</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-400">
                      Level: <span className="text-blue-400 font-semibold">{displayData.level}</span>
                    </span>
                    <span className="text-sm text-gray-400">
                      🔥 <span className="text-orange-400 font-semibold">{displayData.streak} ngày</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-2xl font-bold text-white">{displayData.xp.toLocaleString()}</span>
                  </div>
                  <span className="text-sm text-gray-400">XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Tiếp tục học để leo lên bảng xếp hạng! 
          </p>
        </div>
      </div>
    </div>
  );
}
