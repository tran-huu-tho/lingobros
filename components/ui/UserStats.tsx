'use client';

import React from 'react';
import { Flame, Zap, Heart, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function UserStats() {
  const { userData } = useAuth();

  if (!userData) return null;

  return (
    <div className="flex items-center gap-4">
      {/* Streak */}
      <div className="flex items-center gap-1.5 bg-orange-100 px-3 py-1.5 rounded-xl">
        <Flame className="w-5 h-5 text-orange-500" />
        <span className="font-bold text-orange-700">{userData.streak}</span>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1.5 rounded-xl">
        <Zap className="w-5 h-5 text-yellow-600" />
        <span className="font-bold text-yellow-700">{userData.xp}</span>
      </div>

      {/* Hearts */}
      <div className="flex items-center gap-1.5 bg-red-100 px-3 py-1.5 rounded-xl">
        <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
        <span className="font-bold text-red-700">{userData.hearts}</span>
      </div>

      {/* Gems */}
      <div className="flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-xl">
        <Award className="w-5 h-5 text-blue-500" />
        <span className="font-bold text-blue-700">{userData.gems}</span>
      </div>
    </div>
  );
}
