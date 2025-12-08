'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, CheckCircle2, Play, Search, Clock, Award, Target } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  topicId?: {
    _id: string;
    title: string;
  };
  questions: Array<{
    exerciseId: string;
    order: number;
    points: number;
  }>;
  duration?: number; // minutes
  passingScore: number;
  isPublished: boolean;
}

interface QuizProgress {
  quizId: string;
  completed: boolean;
  score: number;
  passed: boolean;
  completedAt?: Date;
}

export default function QuizzesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, QuizProgress>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
    
    if (user) {
      fetchQuizzes();
      fetchUserProgress();
    }
  }, [user, loading]);

  const fetchQuizzes = async () => {
    try {
      const token = await user!.getIdToken();
      const response = await fetch('/api/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      } else {
        toast.error('Không thể tải danh sách bài kiểm tra');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const token = await user!.getIdToken();
      const response = await fetch('/api/progress/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const progressMap: Record<string, QuizProgress> = {};
        data.progress?.forEach((p: QuizProgress) => {
          progressMap[p.quizId] = p;
        });
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.topicId?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || loadingQuizzes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-7 h-7 text-purple-400" />
                  Bài kiểm tra
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Kiểm tra kiến thức và nhận điểm
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700 px-4 py-2 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-white">{userData?.xp || 0}</span>
                </div>
                <div className="w-px h-6 bg-gray-600"></div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-white">
                    {Object.values(userProgress).filter(p => p.completed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm bài kiểm tra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tổng bài kiểm tra</p>
                <p className="text-2xl font-bold text-white">{quizzes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(userProgress).filter(p => p.completed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Đạt yêu cầu</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(userProgress).filter(p => p.passed).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Không tìm thấy bài kiểm tra
            </h3>
            <p className="text-gray-400">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const progress = userProgress[quiz._id];
              const isCompleted = progress?.completed || false;
              const isPassed = progress?.passed || false;

              return (
                <Link
                  key={quiz._id}
                  href={`/quiz/${quiz._id}`}
                  className="group relative bg-gray-800/50 border border-gray-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden hover:scale-105"
                >
                  {/* Color bar */}
                  <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-pink-500" />

                  {/* Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors mb-1">
                          {quiz.title}
                        </h3>
                        {quiz.topicId && (
                          <p className="text-xs text-gray-500">
                            {quiz.topicId.title}
                          </p>
                        )}
                      </div>

                      {isCompleted && (
                        <div className={`p-2 rounded-full border ${
                          isPassed 
                            ? 'bg-green-500/20 border-green-500/30' 
                            : 'bg-red-500/20 border-red-500/30'
                        }`}>
                          <CheckCircle2 className={`w-5 h-5 ${
                            isPassed ? 'text-green-400' : 'text-red-400'
                          }`} />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {quiz.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-4 h-4" />
                        <span>{quiz.questions.length} câu</span>
                      </div>
                      {quiz.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span>{quiz.duration} phút</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span>{quiz.passingScore}%</span>
                      </div>
                    </div>

                    {/* Score display if completed */}
                    {progress && progress.score > 0 && (
                      <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Điểm số</span>
                          <span className={`font-bold ${
                            isPassed ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {Math.round(progress.score)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        isCompleted
                          ? isPassed
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                            : 'bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          {isPassed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Đã đạt - Làm lại
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Chưa đạt - Thử lại
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Bắt đầu kiểm tra
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
