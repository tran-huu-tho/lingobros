'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, ArrowRightLeft, Volume2, Copy, Check, Clock } from 'lucide-react';
import Link from 'next/link';

interface TranslationHistory {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}

export default function Translate() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sourceLang, setSourceLang] = useState('vi');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const translateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Auto-translate when sourceText changes
  useEffect(() => {
    if (translateTimeoutRef.current) {
      clearTimeout(translateTimeoutRef.current);
    }

    if (!sourceText.trim()) {
      setTranslatedText('');
      return;
    }

    setIsTranslating(true);
    translateTimeoutRef.current = setTimeout(async () => {
      // Giả lập API call - sẽ thay bằng Gemini API
      const translated = 'This is a translated text. In real implementation, this will use Gemini API.';
      setTranslatedText(translated);
      setIsTranslating(false);

      // Add to history
      const newEntry: TranslationHistory = {
        id: Date.now().toString(),
        sourceText: sourceText,
        translatedText: translated,
        sourceLang,
        targetLang,
        timestamp: new Date()
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 19)]); // Keep last 20
    }, 800);

    return () => {
      if (translateTimeoutRef.current) {
        clearTimeout(translateTimeoutRef.current);
      }
    };
  }, [sourceText, sourceLang, targetLang]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    window.speechSynthesis.speak(utterance);
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
              <Link href="/translate" className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition">
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
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                  {displayData.displayName?.charAt(0).toUpperCase()}
                </div>
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
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {displayData.displayName?.charAt(0).toUpperCase()}
                      </div>
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Languages className="w-10 h-10 text-blue-400" />
              Dịch Thuật AI
            </h1>
            <p className="text-xl text-gray-400">
              Dịch nhanh chóng và chính xác với AI
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="px-6 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white font-semibold focus:outline-none focus:border-blue-500 transition"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>

            <button
              onClick={handleSwapLanguages}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </button>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-6 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white font-semibold focus:outline-none focus:border-blue-500 transition"
            >
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>

          {/* Translation Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Text */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">Văn bản gốc</h3>
                {sourceText && (
                  <button
                    onClick={() => handleSpeak(sourceText, sourceLang)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                  >
                    <Volume2 className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Nhập văn bản cần dịch..."
                className="w-full h-40 bg-gray-900 text-white placeholder:text-gray-500 placeholder:opacity-70 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="mt-3">
                <span className="text-sm text-gray-500">
                  {sourceText.length} ký tự
                </span>
              </div>
            </div>

            {/* Translated Text */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">Bản dịch</h3>
                <div className="flex items-center gap-2">
                  {translatedText && (
                    <>
                      <button
                        onClick={() => handleSpeak(translatedText, targetLang)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                      >
                        <Volume2 className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="w-full h-40 bg-gray-900 text-white rounded-xl p-4 overflow-y-auto">
                {isTranslating ? (
                  <span className="text-gray-500">Đang dịch...</span>
                ) : translatedText ? (
                  translatedText
                ) : (
                  <span className="text-gray-500 opacity-70">Bản dịch sẽ hiển thị ở đây...</span>
                )}
              </div>
              <div className="mt-3">
                <span className="text-sm text-gray-500">
                  {translatedText.length} ký tự
                </span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Lịch sử dịch</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8 col-span-full">Chưa có lịch sử dịch</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSourceText(item.sourceText);
                      setSourceLang(item.sourceLang);
                      setTargetLang(item.targetLang);
                    }}
                    className="text-left p-3 bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg transition"
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {item.sourceLang === 'vi' ? 'VI' : 'EN'} → {item.targetLang === 'vi' ? 'VI' : 'EN'}
                    </div>
                    <p className="text-sm text-white line-clamp-2 mb-1">{item.sourceText}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{item.translatedText}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
