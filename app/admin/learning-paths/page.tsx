'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2, Plus, Edit2, Trash2, X, Search, GripVertical, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface Topic {
  _id: string;
  title: string;
  icon?: string;
}

interface LearningPathTopic {
  topicId: string | { _id: string; title: string; icon?: string };
  order: number;
  isRequired: boolean;
}

interface LearningPath {
  _id: string;
  title: string;
  description?: string;
  purpose: 'travel' | 'study-abroad' | 'improvement' | 'exam' | 'other';
  icon?: string;
  color: string;
  topics: LearningPathTopic[];
  isActive: boolean;
  createdAt: string;
}

const PURPOSE_OPTIONS = [
  { value: 'travel', label: 'Du lịch', icon: '✈️', color: '#10B981' },
  { value: 'study-abroad', label: 'Du học', icon: '🎓', color: '#3B82F6' },
  { value: 'improvement', label: 'Cải thiện', icon: '📈', color: '#F59E0B' },
  { value: 'exam', label: 'Thi cử', icon: '📝', color: '#EF4444' },
  { value: 'other', label: 'Khác', icon: '🎯', color: '#8B5CF6' }
];

export default function LearningPathsManagement() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    purpose: 'travel' as LearningPath['purpose'],
    icon: '✈️',
    color: '#10B981',
    topics: [] as Array<{ topicId: string; order: number; isRequired: boolean }>,
    isActive: true
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
        const [pathsRes, topicsRes] = await Promise.all([
          fetch('/api/admin/learning-paths', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/topics', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (pathsRes.ok) {
          const data = await pathsRes.json();
          setPaths(Array.isArray(data) ? data : []);
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

  const filteredPaths = paths.filter(path => {
    if (filterPurpose !== 'all' && path.purpose !== filterPurpose) return false;
    if (searchQuery && !path.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      purpose: 'travel',
      icon: '✈️',
      color: '#10B981',
      topics: [],
      isActive: true
    });
    setSelectedTopics([]);
  };

  const handleAdd = () => {
    resetForm();
    setSelectedPath(null);
    setShowAddModal(true);
  };

  const handleEdit = (path: LearningPath) => {
    setSelectedPath(path);
    
    const topicIds = path.topics.map(t => 
      typeof t.topicId === 'string' ? t.topicId : t.topicId._id
    );
    setSelectedTopics(topicIds);
    
    setFormData({
      title: path.title,
      description: path.description || '',
      purpose: path.purpose,
      icon: path.icon || '✈️',
      color: path.color,
      topics: path.topics.map(t => ({
        topicId: typeof t.topicId === 'string' ? t.topicId : t.topicId._id,
        order: t.order,
        isRequired: t.isRequired
      })),
      isActive: path.isActive
    });
    
    setShowEditModal(true);
  };

  const handleDelete = (path: LearningPath) => {
    setSelectedPath(path);
    setShowDeleteModal(true);
  };

  const toggleTopicSelection = (topicId: string) => {
    const isSelected = selectedTopics.includes(topicId);
    
    if (isSelected) {
      setSelectedTopics(selectedTopics.filter(id => id !== topicId));
      setFormData({
        ...formData,
        topics: formData.topics.filter(t => t.topicId !== topicId)
      });
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
      setFormData({
        ...formData,
        topics: [...formData.topics, {
          topicId,
          order: formData.topics.length + 1,
          isRequired: true
        }]
      });
    }
  };

  const handleAddPath = async () => {
    if (!user || !formData.title) {
      showToast('Vui lòng điền tên lộ trình', 'error');
      return;
    }

    if (formData.topics.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 chuyên đề', 'error');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/learning-paths', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newPath = await response.json();
        setPaths([newPath, ...paths]);
        setShowAddModal(false);
        resetForm();
        showToast('Tạo lộ trình thành công!', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Không thể tạo lộ trình', 'error');
      }
    } catch (error) {
      console.error('Error adding path:', error);
      showToast('Đã xảy ra lỗi khi tạo lộ trình', 'error');
    }
  };

  const handleEditPath = async () => {
    if (!user || !selectedPath) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/learning-paths', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedPath._id,
          ...formData
        })
      });

      if (response.ok) {
        const updatedPath = await response.json();
        setPaths(paths.map(p => p._id === selectedPath._id ? updatedPath : p));
        setShowEditModal(false);
        setSelectedPath(null);
        resetForm();
        showToast('Cập nhật lộ trình thành công!', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Không thể cập nhật lộ trình', 'error');
      }
    } catch (error) {
      console.error('Error updating path:', error);
      showToast('Đã xảy ra lỗi khi cập nhật lộ trình', 'error');
    }
  };

  const handleDeletePath = async () => {
    if (!user || !selectedPath) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/learning-paths?id=${selectedPath._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPaths(paths.filter(p => p._id !== selectedPath._id));
        setShowDeleteModal(false);
        setSelectedPath(null);
        showToast('Xóa lộ trình thành công!', 'success');
      } else {
        showToast('Không thể xóa lộ trình', 'error');
      }
    } catch (error) {
      console.error('Error deleting path:', error);
      showToast('Đã xảy ra lỗi khi xóa lộ trình', 'error');
    }
  };

  const handleToggleActive = async (path: LearningPath) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/learning-paths', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: path._id,
          isActive: !path.isActive
        })
      });

      if (response.ok) {
        const updatedPath = await response.json();
        setPaths(paths.map(p => p._id === path._id ? updatedPath : p));
        showToast(`Đã ${!path.isActive ? 'kích hoạt' : 'vô hiệu hóa'} lộ trình`, 'success');
      } else {
        showToast('Không thể cập nhật trạng thái', 'error');
      }
    } catch (error) {
      console.error('Error toggling active:', error);
      showToast('Đã xảy ra lỗi', 'error');
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

  const displayData = userData || { displayName: user.displayName || 'Admin' };
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
              <h1 className="text-3xl font-bold text-white mb-2">Quản lý Lộ trình học</h1>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              Tạo lộ trình
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm lộ trình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả mục tiêu</option>
              {PURPOSE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
              ))}
            </select>
          </div>

          {/* Paths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingData ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredPaths.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Chưa có lộ trình nào</h3>
                <p className="text-gray-500">Nhấn "Tạo lộ trình" để tạo lộ trình đầu tiên</p>
              </div>
            ) : (
              filteredPaths.map((path) => (
                <div
                  key={path._id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition group"
                >
                  {/* Header with color */}
                  <div 
                    className="h-24 p-4 flex items-center gap-4"
                    style={{ backgroundColor: path.color }}
                  >
                    <div className="text-4xl">{path.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{path.title}</h3>
                      <p className="text-white/80 text-sm">
                        {PURPOSE_OPTIONS.find(p => p.value === path.purpose)?.label}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {path.description || 'Chưa có mô tả'}
                    </p>
                    
                    <div className="bg-gray-900/50 rounded-lg p-3 mb-4 text-center">
                      <div className="text-blue-400 font-bold text-2xl">{path.topics.length}</div>
                      <div className="text-xs text-gray-500">Chuyên đề</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(path)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition ${
                          path.isActive
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                        title={path.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                      >
                        {path.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(path)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(path)}
                        className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-6xl h-[85vh] flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-xl shrink-0">
              <h3 className="text-xl font-bold text-white">
                {showEditModal ? 'Chỉnh sửa lộ trình' : 'Tạo lộ trình mới'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedPath(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-[400px_1fr] gap-0 h-full">
                {/* Left Column - Form */}
                <div className="p-6 space-y-4 border-r border-gray-800 overflow-y-auto bg-gray-900/50">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tên lộ trình <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="VD: Lộ trình tiếng Anh cho du lịch"
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
                      placeholder="Mô tả về lộ trình học..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mục tiêu học</label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => {
                        const purpose = PURPOSE_OPTIONS.find(p => p.value === e.target.value);
                        setFormData({ 
                          ...formData, 
                          purpose: e.target.value as any,
                          icon: purpose?.icon || '🎯',
                          color: purpose?.color || '#8B5CF6'
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      {PURPOSE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">Số chuyên đề đã chọn</span>
                      <span className="text-2xl font-bold text-blue-400">{selectedTopics.length}</span>
                    </div>
                    <p className="text-xs text-gray-500">Chọn chuyên đề từ danh sách bên phải</p>
                  </div>
                </div>

                {/* Right Column - Topics Selection */}
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="p-6 pb-3 shrink-0">
                    <label className="text-sm font-medium text-gray-300 block mb-3">
                      Danh sách chuyên đề ({topics.length} chuyên đề)
                    </label>
                  </div>

                  <div className="flex-1 px-6 pb-6 overflow-y-auto min-h-0">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg min-h-full">
                      {topics.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <div className="text-4xl mb-3">📚</div>
                          <p>Không có chuyên đề nào</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700">
                          {topics.map((topic) => (
                            <div
                              key={topic._id}
                              onClick={() => toggleTopicSelection(topic._id)}
                              className={`p-3 cursor-pointer transition ${
                                selectedTopics.includes(topic._id)
                                  ? 'bg-blue-600/20 border-l-4 border-blue-500'
                                  : 'hover:bg-gray-700/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                  selectedTopics.includes(topic._id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-600'
                                }`}>
                                  {selectedTopics.includes(topic._id) && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-white text-sm font-medium">{topic.title}</div>
                                  {topic.icon && <div className="text-gray-400 text-xs mt-1">{topic.icon}</div>}
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

            {/* Footer */}
            <div className="bg-gray-900 border-t border-gray-800 px-6 py-4 flex gap-3 rounded-b-xl shrink-0">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedPath(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={showEditModal ? handleEditPath : handleAddPath}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                {showEditModal ? 'Cập nhật lộ trình' : 'Tạo lộ trình'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPath && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Xác nhận xóa</h3>
                  <p className="text-sm text-gray-400 mt-1">Bạn có chắc muốn xóa lộ trình này?</p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
                <p className="text-white font-medium">{selectedPath.title}</p>
                <p className="text-sm text-gray-400 mt-1">{selectedPath.topics.length} chuyên đề</p>
              </div>
            </div>

            <div className="border-t border-gray-800 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPath(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeletePath}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-60 animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-xl border flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-green-600/90 border-green-500 text-white'
              : 'bg-red-600/90 border-red-500 text-white'
          }`}>
            <div className="text-lg">{toast.type === 'success' ? '✓' : '✕'}</div>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
