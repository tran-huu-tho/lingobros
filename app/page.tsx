'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AuthModal from '@/components/auth/AuthModal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Zap, Trophy, Users, Moon, Sun } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-2xl">
                🦉
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                LingoBros
              </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-300" />
                )}
              </button>

              {/* Login Button */}
              <button
                onClick={handleOpenAuth}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-green-500/30"
              >
                Đăng Nhập
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <div className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  ✨ Miễn phí 100%
                </span>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-tight">
              Học Tiếng Anh<br />Dễ Dàng Hơn Bao Giờ Hết
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Phương pháp học thông minh với AI, game hóa và lộ trình cá nhân hóa. 
              Thiết kế riêng cho người Việt.
            </p>

            <button
              onClick={handleOpenAuth}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-bold transition-all duration-200 shadow-2xl shadow-green-500/40 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Bắt Đầu Ngay
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </span>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Lộ Trình Học"
              description="Học theo trình độ, từ cơ bản đến nâng cao"
              gradient="from-blue-500 to-cyan-500"
            />

            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="AI Gia Sư"
              description="Trợ lý AI 24/7 giải đáp mọi thắc mắc"
              gradient="from-purple-500 to-pink-500"
            />

            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="Game Hóa"
              description="Kiếm XP, streak và cạnh tranh bạn bè"
              gradient="from-yellow-500 to-orange-500"
            />

            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Cộng Đồng"
              description="Kết nối với học viên toàn quốc"
              gradient="from-green-500 to-emerald-500"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-20 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">10K+</div>
              <div className="text-gray-600 dark:text-gray-400">Học Viên</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Bài Học</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Miễn Phí</div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2025 LingoBros. Made with ❤️ in Vietnam</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
