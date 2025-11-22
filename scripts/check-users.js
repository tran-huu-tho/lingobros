// Script kiểm tra users trong MongoDB
// Chạy: node scripts/check-users.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Thiếu MONGODB_URI trong .env.local');
  process.exit(1);
}

// User Schema
const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: { type: String },
  level: { type: String, default: 'beginner' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  hearts: { type: Number, default: 5 },
  gems: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối thành công!\n');

    console.log('👥 Danh sách users:');
    console.log('='.repeat(80));

    const users = await User.find().sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('📭 Chưa có user nào trong database');
      console.log('\n💡 Hướng dẫn tạo user:');
      console.log('1. Mở app: http://localhost:3000');
      console.log('2. Click "Đăng Ký"');
      console.log('3. Điền thông tin và đăng ký');
    } else {
      console.log(`📊 Tổng số: ${users.length} users\n`);

      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.displayName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Firebase UID: ${user.firebaseUid}`);
        console.log(`   Level: ${user.level}`);
        console.log(`   XP: ${user.xp} | Streak: ${user.streak} | Hearts: ${user.hearts} | Gems: ${user.gems}`);
        console.log(`   Admin: ${user.isAdmin ? '✅ Yes' : '❌ No'}`);
        console.log(`   Tạo lúc: ${user.createdAt.toLocaleString('vi-VN')}`);
        console.log(`   Active: ${user.lastActiveAt.toLocaleString('vi-VN')}`);
        console.log('-'.repeat(80));
      });

      // Thống kê
      console.log('\n📈 Thống kê:');
      const adminCount = users.filter(u => u.isAdmin).length;
      const totalXP = users.reduce((sum, u) => sum + u.xp, 0);
      const avgXP = Math.round(totalXP / users.length);

      console.log(`   Admins: ${adminCount}`);
      console.log(`   Tổng XP: ${totalXP}`);
      console.log(`   Trung bình XP: ${avgXP}`);

      // Levels
      const levels = {};
      users.forEach(u => {
        levels[u.level] = (levels[u.level] || 0) + 1;
      });
      console.log('\n📚 Phân bố level:');
      Object.entries(levels).forEach(([level, count]) => {
        console.log(`   ${level}: ${count} users`);
      });
    }

    console.log('\n✅ Hoàn thành!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

checkUsers();
