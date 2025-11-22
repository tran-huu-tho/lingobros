// Script test đăng ký và đăng nhập Email/Password
// Chạy: node scripts/test-email-auth.js

const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

console.log('🔥 Firebase Config Check:');
console.log('Project ID:', FIREBASE_CONFIG.projectId);
console.log('Auth Domain:', FIREBASE_CONFIG.authDomain);
console.log('API Key:', FIREBASE_CONFIG.apiKey ? '✅ Set' : '❌ Missing');

console.log('\n📝 Để test đăng ký/đăng nhập:');
console.log('1. Bật Email/Password trong Firebase Console');
console.log('2. Mở app: http://localhost:3000');
console.log('3. Click "Bắt đầu ngay" để mở modal đăng nhập');
console.log('4. Chọn tab "Đăng Ký"');
console.log('5. Điền thông tin:');
console.log('   - Tên hiển thị: Nguyễn Văn A');
console.log('   - Email: test@example.com');
console.log('   - Mật khẩu: 123456 (tối thiểu 6 ký tự)');
console.log('6. Click "Đăng Ký"');
console.log('\n✅ Nếu thành công:');
console.log('   - Toast hiển thị "Đăng ký thành công!"');
console.log('   - User được tạo trong Firebase Authentication');
console.log('   - User được tạo trong MongoDB');
console.log('   - Tự động đăng nhập và redirect');
console.log('\n❌ Nếu lỗi "auth/operation-not-allowed":');
console.log('   - Email/Password chưa được bật trong Firebase Console');
console.log('   - Xem file ENABLE_EMAIL_AUTH.md để biết cách bật');

console.log('\n🔍 Kiểm tra user trong MongoDB:');
console.log('   - Mở MongoDB Compass hoặc Atlas');
console.log('   - Database: lingobros');
console.log('   - Collection: users');
console.log('   - Tìm user vừa tạo theo email');

console.log('\n🧪 Test đăng nhập:');
console.log('1. Đăng xuất (nếu đang đăng nhập)');
console.log('2. Mở modal đăng nhập');
console.log('3. Chọn tab "Đăng Nhập"');
console.log('4. Nhập email và password đã đăng ký');
console.log('5. Click "Đăng Nhập"');
console.log('6. Kiểm tra console để xem user data');
