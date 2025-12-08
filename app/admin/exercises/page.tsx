'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2,
         Search, Plus, Edit2, Trash2, X, AlertTriangle, Filter, Eye, EyeOff, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Topic {
  _id: string;
  title: string;
  icon?: string;
}

interface Exercise {
  _id: string;
  topicId: Topic | string;
  type: string;
  question: string;
  order: number;
  points: number;
  difficulty: string;
  options?: string[];
  correctAnswer?: string;
  sentence?: string;
  blanks?: Array<{ position: number; answer: string }>;
  words?: string[];
  correctOrder?: string[];
  pairs?: Array<{ left: string; right: string }>;
  explanation?: string;
  createdAt: string;
}

const EXERCISE_TYPES = [
  { value: 'multiple-choice', label: 'Trắc nghiệm' },
  { value: 'fill-blank', label: 'Điền từ' },
  { value: 'translate', label: 'Dịch nghĩa' },
  { value: 'word-order', label: 'Sắp xếp câu' },
  { value: 'match', label: 'Nối câu' }
];

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Dễ', color: 'text-green-400' },
  { value: 'medium', label: 'Trung bình', color: 'text-yellow-400' },
  { value: 'hard', label: 'Khó', color: 'text-red-400' }
];

export default function ExercisesManagement() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'order' | 'points' | 'newest'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [topics, setTopics] = useState<Topic[]>([]);
  const exercisesPerPage = 10;

  const [formData, setFormData] = useState({
    topicId: '',
    type: 'multiple-choice',
    question: '',
    order: 1,
    points: 10,
    difficulty: 'easy',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

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
        
        const [exercisesRes, topicsRes] = await Promise.all([
          fetch('/api/admin/exercises', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/topics', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        console.log('Exercises response status:', exercisesRes.status);
        console.log('Topics response status:', topicsRes.status);

        if (exercisesRes.ok) {
          const data = await exercisesRes.json();
          console.log('📝 Exercises loaded:', data.exercises);
          setExercises(data.exercises || []);
          setFilteredExercises(data.exercises || []);
        } else {
          const error = await exercisesRes.json();
          console.error('❌ Exercises error:', error);
        }

        if (topicsRes.ok) {
          const data = await topicsRes.json();
          console.log('📚 Topics loaded:', data.topics);
          setTopics(data.topics || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingExercises(false);
      }
    };

    if (userData?.isAdmin) {
      fetchData();
    }
  }, [user, userData]);

  useEffect(() => {
    let result = [...exercises];

    if (searchQuery) {
      result = result.filter(ex =>
        ex.question?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      result = result.filter(ex => ex.type === filterType);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'order':
          comparison = (a.order || 0) - (b.order || 0);
          break;
        case 'points':
          comparison = (a.points || 0) - (b.points || 0);
          break;
        case 'newest':
          comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredExercises(result);
    setCurrentPage(1);
  }, [searchQuery, filterType, sortBy, sortOrder, exercises]);

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const resetForm = () => {
    setFormData({
      topicId: topics[0]?._id || '',
      type: 'multiple-choice',
      question: '',
      order: 1,
      points: 10,
      difficulty: 'easy',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
  };

  const handleAdd = () => {
    resetForm();
    if (topics.length > 0) {
      setFormData(prev => ({ ...prev, topicId: topics[0]._id }));
    }
    setShowAddModal(true);
  };

  const handleEdit = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setFormData({
      topicId: typeof exercise.topicId === 'object' ? exercise.topicId._id : exercise.topicId,
      type: exercise.type,
      question: exercise.question,
      order: exercise.order,
      points: exercise.points,
      difficulty: exercise.difficulty,
      options: exercise.options || ['', '', '', ''],
      correctAnswer: exercise.correctAnswer || '',
      explanation: exercise.explanation || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowDeleteModal(true);
  };

  const handleAddExercise = async () => {
    if (!user || !formData.question || !formData.topicId) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newExercise = await response.json();
        setExercises([...exercises, newExercise]);
        setShowAddModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể tạo bài tập');
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Đã xảy ra lỗi khi tạo bài tập');
    }
  };

  const handleEditExercise = async () => {
    if (!user || !selectedExercise || !formData.question) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/exercises', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedExercise._id,
          ...formData
        })
      });

      if (response.ok) {
        const updatedExercise = await response.json();
        setExercises(exercises.map(ex => ex._id === selectedExercise._id ? updatedExercise : ex));
        setShowEditModal(false);
        setSelectedExercise(null);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể cập nhật bài tập');
      }
    } catch (error) {
      console.error('Error editing exercise:', error);
      alert('Đã xảy ra lỗi khi cập nhật bài tập');
    }
  };

  const handleDeleteExercise = async () => {
    if (!user || !selectedExercise) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/exercises?id=${selectedExercise._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setExercises(exercises.filter(ex => ex._id !== selectedExercise._id));
        setShowDeleteModal(false);
        setSelectedExercise(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể xóa bài tập');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Đã xảy ra lỗi khi xóa bài tập');
    }
  };

  if (loading || !user || !userData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  const displayData = {
    displayName: userData?.displayName || user?.email?.split('@')[0] || 'User',
    email: userData?.email || user?.email || '',
    photoURL: userData?.photoURL || user?.photoURL || null
  };

  const userPhoto = userData?.photoURL || user?.photoURL;
  const optimizedPhoto = userPhoto?.includes('googleusercontent.com') && userPhoto?.includes('=s96-c')
    ? userPhoto.replace('=s96-c', '=s400-c')
    : userPhoto;

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
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 transition"
              >
                {optimizedPhoto ? (
                  <img 
                    src={optimizedPhoto} 
                    alt={displayData.displayName} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-gray-300 text-sm font-semibold">{displayData.displayName}</span>
                  <span className="text-xs text-yellow-400">Admin</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-gray-800 shadow-xl overflow-hidden">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition text-gray-300"
                  >
                    <User className="w-4 h-4" />
                    Hồ sơ
                  </Link>
                  <button 
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài tập..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả dạng</option>
                  {EXERCISE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>

                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Thêm bài tập
                </button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              Tổng số: <span className="text-white font-semibold">{filteredExercises.length}</span> bài tập
            </div>
          </div>

          {/* Exercises Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            {loadingExercises ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-400">Đang tải...</div>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <BookOpen className="w-20 h-20 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Chưa có bài tập nào</h3>
                <p className="text-gray-500">Nhấn "Thêm bài tập" để tạo bài tập đầu tiên</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">STT</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Câu hỏi</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Chủ đề</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Dạng</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Điểm</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Độ khó</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {currentExercises.map((exercise, index) => (
                        <tr key={exercise._id} className="hover:bg-gray-800/30 transition">
                          <td className="px-6 py-4 text-gray-300">{indexOfFirstExercise + index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium line-clamp-2">{exercise.question}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-300">
                              {typeof exercise.topicId === 'object' ? exercise.topicId.title : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400">
                              {EXERCISE_TYPES.find(t => t.value === exercise.type)?.label || exercise.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-yellow-400 font-medium">{exercise.points}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={DIFFICULTY_LEVELS.find(d => d.value === exercise.difficulty)?.color || 'text-gray-400'}>
                              {DIFFICULTY_LEVELS.find(d => d.value === exercise.difficulty)?.label || exercise.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(exercise)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                                title="Chỉnh sửa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(exercise)}
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

                {/* Pagination */}
                <div className="border-t border-gray-700 p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Hiển thị {indexOfFirstExercise + 1} - {Math.min(indexOfLastExercise, filteredExercises.length)} trong tổng số {filteredExercises.length} bài tập
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg transition ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Xác nhận xóa</h3>
                <p className="text-gray-400">Bạn có chắc muốn xóa bài tập này?</p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <p className="text-white font-medium line-clamp-2">{selectedExercise.question}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteExercise}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
