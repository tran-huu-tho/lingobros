'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Mail, Calendar, Award, Flame, Zap, Trophy, Target, BookOpen, Clock, Edit2, Camera } from 'lucide-react';
import Link from 'next/link';

interface UserStats {
  totalLessons: number;
  completedLessons: number;
  studyTime: number;
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
    date: string | null;
  }>;
}

export default function Profile() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [bio, setBio] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [photoURL, setPhotoURL] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const saveBio = async () => {
    if (!user) return;
    
    console.log('Saving bio:', editedBio);
    
    try {
      const token = await user.getIdToken();
      console.log('Got token, sending PATCH request...');
      
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio: editedBio })
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Bio saved successfully:', data);
        setBio(editedBio);
        setIsEditing(false);
        
        // Force reload page to sync userData from AuthContext
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('Failed to save bio:', response.status, errorText);
        alert('Lưu thất bại: ' + errorText);
      }
    } catch (error) {
      console.error('Error saving bio:', error);
      alert('Có lỗi xảy ra khi lưu bio: ' + error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !user) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        
        // Upload to Cloudinary via API - this already saves to database
        const token = await user.getIdToken();
        const response = await fetch('/api/users/upload-avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64Image })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Avatar uploaded to Cloudinary and saved to DB:', data.photoURL);
          
          // Auto refresh to show new photo from database
          window.location.reload();
        } else {
          console.error('Failed to upload avatar');
          alert('Upload ảnh thất bại');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Có lỗi khi upload ảnh');
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/users/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user?.photoURL) {
      setPhotoURL(user.photoURL);
    }
    // Load from MongoDB if available
    if (userData?.photoURL) {
      console.log('Loading photo from database:', userData.photoURL);
      setPhotoURL(userData.photoURL);
    }
    if (userData?.bio) {
      console.log('Loading bio from database:', userData.bio);
      setBio(userData.bio);
      setEditedBio(userData.bio);
    } else {
      // Reset bio if no data
      setBio('');
      setEditedBio('');
    }
  }, [user, userData]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email,
    photoURL: user.photoURL,
    xp: 0,
    streak: 0,
    hearts: 5,
    level: 'beginner',
    createdAt: new Date(),
    preferences: { dailyGoalMinutes: 15 }
  };

  // Use photoURL from database first, fallback to Firebase
  const userPhoto = userData?.photoURL || user?.photoURL || photoURL;
  
  // Fix Google image size (remove s96-c, use s400-c for higher quality)
  const optimizedPhoto = userPhoto?.includes('googleusercontent.com') && userPhoto?.includes('=s96-c')
    ? userPhoto.replace('=s96-c', '=s400-c')
    : userPhoto;

  const totalLessons = stats?.totalLessons || 45;
  const completedLessons = stats?.completedLessons || 0;
  const studyTime = stats?.studyTime || 0;
  const achievements = stats?.achievements || [];

  const statsCards = [
    { label: 'Tổng XP', value: displayData.xp.toLocaleString(), icon: Zap, color: 'from-yellow-400 to-orange-500' },
    { label: 'Streak hiện tại', value: `${displayData.streak} ngày`, icon: Flame, color: 'from-orange-400 to-red-500' },
    { label: 'Trái tim', value: displayData.hearts, icon: '❤️', color: 'from-red-400 to-pink-500' },
    { label: 'Bài học hoàn thành', value: `${completedLessons}/${totalLessons}`, icon: BookOpen, color: 'from-green-400 to-emerald-500' },
  ];

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  function formatDate(date: Date | string | undefined) {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(d);
  }

  const currentLevel = Math.floor(displayData.xp / 200) + 1;
  const currentLevelXP = displayData.xp % 200;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl">
                ☃️
              </div>
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
                    className="w-9 h-9 rounded-full object-cover shadow-lg group-hover:shadow-blue-500/50 transition-shadow"
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
                  <span className="text-xs text-gray-500">Học viên</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      {optimizedPhoto ? (
                        <img 
                          src={optimizedPhoto} 
                          alt={displayData.displayName || 'User'}
                          className="w-12 h-12 rounded-full object-cover shadow-lg"
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
                  
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-blue-400 bg-gray-700/50 font-semibold" onClick={() => setShowUserMenu(false)}>
                    <User className="w-5 h-5" />
                    Hồ sơ người dùng
                  </Link>
                  <button onClick={() => { signOut(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition">
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group">
                {optimizedPhoto ? (
                  <img 
                    src={optimizedPhoto} 
                    alt={displayData.displayName || 'User'} 
                    className="w-32 h-32 rounded-full shadow-2xl object-cover border-4 border-gray-700"
                    onError={(e) => {
                      console.error('Image failed to load:', optimizedPhoto);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-5xl shadow-2xl border-4 border-gray-700">
                    {displayData.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition cursor-pointer opacity-0 group-hover:opacity-100">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }} />
                </label>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{displayData.displayName}</h1>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-semibold capitalize">
                        {displayData.level}
                      </span>
                      <span className="text-gray-400 text-sm">• Level {currentLevel}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                    <Edit2 className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm truncate">{user?.email || displayData.email || 'Chưa có email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Tham gia {formatDate(displayData.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Đã học {formatStudyTime(studyTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Mục tiêu: {displayData.preferences?.dailyGoalMinutes || 15} phút/ngày</span>
                  </div>
                </div>

                {bio && (
                  <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                    <p className="text-gray-300 text-sm italic">"{bio}"</p>
                  </div>
                )}

                <div className="bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Tiến độ Level {currentLevel + 1}</span>
                    <span className="text-sm font-semibold text-blue-400">{currentLevelXP} / 200 XP</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${(currentLevelXP / 200) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  {typeof stat.icon === 'string' ? <span className="text-2xl">{stat.icon}</span> : <stat.icon className="w-6 h-6 text-white" />}
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-7 h-7 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Thành Tích</h2>
              <span className="text-sm text-gray-400">({achievements.filter(a => a.unlocked).length}/{achievements.length})</span>
            </div>

            {loadingStats ? (
              <div className="text-center py-8 text-gray-400">Đang tải...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`relative p-5 rounded-2xl border-2 transition ${achievement.unlocked ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-600/50 hover:border-yellow-500' : 'bg-gray-900/50 border-gray-700 opacity-50'}`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="text-white font-bold mb-1">{achievement.name}</h3>
                      <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                      {achievement.unlocked && achievement.date && <span className="text-xs text-yellow-400">🎉 {achievement.date}</span>}
                      {!achievement.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-2xl">
                          <span className="text-2xl">🔒</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-blue-400" />
              Hoạt Động Gần Đây
            </h2>

            {loadingStats ? (
              <div className="text-center py-8 text-gray-400">Đang tải...</div>
            ) : completedLessons === 0 ? (
              <div className="text-center py-8 text-gray-400">Chưa có hoạt động nào. Hãy bắt đầu học ngay!</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                  <div className="text-3xl">✅</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">Bài học đã hoàn thành</p>
                    <p className="text-sm text-gray-400">{completedLessons} bài học</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">{displayData.xp} XP</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Chỉnh Sửa Hồ Sơ</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tên hiển thị</label>
                <input 
                  type="text" 
                  value={displayData.displayName}
                  disabled
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Tên này được đồng bộ từ tài khoản Google/Facebook của bạn</p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Giới thiệu bản thân</label>
                <textarea 
                  value={editedBio}
                  onChange={(e) => {
                    console.log('Bio changed to:', e.target.value);
                    setEditedBio(e.target.value);
                  }}
                  placeholder="Viết vài dòng về bản thân..."
                  rows={4}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{editedBio.length}/200 ký tự</p>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    console.log('Save button clicked, editedBio:', editedBio);
                    saveBio();
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
                >
                  Lưu thay đổi
                </button>
                <button 
                  onClick={() => {
                    setEditedBio(bio);
                    setIsEditing(false);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
