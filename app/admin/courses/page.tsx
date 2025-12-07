'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2,
         Plus, Edit2, Eye, EyeOff, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'grammar';
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  order: number;
  totalTopics: number;
  totalLessons: number;
  estimatedHours: number;
  isPublished: boolean;
  isActive: boolean;
}

const LEVEL_LABELS = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
  grammar: 'Ngữ pháp'
};

const LEVEL_COLORS = {
  beginner: 'bg-green-600/20 text-green-400',
  intermediate: 'bg-blue-600/20 text-blue-400',
  advanced: 'bg-purple-600/20 text-purple-400',
  grammar: 'bg-orange-600/20 text-orange-400'
};

export default function CourseManagement() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner' as Course['level'],
    icon: '📚',
    gradientFrom: '#EC4899',
    gradientTo: '#F97316',
    order: 1,
    estimatedHours: 10
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
    if (userData?.isAdmin) {
      fetchCourses();
    }
  }, [userData]);

  const fetchCourses = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = await user?.getIdToken();
      const url = '/api/admin/courses';
      const method = editingCourse ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingCourse ? { ...formData, _id: editingCourse._id } : formData)
      });

      if (response.ok) {
        await fetchCourses();
        setShowModal(false);
        setEditingCourse(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const token = await user?.getIdToken();
      await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: course._id,
          isPublished: !course.isPublished
        })
      });
      
      await fetchCourses();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/courses?id=${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchCourses();
        setShowDeleteModal(false);
        setDeletingCourse(null);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const confirmDelete = (course: Course) => {
    setDeletingCourse(course);
    setShowDeleteModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      level: course.level,
      icon: course.icon,
      gradientFrom: course.gradientFrom,
      gradientTo: course.gradientTo,
      order: course.order,
      estimatedHours: course.estimatedHours
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: 'beginner',
      icon: '📚',
      gradientFrom: '#EC4899',
      gradientTo: '#F97316',
      order: courses.length + 1,
      estimatedHours: 10
    });
  };

  if (loading || !user || loadingCourses) {
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
              <h1 className="text-3xl font-bold text-white mb-2">Quản lý Khóa học</h1>
              <p className="text-gray-400">Quản lý các khóa học và cấp độ</p>
            </div>
            <button
              onClick={() => {
                setEditingCourse(null);
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              Thêm khóa học
            </button>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition group"
              >
                {/* Header with gradient */}
                <div 
                  className="h-24 p-4 flex items-center gap-4"
                  style={{
                    background: `linear-gradient(135deg, ${course.gradientFrom} 0%, ${course.gradientTo} 100%)`
                  }}
                >
                  <div className="text-4xl">{course.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[course.level]}`}>
                      {LEVEL_LABELS[course.level]}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description || 'Chưa có mô tả'}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-gray-900/50 rounded-lg p-2">
                      <div className="text-blue-400 font-bold">{course.totalTopics}</div>
                      <div className="text-xs text-gray-500">Chuyên đề</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2">
                      <div className="text-purple-400 font-bold">{course.totalLessons}</div>
                      <div className="text-xs text-gray-500">Bài học</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2">
                      <div className="text-green-400 font-bold">{course.estimatedHours}h</div>
                      <div className="text-xs text-gray-500">Thời lượng</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition ${
                        course.isPublished
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {course.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {course.isPublished ? 'Hiện' : 'Ẩn'}
                    </button>
                    <button
                      onClick={() => openEditModal(course)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => confirmDelete(course)}
                      className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Chưa có khóa học nào</h3>
              <p className="text-gray-500">Nhấn "Thêm khóa học" để tạo khóa học đầu tiên</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingCourse ? 'Sửa khóa học' : 'Thêm khóa học mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tên khóa học</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cấp độ</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as Course['level'] })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="beginner">Cơ bản</option>
                      <option value="intermediate">Trung cấp</option>
                      <option value="advanced">Nâng cao</option>
                      <option value="grammar">Ngữ pháp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="📚"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Thứ tự</label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Thời lượng (giờ)</label>
                      <input
                        type="number"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Màu gradient (Từ)</label>
                      <input
                        type="color"
                        value={formData.gradientFrom}
                        onChange={(e) => setFormData({ ...formData, gradientFrom: e.target.value })}
                        className="w-full h-10 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Màu gradient (Đến)</label>
                      <input
                        type="color"
                        value={formData.gradientTo}
                        onChange={(e) => setFormData({ ...formData, gradientTo: e.target.value })}
                        className="w-full h-10 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-700 mt-6">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                >
                  <Save className="w-5 h-5" />
                  {editingCourse ? 'Cập nhật' : 'Tạo khóa học'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600/20 mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Xóa khóa học?</h2>
              <p className="text-gray-400 mb-4">
                Bạn có chắc chắn muốn xóa khóa học <strong className="text-white">"{deletingCourse.title}"</strong>?
              </p>
              
              <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3 mb-6">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Khóa học có <strong>{deletingCourse.totalTopics}</strong> chuyên đề. 
                  Bạn cần xóa hoặc chuyển các chuyên đề trước khi xóa khóa học.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingCourse(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deletingCourse._id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                >
                  Xóa khóa học
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
