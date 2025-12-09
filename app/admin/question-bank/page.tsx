'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2, Plus, Edit2, Trash2, X, Search, BookOpen, ClipboardList, Check, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  topicId?: { _id: string; title: string };
  questions: Array<{
    exerciseId: string | { _id: string; [key: string]: any };
    order: number;
    points: number;
  }>;
  duration?: number;
  passingScore: number;
  shuffleQuestions: boolean;
  isPublished: boolean;
  createdAt: string;
}

interface Topic {
  _id: string;
  title: string;
  icon?: string;
}

interface Exercise {
  _id: string;
  question: string;
  type: string;
  difficulty: string;
  topicId: { _id: string; title: string } | string;
}

export default function QuestionBankManagement() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topicId: '',
    questions: [] as Array<{ exerciseId: string; order: number; points: number }>,
    duration: 30,
    passingScore: 70,
    shuffleQuestions: false,
    isPublished: true
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && userData && !userData.isAdmin) {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();

        const [quizzesRes, exercisesRes, topicsRes] = await Promise.all([
          fetch('/api/admin/quizzes', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/exercises', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/topics', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (quizzesRes.ok) {
          const data = await quizzesRes.json();
          setQuizzes(Array.isArray(data) ? data : []);
        }

        if (exercisesRes.ok) {
          const data = await exercisesRes.json();
          setExercises(data.exercises || []);
        }

        if (topicsRes.ok) {
          const data = await topicsRes.json();
          setTopics(data.topics || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (userData?.isAdmin) {
      fetchData();
    }
  }, [user, userData]);

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExercises = exercises.filter(exercise => {
    if (filterTopic !== 'all') {
      const topicId = typeof exercise.topicId === 'object' ? exercise.topicId._id : exercise.topicId;
      if (topicId !== filterTopic) return false;
    }
    if (filterDifficulty !== 'all' && exercise.difficulty !== filterDifficulty) {
      return false;
    }
    return true;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      topicId: '',
      questions: [],
      duration: 30,
      passingScore: 70,
      shuffleQuestions: false,
      isPublished: true
    });
    setSelectedExercises([]);
    setFilterTopic('all');
    setFilterDifficulty('all');
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/quizzes', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: quiz._id,
          isPublished: !quiz.isPublished
        })
      });

      if (response.ok) {
        const updatedQuiz = await response.json();
        setQuizzes(quizzes.map(q => q._id === quiz._id ? updatedQuiz : q));
        showToast(`Đã ${!quiz.isPublished ? 'công khai' : 'ẩn'} bài kiểm tra`, 'success');
      } else {
        showToast('Không thể cập nhật trạng thái', 'error');
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      showToast('Đã xảy ra lỗi', 'error');
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    
    // Lấy danh sách exerciseId từ questions
    // exerciseId có thể là object (đã populate) hoặc string (ObjectId)
    const exerciseIds = quiz.questions.map(q => {
      if (typeof q.exerciseId === 'string') {
        return q.exerciseId;
      }
      return q.exerciseId._id || q.exerciseId;
    });
    
    // Set selectedExercises trước
    setSelectedExercises(exerciseIds as string[]);
    
    // Reset filters
    setFilterTopic('all');
    setFilterDifficulty('all');
    
    // Set formData với exerciseId đã được extract đúng
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      topicId: quiz.topicId?._id || '',
      questions: quiz.questions.map(q => ({
        exerciseId: typeof q.exerciseId === 'string' ? q.exerciseId : (q.exerciseId._id || q.exerciseId),
        order: q.order,
        points: q.points
      })),
      duration: quiz.duration || 30,
      passingScore: quiz.passingScore,
      shuffleQuestions: quiz.shuffleQuestions,
      isPublished: quiz.isPublished
    });
    
    setShowEditModal(true);
  };

  const handleDelete = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowDeleteModal(true);
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    // Kiểm tra xem đã chọn chưa
    const isSelected = selectedExercises.includes(exerciseId);
    
    if (isSelected) {
      // Bỏ chọn
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
      setFormData({
        ...formData,
        questions: formData.questions.filter(q => q.exerciseId !== exerciseId)
      });
    } else {
      // Thêm vào
      setSelectedExercises([...selectedExercises, exerciseId]);
      setFormData({
        ...formData,
        questions: [...formData.questions, {
          exerciseId,
          order: formData.questions.length + 1,
          points: 10
        }]
      });
    }
  };

  const handleAddQuiz = async () => {
    if (!user || !formData.title) {
      showToast('Vui lòng điền tên bài kiểm tra', 'error');
      return;
    }

    if (formData.questions.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 câu hỏi', 'error');
      return;
    }

    try {
      const token = await user.getIdToken();
      console.log('Sending quiz data:', formData);
      
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const newQuiz = await response.json();
        setQuizzes([newQuiz, ...quizzes]);
        setShowAddModal(false);
        resetForm();
        showToast('Tạo bài kiểm tra thành công!', 'success');
      } else {
        const error = await response.json();
        console.error('API error:', error);
        showToast(error.error || 'Không thể tạo bài kiểm tra', 'error');
      }
    } catch (error) {
      console.error('Error adding quiz:', error);
      showToast('Đã xảy ra lỗi khi tạo bài kiểm tra', 'error');
    }
  };

  const handleEditQuiz = async () => {
    if (!user || !selectedQuiz) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/quizzes', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedQuiz._id,
          ...formData
        })
      });

      if (response.ok) {
        const updatedQuiz = await response.json();
        setQuizzes(quizzes.map(q => q._id === selectedQuiz._id ? updatedQuiz : q));
        setShowEditModal(false);
        setSelectedQuiz(null);
        resetForm();
        showToast('Cập nhật bài kiểm tra thành công!', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Không thể cập nhật bài kiểm tra', 'error');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      showToast('Đã xảy ra lỗi khi cập nhật bài kiểm tra', 'error');
    }
  };

  const handleDeleteQuiz = async () => {
    if (!user || !selectedQuiz) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/quizzes?id=${selectedQuiz._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
        setShowDeleteModal(false);
        setSelectedQuiz(null);
        showToast('Xóa bài kiểm tra thành công!', 'success');
      } else {
        showToast('Không thể xóa bài kiểm tra', 'error');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showToast('Đã xảy ra lỗi khi xóa bài kiểm tra', 'error');
    }
  };

  if (loading || !user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData?.isAdmin) return null;

  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL
  };

  const optimizedPhoto = displayData.photoURL?.includes('googleusercontent.com')
    ? displayData.photoURL.replace('=s96-c', '=s400-c')
    : displayData.photoURL;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="text-4xl">☃️</div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                LingoBros
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
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
                  <img src={optimizedPhoto} alt={displayData.displayName} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {displayData.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-gray-100 font-semibold text-sm">{displayData.displayName}</span>
                  <span className="text-xs text-yellow-400">Admin</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Quản lý Kiểm tra</h1>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              Tạo bài kiểm tra
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài kiểm tra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Quizzes Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            {loadingData ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Chưa có bài kiểm tra nào</h3>
                <p className="text-gray-500">Nhấn "Tạo bài kiểm tra" để tạo bài kiểm tra đầu tiên</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tên bài kiểm tra</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Số câu</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Thời gian</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Điểm đạt</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredQuizzes.map((quiz) => (
                      <tr key={quiz._id} className="hover:bg-gray-800/30 transition">
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{quiz.title}</div>
                          {quiz.description && (
                            <div className="text-sm text-gray-400 mt-1">{quiz.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-300">{quiz.questions.length}</td>
                        <td className="px-6 py-4 text-center text-gray-300">
                          {quiz.duration ? `${quiz.duration} phút` : 'Không giới hạn'}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-300">{quiz.passingScore}%</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                            quiz.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {quiz.isPublished ? 'Công khai' : 'Ẩn'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleTogglePublish(quiz)}
                              className={`p-2 rounded-lg transition ${
                                quiz.isPublished
                                  ? 'text-green-400 hover:bg-green-500/10'
                                  : 'text-gray-400 hover:bg-gray-500/10'
                              }`}
                              title={quiz.isPublished ? 'Ẩn' : 'Hiện'}
                            >
                              {quiz.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEdit(quiz)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(quiz)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-6xl h-[85vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
              <h3 className="text-xl font-bold text-white">
                {showEditModal ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedQuiz(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Left Column - Fixed Form */}
                <div className="p-6 space-y-4 border-r border-gray-800 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tên bài kiểm tra <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="VD: Kiểm tra giữa khóa"
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Mô tả ngắn về bài kiểm tra..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Thời gian (phút)</label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Điểm đạt (%)</label>
                      <input
                        type="number"
                        value={formData.passingScore}
                        onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        Số câu đã chọn
                      </span>
                      <span className="text-2xl font-bold text-blue-400">
                        {selectedExercises.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Chọn câu hỏi từ ngân hàng bên phải
                    </p>
                  </div>
                </div>

                {/* Right Column - Scrollable Question Bank */}
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="p-6 pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-300">
                        Ngân hàng câu hỏi ({exercises.length} câu)
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={filterTopic}
                        onChange={(e) => setFilterTopic(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">Tất cả chủ đề</option>
                        {topics.map(topic => (
                          <option key={topic._id} value={topic._id}>{topic.title}</option>
                        ))}
                      </select>

                      <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">Tất cả mức độ</option>
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 px-6 pb-6 overflow-y-auto min-h-0">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg min-h-full">
                      {filteredExercises.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Không có câu hỏi nào</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700">
                          {filteredExercises.map((exercise) => (
                            <div
                              key={exercise._id}
                              onClick={() => toggleExerciseSelection(exercise._id)}
                              className={`p-3 cursor-pointer transition ${
                                selectedExercises.includes(exercise._id)
                                  ? 'bg-blue-600/20 border-l-4 border-blue-500'
                                  : 'hover:bg-gray-700/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  selectedExercises.includes(exercise._id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-600'
                                }`}>
                                  {selectedExercises.includes(exercise._id) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white text-sm mb-2 line-clamp-2">{exercise.question}</div>
                                  <div className="flex gap-2">
                                    <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                                      {exercise.type === 'multiple-choice' ? 'Trắc nghiệm' :
                                       exercise.type === 'fill-blank' ? 'Điền từ' :
                                       exercise.type === 'word-order' ? 'Sắp xếp' :
                                       exercise.type === 'match' ? 'Nối câu' : exercise.type}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      exercise.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                                      exercise.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                                      'bg-red-600/20 text-red-400'
                                    }`}>
                                      {exercise.difficulty === 'easy' ? 'Dễ' :
                                       exercise.difficulty === 'medium' ? 'TB' : 'Khó'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="bg-gray-900 border-t border-gray-800 px-6 py-4 flex gap-3 rounded-b-xl flex-shrink-0">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedQuiz(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={showEditModal ? handleEditQuiz : handleAddQuiz}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                {showEditModal ? 'Cập nhật bài kiểm tra' : 'Tạo bài kiểm tra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Xác nhận xóa</h3>
                  <p className="text-sm text-gray-400 mt-1">Bạn có chắc muốn xóa bài kiểm tra này?</p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
                <p className="text-white font-medium">{selectedQuiz.title}</p>
                <p className="text-sm text-gray-400 mt-1">{selectedQuiz.questions.length} câu hỏi</p>
              </div>
            </div>

            <div className="border-t border-gray-800 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedQuiz(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteQuiz}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-xl border flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-green-600/90 border-green-500 text-white'
              : 'bg-red-600/90 border-red-500 text-white'
          }`}>
            <div className="text-lg">
              {toast.type === 'success' ? '✓' : '✕'}
            </div>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
