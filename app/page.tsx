'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BookOpen, MessageCircle, Trophy, Users } from 'lucide-react';

export default function Home() {
  const { user, loading, signInWithGoogle, signInWithFacebook } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-green-600 mb-4">
              🦉 LingoBros
            </h1>
            <p className="text-3xl font-bold text-gray-800 mb-6">
              Học Tiếng Anh Miễn Phí, Vui Vẻ & Hiệu Quả
            </p>
            <p className="text-xl text-gray-600 mb-8">
              Học tiếng Anh với phương pháp khoa học, game hóa và AI thông minh. 
              Giống như Duolingo nhưng được thiết kế riêng cho người Việt!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={signInWithGoogle}
              size="lg"
              className="text-lg px-8 py-6"
            >
              🚀 Bắt Đầu Học Ngay
            </Button>
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              Đăng Nhập
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Học Theo Lộ Trình</h3>
              <p className="text-gray-600">
                Lộ trình học được cá nhân hóa theo trình độ và mục tiêu của bạn
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">AI Gia Sư</h3>
              <p className="text-gray-600">
                Trợ lý AI 24/7 sẵn sàng giải đáp mọi thắc mắc của bạn
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Game Hóa</h3>
              <p className="text-gray-600">
                Kiếm XP, duy trì streak và cạnh tranh với bạn bè
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Cộng Đồng</h3>
              <p className="text-gray-600">
                Tham gia cộng đồng học viên nhiệt huyết khắp Việt Nam
              </p>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-16 space-y-4 max-w-md mx-auto">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition font-semibold"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Tiếp tục với Google
            </button>

            <button
              onClick={signInWithFacebook}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1877F2] text-white rounded-xl hover:bg-[#166FE5] transition font-semibold"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Tiếp tục với Facebook
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 LingoBros. Made with ❤️ in Vietnam
          </p>
        </div>
      </footer>
    </div>
  );
}
