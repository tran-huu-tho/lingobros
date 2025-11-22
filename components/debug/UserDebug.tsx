'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Debug component - hiển thị thông tin user hiện tại
 * Chỉ dùng cho development, xóa khi deploy production
 * 
 * Cách dùng: Thêm <UserDebug /> vào layout.tsx hoặc page.tsx
 */
export default function UserDebug() {
  const { user, userData, loading } = useAuth();

  // Chỉ hiển thị trong development
  if (process.env.NODE_ENV === 'production') return null;

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-md z-50">
        <div className="font-mono text-xs">
          <div className="font-bold text-yellow-800 mb-2">🔄 Loading Auth...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 border-2 border-gray-400 rounded-lg p-4 shadow-lg max-w-md z-50">
        <div className="font-mono text-xs">
          <div className="font-bold text-gray-800 mb-2">👤 Guest Mode</div>
          <div className="text-gray-600">Chưa đăng nhập</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border-2 border-green-400 rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="font-mono text-xs space-y-2">
        <div className="font-bold text-green-800 mb-2 flex items-center justify-between">
          <span>✅ User Authenticated</span>
          <button
            onClick={() => {
              const el = document.getElementById('user-debug-details');
              if (el) el.classList.toggle('hidden');
            }}
            className="text-green-600 hover:text-green-800"
          >
            Toggle
          </button>
        </div>

        <div id="user-debug-details" className="space-y-2">
          <div className="border-t border-green-300 pt-2">
            <div className="text-green-800 font-semibold">Firebase User:</div>
            <div className="text-gray-700 ml-2">
              <div>UID: {user.uid}</div>
              <div>Email: {user.email}</div>
              <div>Name: {user.displayName}</div>
              <div>Provider: {user.providerData[0]?.providerId}</div>
            </div>
          </div>

          {userData ? (
            <div className="border-t border-green-300 pt-2">
              <div className="text-green-800 font-semibold">MongoDB User:</div>
              <div className="text-gray-700 ml-2">
                <div>ID: {userData._id}</div>
                <div>Level: {userData.level}</div>
                <div>XP: {userData.xp}</div>
                <div>Streak: {userData.streak} 🔥</div>
                <div>Hearts: {userData.hearts} ❤️</div>
                <div>Gems: {userData.gems} 💎</div>
                <div>Admin: {userData.isAdmin ? '✅' : '❌'}</div>
              </div>
            </div>
          ) : (
            <div className="border-t border-green-300 pt-2">
              <div className="text-yellow-800 font-semibold">⚠️ MongoDB User:</div>
              <div className="text-gray-700 ml-2">Chưa load được data</div>
            </div>
          )}

          <div className="border-t border-green-300 pt-2">
            <div className="text-green-800 font-semibold">Actions:</div>
            <div className="ml-2 space-y-1">
              <button
                onClick={() => {
                  console.log('Firebase User:', user);
                  console.log('MongoDB User:', userData);
                }}
                className="text-blue-600 hover:text-blue-800 underline block"
              >
                Log to Console
              </button>
              <button
                onClick={async () => {
                  const token = await user.getIdToken();
                  console.log('ID Token:', token);
                  navigator.clipboard.writeText(token);
                  alert('Token copied to clipboard!');
                }}
                className="text-blue-600 hover:text-blue-800 underline block"
              >
                Copy Auth Token
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
