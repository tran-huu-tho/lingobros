'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2 } from 'lucide-react';
import Link from 'next/link';

export default function IPAPage() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const playSound = (symbol: string) => {
    // Stop previous audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPlayingSound(symbol);
    
    // Call API endpoint to get audio URL (keeps mapping hidden on server)
    const audioUrl = `/api/ipa/audio?symbol=${encodeURIComponent(symbol)}`;
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    
    audio.play().catch((error) => {
      // Suppress console error - audio playback interruption is expected behavior
      setPlayingSound(null);
    });
    
    audio.onended = () => {
      setPlayingSound(null);
    };
  };

  const vowels = [
    { symbol: 'ɑ', word: 'hot', example: 'h/ɑ/t', pronunciation: 'ahh' },
    { symbol: 'æ', word: 'cat', example: 'c/æ/t', pronunciation: 'aa' },
    { symbol: 'ʌ', word: 'but', example: 'b/ʌ/t', pronunciation: 'uh' },
    { symbol: 'ɛ', word: 'bed', example: 'b/ɛ/d', pronunciation: 'eh' },
    { symbol: 'eɪ', word: 'say', example: 's/eɪ/', pronunciation: 'ay' },
    { symbol: 'ɜː', word: 'bird', example: 'b/ɜː/rd', pronunciation: 'er' },
    { symbol: 'ɪ', word: 'ship', example: 'sh/ɪ/p', pronunciation: 'ih' },
    { symbol: 'iː', word: 'sheep', example: 'sh/iː/p', pronunciation: 'ee' },
    { symbol: 'ə', word: 'about', example: '/ə/bout', pronunciation: 'uh' },
    { symbol: 'oʊ', word: 'boat', example: 'b/oʊ/t', pronunciation: 'oh' },
    { symbol: 'ʊ', word: 'foot', example: 'f/ʊ/t', pronunciation: 'oo' },
    { symbol: 'uː', word: 'food', example: 'f/uː/d', pronunciation: 'oo' },
    { symbol: 'aʊ', word: 'cow', example: 'c/aʊ/', pronunciation: 'ow' },
    { symbol: 'aɪ', word: 'time', example: 't/aɪ/m', pronunciation: 'eye' },
    { symbol: 'ɔɪ', word: 'boy', example: 'b/ɔɪ/', pronunciation: 'oy' }
  ];

  const consonants = [
    { symbol: 'b', word: 'book', example: '/b/ook' },
    { symbol: 'tʃ', word: 'chair', example: '/tʃ/air' },
    { symbol: 'd', word: 'day', example: '/d/ay' },
    { symbol: 'f', word: 'fish', example: '/f/ish' },
    { symbol: 'g', word: 'go', example: '/g/o' },
    { symbol: 'h', word: 'home', example: '/h/ome' },
    { symbol: 'dʒ', word: 'job', example: '/dʒ/ob' },
    { symbol: 'k', word: 'key', example: '/k/ey' },
    { symbol: 'l', word: 'lion', example: '/l/ion' },
    { symbol: 'm', word: 'moon', example: '/m/oon' },
    { symbol: 'n', word: 'nose', example: '/n/ose' },
    { symbol: 'ŋ', word: 'sing', example: 'si/ŋ/' },
    { symbol: 'p', word: 'pig', example: '/p/ig' },
    { symbol: 'r', word: 'red', example: '/r/ed' },
    { symbol: 's', word: 'see', example: '/s/ee' },
    { symbol: 'ʒ', word: 'measure', example: 'mea/ʒ/ure' },
    { symbol: 'ʃ', word: 'shoe', example: '/ʃ/oe' },
    { symbol: 't', word: 'time', example: '/t/ime' },
    { symbol: 'ð', word: 'then', example: '/ð/en' },
    { symbol: 'θ', word: 'think', example: '/θ/ink' },
    { symbol: 'v', word: 'very', example: '/v/ery' },
    { symbol: 'w', word: 'water', example: '/w/ater' },
    { symbol: 'j', word: 'you', example: '/j/ou' },
    { symbol: 'z', word: 'zoo', example: '/z/oo' }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={userData?.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3">
              <div className="text-4xl">
                ☃️
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                LingoBros
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href={userData?.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
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
              <Link href="/ipa" className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
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
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
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
                  <div className="px-4 py-3 bg-linear-to-br from-blue-600/20 to-purple-600/20 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      {optimizedPhoto ? (
                        <img 
                          src={optimizedPhoto} 
                          alt={displayData.displayName || 'User'}
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
                        <p className="text-xs text-yellow-400">{userData?.isAdmin ? 'Admin' : 'Học viên'}</p>
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
          {/* Introduction */}
          <div className="bg-linear-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-bold text-white mb-2">📚 IPA là gì?</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Bảng phiên âm quốc tế (IPA) giúp bạn phát âm tiếng Anh chính xác hơn và hiểu cách đọc từ điển.
            </p>
          </div>

          {/* Nguyên âm */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-white">Nguyên âm</h2>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                {vowels.length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {vowels.map((item, index) => (
                <button
                  key={index}
                  onClick={() => playSound(item.symbol)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 hover:bg-gray-700/50 hover:border-blue-500/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-300"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-all duration-300">
                        {item.symbol}
                      </div>
                      <Volume2 className={`w-4 h-4 transition-all duration-300 ${
                        playingSound === item.symbol ? 'text-blue-400 scale-125' : 'text-gray-600 group-hover:text-blue-500'
                      }`} />
                    </div>
                    
                    <div className="text-left space-y-0.5">
                      <div className="text-sm text-gray-300 font-semibold">{item.word}</div>
                      <div className="text-xs text-gray-500 font-mono">{item.example}</div>
                    </div>
                    
                    <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-500"></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phụ âm */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-white">Phụ âm</h2>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                {consonants.length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {consonants.map((item, index) => (
                <button
                  key={index}
                  onClick={() => playSound(item.symbol)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 hover:bg-gray-700/50 hover:border-purple-500/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-all duration-300"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-3xl font-bold text-white group-hover:text-purple-400 transition-all duration-300">
                        {item.symbol}
                      </div>
                      <Volume2 className={`w-4 h-4 transition-all duration-300 ${
                        playingSound === item.symbol ? 'text-purple-400 scale-125' : 'text-gray-600 group-hover:text-purple-500'
                      }`} />
                    </div>
                    
                    <div className="text-left space-y-0.5">
                      <div className="text-sm text-gray-300 font-semibold">{item.word}</div>
                      <div className="text-xs text-gray-500 font-mono">{item.example}</div>
                    </div>
                    
                    <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-0 group-hover:w-full transition-all duration-500"></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-6 bg-linear-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              💡 Mẹo học IPA
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">•</span>
                <span>Tập trung vào các âm khó phát âm với người Việt như /θ/, /ð/, /ʒ/</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">•</span>
                <span>Luyện tập mỗi ngày 10-15 phút với các từ có âm IPA</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">•</span>
                <span>Sử dụng từ điển có phiên âm IPA khi tra từ mới</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">•</span>
                <span>Ghi âm giọng nói của bạn và so sánh với người bản xứ</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
