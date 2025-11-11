'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!userData || !userData.isAdmin)) {
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
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  if (loading || !userData?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">🦉</span>
              <span className="text-2xl font-bold text-green-600">LingoBros Admin</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Quay lại Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Tổng khóa học</p>
                  <p className="text-3xl font-bold">{courses.length}</p>
                </div>
                <BookOpen className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Học viên</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Hoạt động hôm nay</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <TrendingUp className="w-12 h-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quản lý khóa học</CardTitle>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm khóa học
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Chưa có khóa học nào. Hãy tạo khóa học đầu tiên!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {course.level}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {course.isPublished ? 'Đã xuất bản' : 'Nháp'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm">
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
