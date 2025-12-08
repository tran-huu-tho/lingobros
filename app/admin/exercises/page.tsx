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
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'order' | 'points' | 'newest'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ 
    show: false, 
    message: '', 
    type: 'success' 
  });
  const exercisesPerPage = 10;

  const [formData, setFormData] = useState<{
    topicId: string;
    type: Exercise['type'];
    question: string;
    difficulty: Exercise['difficulty'];
    options: string[];
    correctAnswer: string;
    sentence: string;
    blanks: Array<{ position: number; answer: string }>;
    words: string[];
    correctOrder: string[];
    pairs: Array<{ left: string; right: string }>;
    explanation: string;
  }>({
    topicId: '',
    type: 'multiple-choice',
    question: '',
    difficulty: 'easy',
    options: ['', '', '', ''],
    correctAnswer: '',
    sentence: '',
    blanks: [{ position: 0, answer: '' }],
    words: [],
    correctOrder: [],
    pairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }],
    explanation: ''
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

    if (filterTopic !== 'all') {
      result = result.filter(ex => {
        const topicId = typeof ex.topicId === 'object' ? ex.topicId._id : ex.topicId;
        return topicId === filterTopic;
      });
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
  }, [searchQuery, filterType, filterTopic, sortBy, sortOrder, exercises]);

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const resetForm = () => {
    setFormData({
      topicId: '',
      type: 'multiple-choice',
      question: '',
      difficulty: 'easy',
      options: ['', '', '', ''],
      correctAnswer: '',
      sentence: '',
      blanks: [{ position: 0, answer: '' }],
      words: [],
      correctOrder: [],
      pairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }],
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
      difficulty: exercise.difficulty,
      options: exercise.options || ['', '', '', ''],
      correctAnswer: exercise.correctAnswer || '',
      sentence: exercise.sentence || '',
      blanks: exercise.blanks || [{ position: 0, answer: '' }],
      words: exercise.words || [],
      correctOrder: exercise.correctOrder || [],
      pairs: exercise.pairs || [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }],
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
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    // Validation cho từng dạng bài
    if (formData.type === 'multiple-choice' || formData.type === 'translate') {
      if (!formData.correctAnswer) {
        showToast('Vui lòng chọn đáp án đúng', 'error');
        return;
      }
      if (formData.options.some(opt => !opt.trim())) {
        showToast('Vui lòng điền đầy đủ các lựa chọn', 'error');
        return;
      }
    }

    if (formData.type === 'fill-blank') {
      if (!formData.sentence) {
        showToast('Vui lòng nhập câu có chỗ trống', 'error');
        return;
      }
      if (formData.blanks.some(blank => !blank.answer)) {
        showToast('Vui lòng điền đáp án cho chỗ trống', 'error');
        return;
      }
    }

    if (formData.type === 'word-order') {
      if (formData.words.length === 0 || formData.correctOrder.length === 0) {
        showToast('Vui lòng nhập các từ và thứ tự đúng', 'error');
        return;
      }
    }

    if (formData.type === 'match') {
      if (formData.pairs.some(pair => !pair.left || !pair.right)) {
        showToast('Vui lòng điền đầy đủ các cặp từ', 'error');
        return;
      }
    }

    try {
      const token = await user.getIdToken();
      console.log('Sending exercise data:', formData);
      
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
        showToast('Thêm bài tập thành công!', 'success');
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        showToast(error.error || 'Không thể tạo bài tập', 'error');
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
      showToast('Đã xảy ra lỗi khi tạo bài tập', 'error');
    }
  };

  const handleEditExercise = async () => {
    if (!user || !selectedExercise || !formData.question) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    // Validation cho từng dạng bài
    if (formData.type === 'multiple-choice' || formData.type === 'translate') {
      if (!formData.correctAnswer) {
        showToast('Vui lòng chọn đáp án đúng', 'error');
        return;
      }
      if (formData.options.some(opt => !opt.trim())) {
        showToast('Vui lòng điền đầy đủ các lựa chọn', 'error');
        return;
      }
    }

    if (formData.type === 'fill-blank') {
      if (!formData.sentence) {
        showToast('Vui lòng nhập câu có chỗ trống', 'error');
        return;
      }
      if (formData.blanks.some(blank => !blank.answer)) {
        showToast('Vui lòng điền đáp án cho chỗ trống', 'error');
        return;
      }
    }

    if (formData.type === 'word-order') {
      if (formData.words.length === 0 || formData.correctOrder.length === 0) {
        showToast('Vui lòng nhập các từ và thứ tự đúng', 'error');
        return;
      }
    }

    if (formData.type === 'match') {
      if (formData.pairs.some(pair => !pair.left || !pair.right)) {
        showToast('Vui lòng điền đầy đủ các cặp từ', 'error');
        return;
      }
    }

    try {
      const token = await user.getIdToken();
      console.log('Updating exercise:', { id: selectedExercise._id, ...formData });
      
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
        setExercises(exercises.map(e => 
          e._id === selectedExercise._id ? updatedExercise : e
        ));
        setShowEditModal(false);
        setSelectedExercise(null);
        resetForm();
        showToast('Cập nhật bài tập thành công!', 'success');
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        showToast(error.error || 'Không thể cập nhật bài tập', 'error');
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      showToast('Đã xảy ra lỗi khi cập nhật bài tập', 'error');
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
        showToast('Xóa bài tập thành công!', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Không thể xóa bài tập', 'error');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showToast('Đã xảy ra lỗi khi xóa bài tập', 'error');
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

                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {topics.map(topic => (
                    <option key={topic._id} value={topic._id}>{topic.title}</option>
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

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
              <h3 className="text-xl font-bold text-white">
                {showEditModal ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedExercise(null);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Topic & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chủ đề <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.topicId}
                    onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {topics.map(topic => (
                      <option key={topic._id} value={topic._id}>{topic.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dạng bài <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {EXERCISE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Câu hỏi <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nhập câu hỏi..."
                />
              </div>

              {/* Multiple Choice / Translate Options */}
              {(formData.type === 'multiple-choice' || formData.type === 'translate') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Các lựa chọn
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[index] = e.target.value;
                            setFormData({ ...formData, options: newOptions });
                          }}
                          placeholder={`Lựa chọn ${index + 1}`}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => setFormData({ ...formData, correctAnswer: option })}
                          className={`px-3 py-2 rounded-lg transition ${
                            formData.correctAnswer === option
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                          title="Đáp án đúng"
                        >
                          ✓
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fill Blank */}
              {formData.type === 'fill-blank' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Câu có chỗ trống (dùng ___ để đánh dấu)
                    </label>
                    <input
                      type="text"
                      value={formData.sentence}
                      onChange={(e) => setFormData({ ...formData, sentence: e.target.value })}
                      placeholder="Ví dụ: I ___ to school every day."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Đáp án
                    </label>
                    {formData.blanks.map((blank, index) => (
                      <input
                        key={index}
                        type="text"
                        value={blank.answer}
                        onChange={(e) => {
                          const newBlanks = [...formData.blanks];
                          newBlanks[index].answer = e.target.value;
                          newBlanks[index].position = index;
                          setFormData({ ...formData, blanks: newBlanks });
                        }}
                        placeholder="Đáp án"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 mb-2"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Word Order */}
              {formData.type === 'word-order' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Các từ (đã xáo trộn)
                    </label>
                    {formData.words.map((word, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={word}
                          onChange={(e) => {
                            const newWords = [...formData.words];
                            newWords[index] = e.target.value;
                            setFormData({ ...formData, words: newWords });
                          }}
                          placeholder={`Từ ${index + 1}`}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                        {formData.words.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newWords = formData.words.filter((_, i) => i !== index);
                              const newCorrectOrder = formData.correctOrder.filter((_, i) => i !== index);
                              setFormData({ ...formData, words: newWords, correctOrder: newCorrectOrder });
                            }}
                            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-700 text-red-400 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, words: [...formData.words, ''], correctOrder: [...formData.correctOrder, ''] })}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition text-sm"
                    >
                      + Thêm từ
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Thứ tự đúng
                    </label>
                    {formData.correctOrder.map((word, index) => (
                      <input
                        key={index}
                        type="text"
                        value={word}
                        onChange={(e) => {
                          const newCorrectOrder = [...formData.correctOrder];
                          newCorrectOrder[index] = e.target.value;
                          setFormData({ ...formData, correctOrder: newCorrectOrder });
                        }}
                        placeholder={`Từ ${index + 1}`}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 mb-2"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Match */}
              {formData.type === 'match' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Các cặp từ cần nối
                  </label>
                  {formData.pairs.map((pair, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={pair.left}
                        onChange={(e) => {
                          const newPairs = [...formData.pairs];
                          newPairs[index].left = e.target.value;
                          setFormData({ ...formData, pairs: newPairs });
                        }}
                        placeholder="Tiếng Anh"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={pair.right}
                        onChange={(e) => {
                          const newPairs = [...formData.pairs];
                          newPairs[index].right = e.target.value;
                          setFormData({ ...formData, pairs: newPairs });
                        }}
                        placeholder="Tiếng Việt"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      {formData.pairs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newPairs = formData.pairs.filter((_, i) => i !== index);
                            setFormData({ ...formData, pairs: newPairs });
                          }}
                          className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-700 text-red-400 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pairs: [...formData.pairs, { left: '', right: '' }] })}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition text-sm"
                  >
                    + Thêm cặp từ
                  </button>
                </div>
              )}

              {/* Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Độ khó</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Giải thích</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Giải thích đáp án (tùy chọn)..."
                />
              </div>
            </div>

            <div className="bg-gray-900 border-t border-gray-800 px-6 py-4 flex gap-3 rounded-b-xl flex-shrink-0">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedExercise(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={showEditModal ? handleEditExercise : handleAddExercise}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                {showEditModal ? 'Cập nhật' : 'Thêm bài tập'}
              </button>
            </div>
          </div>
        </div>
      )}

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
