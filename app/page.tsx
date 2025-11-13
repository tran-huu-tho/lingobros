'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { BookOpen, Zap, Trophy, Users, MessageCircle } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl">
                ☃️
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                LingoBros
              </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Login Button */}
              <button
                onClick={handleOpenAuth}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30"
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
              <div className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
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
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold transition-all duration-200 shadow-2xl shadow-blue-500/40 hover:scale-105"
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
              gradient="from-green-500 to-green-600"
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
              gradient="from-red-500 to-red-600"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-20 border-t border-gray-200 dark:border-gray-800">
            <StatCard value={10000} suffix="+" label="Học Viên" />
            <StatCard value={50} suffix="+" label="Bài Học" />
            <StatCard value={100} suffix="%" label="Miễn Phí" />
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
            <p>© 2025 LingoBros. Design by Huu Tho - Quoc Dung ❤️</p>
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
    <div className="group text-center p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform mx-auto`}>
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

interface StatCardProps {
  value: number;
  suffix: string;
  label: string;
}

function StatCard({ value, suffix, label }: StatCardProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          const duration = 2000; // 2 seconds
          const steps = 60;
          const increment = value / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={countRef} className="text-center">
      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
