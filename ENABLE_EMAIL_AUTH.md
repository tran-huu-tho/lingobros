# Bật Email/Password Authentication trong Firebase

## Lỗi hiện tại
```
Firebase: Error (auth/operation-not-allowed)
```

Lỗi này xảy ra vì **Email/Password authentication chưa được bật** trong Firebase Console.

## Cách khắc phục (5 bước đơn giản)

### Bước 1: Mở Firebase Console
1. Truy cập: https://console.firebase.google.com/
2. Chọn project: **lingobros-4f457**

### Bước 2: Vào Authentication
1. Click vào menu bên trái: **Authentication**
2. Click tab: **Sign-in method**

### Bước 3: Bật Email/Password
1. Tìm provider: **Email/Password**
2. Click vào dòng đó
3. **Bật toggle** "Enable"
4. Click **Save**

### Bước 4: (Tùy chọn) Bật Email Link
- Bạn có thể bật thêm "Email link (passwordless sign-in)" nếu muốn
- Nhưng không bắt buộc

### Bước 5: Kiểm tra
- Quay lại app, thử đăng ký lại
- Lần này sẽ thành công! ✅

## Các provider đã bật hiện tại
- ✅ Google
- ✅ Facebook
- ❌ Email/Password (cần bật)

## Sau khi bật xong

### Database sẽ tự động tạo user với thông tin:
```javascript
{
  firebaseUid: "abc123...",
  email: "user@example.com",
  displayName: "Tên người dùng",
  level: "beginner",
  xp: 0,
  streak: 0,
  hearts: 5,
  gems: 0,
  createdAt: "2025-11-22T..."
}
```

### Flow hoạt động:
1. User điền form đăng ký → Click "Đăng Ký"
2. Firebase tạo tài khoản authentication
3. AuthContext gọi `/api/auth/signup`
4. API tạo user trong MongoDB
5. User được đăng nhập tự động
6. Redirect về dashboard ✨

## Lưu ý quan trọng

### Nếu muốn test local mà chưa bật Firebase:
Bạn có thể dùng Firebase Emulator:
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

### Nếu bật xong mà vẫn lỗi:
- Xóa cache browser (Ctrl + Shift + Delete)
- Thử incognito mode
- Kiểm tra Firebase config trong `.env.local`

## Firebase Config hiện tại
File: `lib/firebase.ts`
```typescript
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
// ... các config khác
```

✅ **Đảm bảo các biến môi trường này đã được set đúng!**
