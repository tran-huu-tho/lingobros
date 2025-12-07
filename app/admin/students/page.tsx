'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, User, LogOut, Home, BarChart3, Languages, MessageSquare, Volume2, 
         ArrowLeft, Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Student {
  _id: string;
  displayName: string;
  level: string;
  xp: number;
  streak: number;
  studyTime: number;
  learningGoal: string;
  createdAt: string;
  photoURL?: string;
}

export default function StudentManagement() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'xp' | 'streak' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const studentsPerPage = 10;

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

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/admin/students', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students);
          setFilteredStudents(data.students);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };

    if (userData?.isAdmin) {
      fetchStudents();
    }
  }, [user, userData]);

  // Search and filter
  useEffect(() => {
    let result = [...students];

    // Search
    if (searchQuery) {
      result = result.filter(student => 
        student.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.displayName || '').localeCompare(b.displayName || '');
          break;
        case 'xp':
          comparison = (a.xp || 0) - (b.xp || 0);
          break;
        case 'streak':
          comparison = (a.streak || 0) - (b.streak || 0);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredStudents(result);
    setCurrentPage(1);
  }, [searchQuery, students, sortBy, sortOrder]);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Export to Excel
  const exportToExcel = () => {
    const headers = ['STT', 'Họ tên', 'Trình độ', 'Điểm XP', 'Chuỗi ngày', 'Mục tiêu học/ngày', 'Loại mục tiêu', 'Ngày tham gia'];
    const rows = filteredStudents.map((student, index) => [
      index + 1,
      student.displayName || 'N/A',
      student.level || 'beginner',
      student.xp || 0,
      student.streak || 0,
      (student.studyTime || 0) + ' phút/ngày',
      student.learningGoal || 'Chưa đặt mục tiêu',
      new Date(student.createdAt).toLocaleDateString('vi-VN')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `danh-sach-hoc-vien-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading || !user || loadingStudents) {
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
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition group"
              >
                {optimizedPhoto ? (
                  <img 
                    src={optimizedPhoto} 
                    alt={displayData.displayName || 'Admin'}
                    className="w-9 h-9 rounded-full object-cover shadow-lg group-hover:shadow-blue-500/50 transition-shadow"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                    {displayData.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-gray-100 font-semibold text-sm leading-tight">
                    {displayData.displayName}
                  </span>
                  <span className="text-xs text-yellow-400">Admin</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 bg-linear-to-br from-blue-600/20 to-purple-600/20 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      {optimizedPhoto ? (
                        <img 
                          src={optimizedPhoto} 
                          alt={displayData.displayName || 'Admin'}
                          className="w-12 h-12 rounded-full object-cover shadow-lg"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {displayData.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{displayData.displayName}</p>
                        <p className="text-xs text-yellow-400">Quản trị viên</p>
                      </div>
                    </div>
                  </div>
                  
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
        <div className="max-w-7xl mx-auto">
          {/* Back Button & Title */}
          {/* <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </Link>
            <h1 className="text-3xl font-bold text-white">Quản lý học viên</h1>
          </div> */}

          {/* Toolbar */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm học viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filter & Export */}
              <div className="flex gap-2">
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
                          { value: 'name', label: 'Tên' },
                          { value: 'xp', label: 'Điểm XP' },
                          { value: 'streak', label: 'Chuỗi ngày' },
                          { value: 'date', label: 'Ngày tham gia' }
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
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-4 text-sm text-gray-400">
              <span>Tổng số: <strong className="text-white">{filteredStudents.length}</strong> học viên</span>
              {searchQuery && (
                <span>Tìm thấy: <strong className="text-blue-400">{filteredStudents.length}</strong> kết quả</span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">STT</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Học viên</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Trình độ</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Điểm XP</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Chuỗi ngày</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Mục tiêu/ngày</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Loại mục tiêu</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentStudents.length > 0 ? (
                    currentStudents.map((student, index) => {
                      const levelMap: Record<string, { text: string; color: string }> = {
                        beginner: { text: 'Cơ bản', color: 'bg-green-600/20 text-green-400' },
                        intermediate: { text: 'Trung cấp', color: 'bg-yellow-600/20 text-yellow-400' },
                        advanced: { text: 'Nâng cao', color: 'bg-red-600/20 text-red-400' }
                      };
                      const goalMap: Record<string, string> = {
                        communication: 'Giao tiếp',
                        'study-abroad': 'Du học',
                        exam: 'Thi cử',
                        improvement: 'Cải thiện',
                        casual: 'Thư giãn',
                        regular: 'Thường xuyên',
                        serious: 'Nghiêm túc',
                        intense: 'Chuyên sâu',
                        other: 'Khác'
                      };
                      const level = levelMap[student.level] || levelMap.beginner;
                      return (
                        <tr key={student._id} className="hover:bg-gray-700/30 transition">
                          <td className="px-4 py-4 text-gray-300">
                            {indexOfFirstStudent + index + 1}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {student.photoURL ? (
                                <img 
                                  src={student.photoURL} 
                                  alt={student.displayName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                  {student.displayName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                              <span className="text-white font-medium">{student.displayName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                              {level.text}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600/20 text-blue-400">
                              {student.xp || 0} XP
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-600/20 text-orange-400">
                              {student.streak || 0} ngày
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-600/20 text-purple-400">
                              {student.studyTime || 0} phút
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-300 text-sm">
                            {goalMap[student.learningGoal] || student.learningGoal || 'Chưa đặt'}
                          </td>
                          <td className="px-4 py-4 text-center text-gray-300">
                            {new Date(student.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        Không tìm thấy học viên nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Hiển thị {indexOfFirstStudent + 1} - {Math.min(indexOfLastStudent, filteredStudents.length)} trong số {filteredStudents.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                        return false;
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex gap-1">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg transition ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:border-blue-500'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
