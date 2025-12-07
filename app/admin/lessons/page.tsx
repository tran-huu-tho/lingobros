'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2,
         Search, Plus, Edit2, Trash2, X, AlertTriangle, BookOpen, Filter, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  level: string;
}

interface Topic {
  _id: string;
  title: string;
  description?: string;
  courseId: Course | string;
  order: number;
  xpReward: number;
  color: string;
  estimatedMinutes: number;
  totalLessons: number;
  isLocked: boolean;
  isPublished: boolean;
  createdAt: string;
}

export default function TopicsManagement() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'newest' | 'oldest'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const topicsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    order: 1,
    xpReward: 50,
    color: '#FFC4899',
    estimatedMinutes: 45,
    isLocked: false,
    isPublished: true
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

  // Fetch topics and courses
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        
        const [topicsRes, coursesRes] = await Promise.all([
          fetch('/api/admin/topics', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/courses', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (topicsRes.ok) {
          const data = await topicsRes.json();
          console.log('📚 Topics loaded:', data.topics);
          setTopics(data.topics);
          setFilteredTopics(data.topics);
        }

        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingTopics(false);
      }
    };

    if (userData?.isAdmin) {
      fetchData();
    }
  }, [user, userData]);

  // Search and sort
  useEffect(() => {
    let result = [...topics];

    if (searchQuery) {
      result = result.filter(topic =>
        topic.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'order':
          comparison = (a.order || 0) - (b.order || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'newest':
          comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTopics(result);
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder, topics]);

  // Pagination
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = filteredTopics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      order: 1,
      xpReward: 50,
      color: '#FFC4899',
      estimatedMinutes: 45,
      isLocked: false,
      isPublished: true
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (topic: Topic) => {
    setSelectedTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description || '',
      courseId: typeof topic.courseId === 'object' ? topic.courseId._id : topic.courseId,
      order: topic.order,
      xpReward: topic.xpReward,
      color: topic.color,
      estimatedMinutes: topic.estimatedMinutes,
      isLocked: topic.isLocked,
      isPublished: topic.isPublished
    });
    setShowEditModal(true);
  };

  const handleDelete = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowDeleteModal(true);
  };

  const handleAddTopic = async () => {
    if (!user || !formData.title || !formData.courseId) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newTopic = await response.json();
        setTopics([...topics, newTopic]);
        setShowAddModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể tạo chủ đề');
      }
    } catch (error) {
      console.error('Error adding topic:', error);
      alert('Đã xảy ra lỗi khi tạo chủ đề');
    }
  };

  const handleEditTopic = async () => {
    if (!user || !selectedTopic || !formData.title) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/topics', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedTopic._id,
          ...formData
        })
      });

      if (response.ok) {
        const updatedTopic = await response.json();
        setTopics(topics.map(t => t._id === selectedTopic._id ? updatedTopic : t));
        setShowEditModal(false);
        setSelectedTopic(null);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể cập nhật chủ đề');
      }
    } catch (error) {
      console.error('Error editing topic:', error);
      alert('Đã xảy ra lỗi khi cập nhật chủ đề');
    }
  };

  const handleDeleteTopic = async () => {
    if (!user || !selectedTopic) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/topics?id=${selectedTopic._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTopics(topics.filter(t => t._id !== selectedTopic._id));
        setShowDeleteModal(false);
        setSelectedTopic(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể xóa chủ đề');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Đã xảy ra lỗi khi xóa chủ đề');
    }
  };

  const handleTogglePublish = async (topic: Topic) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/topics', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: topic._id,
          isPublished: !topic.isPublished
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(topics.map(t => t._id === topic._id ? { ...t, isPublished: !t.isPublished } : t));
        setFilteredTopics(filteredTopics.map(t => t._id === topic._id ? { ...t, isPublished: !t.isPublished } : t));
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
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
              {/* Search */}
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chủ đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filter & Add */}
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-blue-500 transition"
                  >
                    <Filter className="w-4 h-4" />
                    Sắp xếp
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="p-2">
                        <p className="text-xs text-gray-400 px-3 py-2">Sắp xếp theo:</p>
                        {[
                          { value: 'order', label: 'Thứ tự' },
                          { value: 'title', label: 'Tên chủ đề' },
                          { value: 'newest', label: 'Mới nhất' },
                          { value: 'oldest', label: 'Cũ nhất' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              if (sortBy === option.value) {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortBy(option.value as any);
                                setSortOrder('asc');
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition ${
                              sortBy === option.value 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {option.label} {sortBy === option.value && (sortOrder === 'asc' ? '↑' : '↓')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Thêm chủ đề
                </button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              Tổng số: <span className="text-white font-semibold">{filteredTopics.length}</span> chủ đề
            </div>
          </div>

          {/* Topics Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            {loadingTopics ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-400">Đang tải...</div>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <BookOpen className="w-20 h-20 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Chưa có chủ đề nào</h3>
                <p className="text-gray-500">Nhấn "Thêm chủ đề" để tạo chủ đề đầu tiên</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">STT</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Chủ đề</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Khóa học</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Số bài</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">XP</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Thời gian</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {currentTopics.map((topic, index) => (
                      <tr key={topic._id} className="hover:bg-gray-800/30 transition">
                        <td className="px-6 py-4 text-gray-300">{indexOfFirstTopic + index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color }}></div>
                            <div>
                              <div className="text-white font-medium">{topic.title}</div>
                              {topic.description && (
                                <div className="text-sm text-gray-400 line-clamp-1">{topic.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {typeof topic.courseId === 'object' ? topic.courseId.title : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-blue-400 font-medium">{topic.totalLessons || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-yellow-400 font-medium">{topic.xpReward}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-400">{topic.estimatedMinutes} phút</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {topic.isPublished ? (
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400">
                              Công khai
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-500/20 text-gray-400">
                              Nháp
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleTogglePublish(topic)}
                              className={`p-2 rounded-lg transition ${
                                topic.isPublished 
                                  ? 'text-green-400 hover:bg-green-500/10' 
                                  : 'text-gray-400 hover:bg-gray-500/10'
                              }`}
                              title={topic.isPublished ? 'Ẩn' : 'Hiện'}
                            >
                              {topic.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEdit(topic)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(topic)}
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

          {/* Pagination */}
          {filteredTopics.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Hiển thị {indexOfFirstTopic + 1} - {Math.min(indexOfLastTopic, filteredTopics.length)} trong tổng số {filteredTopics.length} chủ đề
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
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Thêm chủ đề mới</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Khóa học *</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tên chủ đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tên chủ đề..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về chủ đề này..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Thứ tự</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Điểm XP</label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 50 })}
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Thời gian ước tính (phút)</label>
                <input
                  type="number"
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 45 })}
                  min="1"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Màu sắc</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-700"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="#FFC4899"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLocked}
                    onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Khóa chủ đề</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Công khai</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleAddTopic}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Thêm chủ đề
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Chỉnh sửa chủ đề</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Khóa học *</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tên chủ đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tên chủ đề..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về chủ đề này..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Thứ tự</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Điểm XP</label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 50 })}
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Thời gian ước tính (phút)</label>
                <input
                  type="number"
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 45 })}
                  min="1"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Màu sắc</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-700"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="#FFC4899"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLocked}
                    onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Khóa chủ đề</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Công khai</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleEditTopic}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Xác nhận xóa</h3>
                <p className="text-gray-400">Bạn có chắc muốn xóa chủ đề này?</p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <p className="text-white font-medium">{selectedTopic.title}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteTopic}
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
