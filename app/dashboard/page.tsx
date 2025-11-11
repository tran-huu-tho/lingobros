'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { UserStats } from '@/components/ui/UserStats';
import { AIChatbot } from '@/components/ui/AIChatbot';
import { BookOpen, Lock, Play, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Course } from '@/types';

export default function Dashboard() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userData && !userData.preferences?.learningGoal) {
      // Redirect to placement test for new users
      router.push('/placement-test');
    }
  }, [userData, router]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading || !user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">🦉</span>
              <span className="text-2xl font-bold text-green-600">LingoBros</span>
            </Link>

            <div className="flex items-center gap-6">
              <UserStats />
              
              <button
                onClick={signOut}
                className="text-gray-600 hover:text-gray-800"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Learning Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Xin chào, {userData.displayName}! 👋
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Hôm nay bạn muốn học gì? Hãy tiếp tục hành trình chinh phục tiếng Anh của mình!
                </p>
              </CardContent>
            </Card>

            {/* Learning Path */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  Lộ Trình Học Của Bạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      Chưa có khóa học nào. Hãy làm bài kiểm tra đầu vào để bắt đầu!
                    </p>
                    <Button onClick={() => router.push('/placement-test')}>
                      Làm Bài Kiểm Tra
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => router.push(`/learn/${course._id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{course.title}</h3>
                            <p className="text-sm text-gray-600">{course.description}</p>
                            <div className="mt-2">
                              <Progress value={30} max={100} color="green" />
                              <p className="text-xs text-gray-500 mt-1">30% hoàn thành</p>
                            </div>
                          </div>
                        </div>
                        <Play className="w-6 h-6 text-green-600" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition">
                <CardContent className="pt-6 text-center">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Thử Thách</h3>
                  <p className="text-sm text-gray-600">
                    Hoàn thành thử thách hàng ngày để nhận phần thưởng
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Bảng Xếp Hạng</h3>
                  <p className="text-sm text-gray-600">
                    Xem thứ hạng của bạn và cạnh tranh với bạn bè
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mục Tiêu Hôm Nay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={0} max={100} color="yellow" />
                  <p className="text-sm text-gray-600">
                    0 / {userData.preferences?.dailyGoalMinutes || 15} phút
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Thành Tích
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center"
                    >
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Level */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cấp Độ Hiện Tại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {userData.level.toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {userData.xp} XP
                  </p>
                  <Progress value={userData.xp % 100} max={100} color="green" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}
