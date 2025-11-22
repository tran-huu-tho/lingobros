'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardUser {
  rank: number;
  displayName: string;
  xp: number;
  streak: number;
  level: string;
}

export default function Leaderboard() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mock data - sẽ thay bằng API call thực
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([
    { rank: 1, displayName: 'Nguyễn Văn A', xp: 15420, streak: 45, level: 'advanced' },
    { rank: 2, displayName: 'Trần Thị B', xp: 14850, streak: 38, level: 'advanced' },
    { rank: 3, displayName: 'Lê Văn C', xp: 13200, streak: 32, level: 'intermediate' },
    { rank: 4, displayName: 'Phạm Thị D', xp: 12100, streak: 28, level: 'intermediate' },
    { rank: 5, displayName: 'Hoàng Văn E', xp: 11500, streak: 25, level: 'intermediate' },
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
              <Link href="/leaderboard" className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
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
            {leaderboardData.map((userItem, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition ${getRankBadgeColor(userItem.rank)}`}
              >
                {/* Rank */}
                <div className="w-16 flex items-center justify-center">
                  {getRankIcon(userItem.rank)}
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
            ))}
          </div>

          {/* Your Position (if not in top 10) */}
          <div className="mt-8 p-5 bg-blue-600/20 border-2 border-blue-600 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">#-</span>
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

          {/* Motivational Message */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Tiếp tục học để leo lên bảng xếp hạng! 
          </p>
        </div>
      </div>
    </div>
  );
}
