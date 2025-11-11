'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { UserStats } from '@/components/ui/UserStats';
import { AIChatbot } from '@/components/ui/AIChatbot';
import { Lock, Play, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`);
      const data = await response.json();
      setCourse(data.course);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h2>
          <Button onClick={() => router.push('/dashboard')}>
            Quay lại Dashboard
          </Button>
        </div>
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

            <UserStats />
          </div>
        </div>
      </header>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 text-lg">{course.description}</p>
          </div>

          {/* Units */}
          <div className="space-y-8">
            {course.units?.map((unit: any, unitIndex: number) => (
              <Card key={unit._id}>
                <CardHeader className="bg-linear-to-r from-green-50 to-blue-50">
                  <CardTitle className="flex items-center justify-between">
                    <span>Unit {unitIndex + 1}: {unit.title}</span>
                    {unit.isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">{unit.description}</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    {unit.lessons?.map((lesson: any, lessonIndex: number) => {
                      const isCompleted = false; // TODO: Check from user progress
                      const isLocked = lesson.isLocked || unit.isLocked;

                      return (
                        <div
                          key={lesson._id}
                          className={`relative ${
                            lessonIndex > 0 ? 'ml-8' : ''
                          }`}
                        >
                          {/* Connection Line */}
                          {lessonIndex > 0 && (
                            <div className="absolute -left-8 -top-6 w-8 h-10 border-l-2 border-b-2 border-gray-200 rounded-bl-xl" />
                          )}

                          <button
                            onClick={() =>
                              !isLocked && router.push(`/lesson/${lesson._id}`)
                            }
                            disabled={isLocked}
                            className={`w-full p-4 rounded-xl border-2 transition text-left ${
                              isLocked
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                : isCompleted
                                ? 'border-green-500 bg-green-50 hover:bg-green-100'
                                : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    isLocked
                                      ? 'bg-gray-200'
                                      : isCompleted
                                      ? 'bg-green-500'
                                      : 'bg-blue-500'
                                  }`}
                                >
                                  {isLocked ? (
                                    <Lock className="w-6 h-6 text-gray-500" />
                                  ) : isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-white" />
                                  ) : (
                                    <Play className="w-6 h-6 text-white" />
                                  )}
                                </div>

                                <div>
                                  <h3 className="font-bold text-lg">
                                    {lesson.title}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {lesson.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                      {lesson.type}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      +{lesson.xpReward} XP
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {isCompleted && (
                                <div className="text-right">
                                  <div className="text-green-600 font-bold">
                                    100%
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ⭐⭐⭐
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Units Yet */}
          {(!course.units || course.units.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 text-lg mb-4">
                  Khóa học này đang được cập nhật. Hãy quay lại sau nhé! 🚧
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Quay lại Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AIChatbot />
    </div>
  );
}
