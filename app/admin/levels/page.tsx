'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2, 
         ArrowLeft, Search, Filter, ChevronLeft, ChevronRight, Trash2, X, AlertTriangle, Plus, Edit2 } from 'lucide-react';
import Link from 'next/link';

interface Level {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  courseCount: number;
}

export default function LevelManagement() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<Level[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'courses' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const levelsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    color: '#3B82F6'
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

  // Fetch levels
  useEffect(() => {
    const fetchLevels = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/admin/levels', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLevels(data.levels);
          setFilteredLevels(data.levels);
        }
      } catch (error) {
        console.error('Error fetching levels:', error);
      } finally {
        setLoadingLevels(false);
      }
    };

    if (userData?.isAdmin) {
      fetchLevels();
    }
  }, [user, userData]);

  // Search and filter
  useEffect(() => {
    let result = [...levels];

    // Search
    if (searchQuery) {
      result = result.filter(level => 
        level.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        level.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        level.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.displayName || '').localeCompare(b.displayName || '');
          break;
        case 'courses':
          comparison = (a.courseCount || 0) - (b.courseCount || 0);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredLevels(result);
    setCurrentPage(1);
  }, [searchQuery, levels, sortBy, sortOrder]);

  // Pagination
  const indexOfLastLevel = currentPage * levelsPerPage;
  const indexOfFirstLevel = indexOfLastLevel - levelsPerPage;
  const currentLevels = filteredLevels.slice(indexOfFirstLevel, indexOfLastLevel);
  const totalPages = Math.ceil(filteredLevels.length / levelsPerPage);

  // Handle add level
  const handleAddLevel = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/levels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setLevels([...levels, data.level]);
        setShowAddModal(false);
        setFormData({ name: '', displayName: '', description: '', color: '#3B82F6' });
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể tạo cấp độ');
      }
    } catch (error) {
      console.error('Error adding level:', error);
      alert('Đã xảy ra lỗi khi tạo cấp độ');
    }
  };

  // Handle edit level
  const handleEditLevel = async () => {
    if (!user || !selectedLevel) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/levels/${selectedLevel._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setLevels(levels.map(l => l._id === selectedLevel._id ? data.level : l));
        setShowEditModal(false);
        setSelectedLevel(null);
        setFormData({ name: '', displayName: '', description: '', color: '#3B82F6' });
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể cập nhật cấp độ');
      }
    } catch (error) {
      console.error('Error editing level:', error);
      alert('Đã xảy ra lỗi khi cập nhật cấp độ');
    }
  };

  // Handle delete level
  const handleDeleteLevel = async () => {
    if (!user || !selectedLevel) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/levels/${selectedLevel._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLevels(levels.filter(l => l._id !== selectedLevel._id));
        setShowDeleteModal(false);
        setSelectedLevel(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Không thể xóa cấp độ');
      }
    } catch (error) {
      console.error('Error deleting level:', error);
      alert('Đã xảy ra lỗi khi xóa cấp độ');
    }
  };

  // Open edit modal
  const openEditModal = (level: Level) => {
    setSelectedLevel(level);
    setFormData({
      name: level.name,
      displayName: level.displayName,
      description: level.description,
      color: level.color
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (level: Level) => {
    setSelectedLevel(level);
    setShowDeleteModal(true);
  };

  if (loading || !user || loadingLevels) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData?.isAdmin) {
    return null;
  }

  const displayData = userData || {
    displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
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
                <span className="text-gray-300">{displayData.displayName}</span>
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
          

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Quản lý cấp độ</h1>
            <button
              onClick={() => {
                setFormData({ name: '', displayName: '', description: '', color: '#3B82F6' });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition"
            >
              <Plus className="w-5 h-5" />
              Thêm cấp độ mới
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên cấp độ..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:bg-gray-800/50 transition"
                >
                  <Filter className="w-5 h-5" />
                  Sắp xếp
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-gray-900 border border-gray-800 shadow-xl overflow-hidden z-10">
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Sắp xếp theo</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="name">Tên</option>
                          <option value="courses">Số khóa học</option>
                          <option value="date">Ngày tạo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Thứ tự</label>
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="asc">Tăng dần</option>
                          <option value="desc">Giảm dần</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Levels Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">STT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tên cấp độ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Số khóa học</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {currentLevels.map((level, index) => (
                  <tr key={level._id} className="hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4 text-gray-300">{indexOfFirstLevel + index + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{level.displayName}</div>
                        <div className="text-sm text-gray-400">{level.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                        {level.courseCount} khóa học
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(level)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition text-blue-400"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(level)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition text-red-400"
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
              <div className="text-sm text-gray-400">
                Hiển thị {indexOfFirstLevel + 1}-{Math.min(indexOfLastLevel, filteredLevels.length)} trong số {filteredLevels.length} cấp độ
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg transition ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
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
        
        </div>
      </main>

      {/* Add Level Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Thêm cấp độ mới</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tên ID (viết thường, không dấu)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="beginner, intermediate..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tên hiển thị</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Cơ bản, Trung cấp..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về cấp độ này..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Màu sắc</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={handleAddLevel}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Thêm cấp độ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Level Modal */}
      {showEditModal && selectedLevel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Chỉnh sửa cấp độ</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tên ID (viết thường, không dấu)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="beginner, intermediate..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tên hiển thị</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Cơ bản, Trung cấp..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về cấp độ này..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Màu sắc</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={handleEditLevel}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLevel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Xác nhận xóa</h2>
            </div>

            <p className="text-gray-300 mb-4">
              Bạn có chắc chắn muốn xóa cấp độ <span className="font-bold text-white">{selectedLevel.displayName}</span>?
            </p>

            {selectedLevel.courseCount > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>
                    Không thể xóa! Hiện có <strong>{selectedLevel.courseCount} khóa học</strong> đang sử dụng cấp độ này. 
                    Vui lòng xóa hoặc chuyển các khóa học sang cấp độ khác trước.
                  </span>
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteLevel}
                disabled={selectedLevel.courseCount > 0}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
