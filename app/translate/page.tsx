'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, ArrowRightLeft, Volume2, Copy, Check, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface TranslationHistory {
  _id?: string;
  id?: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp?: Date;
  createdAt?: Date;
}

interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
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
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    isLoading: false,
  });
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const translateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load translation history from MongoDB when user is authenticated
  useEffect(() => {
    if (user?.uid && !isLoadingHistory) {
      loadTranslationHistory();
    }
  }, [user?.uid]);

  const loadTranslationHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/translations/history?userId=${user?.uid}&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Failed to load translation history:', response.statusText);
        return;
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Transform DB format to local format
        const formattedHistory = data.data.map((item: any) => ({
          _id: item._id,
          id: item._id,
          sourceText: item.sourceText,
          translatedText: item.translatedText,
          sourceLang: item.sourceLang,
          targetLang: item.targetLang,
          createdAt: item.createdAt,
          timestamp: new Date(item.createdAt),
        }));
        setHistory(formattedHistory);
        console.log('✅ Translation history loaded:', formattedHistory.length, 'items');
      }
    } catch (error) {
      console.error('Error loading translation history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveTranslationToDb = async (
    sourceText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string
  ) => {
    if (!user?.uid) return null;

    try {
      const response = await fetch('/api/translations/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          sourceText,
          translatedText,
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Failed to save translation:', errorData.error);
        return null;
      }

      const data = await response.json();
      console.log('✅ Translation saved to MongoDB:', data.id);
      return data.id; // Return MongoDB _id
    } catch (error) {
      console.error('Error saving translation to DB:', error);
      return null;
    }
  };

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
      try {
        // Gọi Google Translate API thông qua backend
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: sourceText,
            targetLang: targetLang,
            sourceLang: sourceLang,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const translated = data.translatedText || '';
        
        setTranslatedText(translated);

        // Save to MongoDB and get the MongoDB _id
        const mongoId = await saveTranslationToDb(sourceText, translated, sourceLang, targetLang);

        // Add to local history for immediate display - use MongoDB _id if available
        const newEntry: TranslationHistory = {
          _id: mongoId || undefined, // Will have MongoDB _id once saved
          id: mongoId || Date.now().toString(), // Fallback only if save failed
          sourceText: sourceText,
          translatedText: translated,
          sourceLang,
          targetLang,
          timestamp: new Date()
        };
        setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Keep last 50
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText('Lỗi dịch. Vui lòng thử lại.');
      } finally {
        setIsTranslating(false);
      }
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

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!confirmDialog.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-950/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white text-center mb-2">
            {confirmDialog.title}
          </h3>

          {/* Message */}
          <p className="text-gray-300 text-center mb-6 text-sm">
            {confirmDialog.message}
          </p>

          {/* Error Message */}
          {deleteError && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm text-center">{deleteError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: async () => {} });
                confirmDialog.onCancel?.();
              }}
              disabled={confirmDialog.isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={async () => {
                await confirmDialog.onConfirm();
              }}
              disabled={confirmDialog.isLoading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {confirmDialog.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </button>
          </div>
        </div>
      </div>
    );
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Languages className="w-10 h-10 text-blue-400" />
              Dịch Thuật
            </h1>
            <p className="text-xl text-gray-400">
              Dịch nhanh chóng và chính xác 
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
                {isLoadingHistory && (
                  <span className="text-xs text-gray-500">(đang tải...)</span>
                )}
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: 'Xóa tất cả lịch sử dịch?',
                      message: `Bạn sắp xóa ${history.length} mục khỏi lịch sử. Hành động này không thể hoàn tác.`,
                      onConfirm: async () => {
                        try {
                          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
                          const response = await fetch(`/api/translations/history?userId=${user?.uid}`, {
                            method: 'DELETE',
                          });

                          if (response.ok) {
                            setHistory([]);
                            console.log('✅ All translation history deleted');
                            setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: async () => {} });
                          } else {
                            console.error('Failed to delete history');
                          }
                        } catch (error) {
                          console.error('Error deleting history:', error);
                        } finally {
                          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
                        }
                      },
                    });
                  }}
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
                  <div
                    key={item.id || item._id}
                    className="group relative text-left p-3 bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg transition cursor-pointer"
                  >
                    <button
                      onClick={() => {
                        setSourceText(item.sourceText);
                        setSourceLang(item.sourceLang);
                        setTargetLang(item.targetLang);
                      }}
                      className="w-full text-left"
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {item.sourceLang === 'vi' ? 'VI' : 'EN'} → {item.targetLang === 'vi' ? 'VI' : 'EN'}
                      </div>
                      <p className="text-sm text-white line-clamp-2 mb-1">{item.sourceText}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{item.translatedText}</p>
                    </button>
                    
                    {/* Delete button - show on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteError(null);
                        // Always use MongoDB _id, not temporary id
                        const mongoId = item._id;
                        if (!mongoId) {
                          setDeleteError('Item ID not found');
                          return;
                        }
                        setDeleteItemId(mongoId);
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Xóa mục khỏi lịch sử?',
                          message: `"${item.sourceText.substring(0, 50)}${item.sourceText.length > 50 ? '...' : ''}"`,
                          onConfirm: async () => {
                            try {
                              setConfirmDialog(prev => ({ ...prev, isLoading: true }));
                              setDeleteError(null);

                              const itemIdToDelete = item._id;
                              if (!itemIdToDelete) {
                                throw new Error('Item ID not found');
                              }

                              console.log('🗑️ Deleting item:', {
                                itemId: itemIdToDelete,
                                userId: user?.uid,
                              });

                              const response = await fetch(
                                `/api/translations/history?userId=${user?.uid}&id=${itemIdToDelete}`,
                                { method: 'DELETE' }
                              );

                              const data = await response.json();
                              console.log('Delete response:', data);

                              if (!response.ok) {
                                throw new Error(data.error || `Delete failed: ${response.status}`);
                              }

                              setHistory(prev => prev.filter(h => h._id !== itemIdToDelete));
                              console.log('✅ Translation deleted from history');
                              setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: async () => {} });
                              setDeleteItemId(null);
                            } catch (error) {
                              const errorMsg = error instanceof Error ? error.message : 'Error deleting translation';
                              console.error('Error deleting history item:', error);
                              setDeleteError(errorMsg);
                            } finally {
                              setConfirmDialog(prev => ({ ...prev, isLoading: false }));
                            }
                          },
                        });
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 text-gray-400 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
}
