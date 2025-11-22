# 🚀 HƯỚNG DẪN BẬT ĐĂNG KÝ/ĐĂNG NHẬP EMAIL

## ⚠️ Lỗi hiện tại trong ảnh
```
Firebase: Error (auth/operation-not-allowed)
```

**Nguyên nhân:** Email/Password authentication chưa được bật trong Firebase Console.

---

## ✅ GIẢI PHÁP (5 PHÚT)

### Bước 1: Vào Firebase Console
1. Mở trình duyệt, truy cập: **https://console.firebase.google.com/**
2. Đăng nhập tài khoản Google của bạn
3. Chọn project: **lingobros-4f457**

### Bước 2: Bật Email/Password Provider
1. Menu bên trái → Click **"Authentication"** (biểu tượng người dùng)
2. Click tab **"Sign-in method"** (phía trên)
3. Tìm dòng **"Email/Password"** trong danh sách providers
4. Click vào dòng "Email/Password"
5. Popup hiện ra → Bật toggle **"Enable"**
6. Click nút **"Save"**

### Bước 3: Xác nhận đã bật
- Quay lại tab "Sign-in method"
- Kiểm tra status của "Email/Password" = **Enabled** (màu xanh)

---

## 🧪 TEST ĐĂNG KÝ/ĐĂNG NHẬP

### 1. Đăng ký tài khoản mới

**Bước 1:** Mở app
```
http://localhost:3000
```

**Bước 2:** Click nút **"Bắt Đầu Ngay"** hoặc **"Đăng Nhập"**

**Bước 3:** Modal hiện ra → Click tab **"Đăng Ký"**

**Bước 4:** Điền thông tin test:
- **Tên hiển thị:** Nguyễn Văn A
- **Email:** test@example.com
- **Mật khẩu:** 123456
- **Xác nhận:** 123456

**Bước 5:** Click nút **"Đăng Ký"**

**✅ Kết quả mong đợi:**
- Toast hiển thị: "Đăng ký thành công!"
- Modal tự động đóng
- Redirect về `/dashboard`
- User được tạo trong Firebase + MongoDB

### 2. Kiểm tra user đã được tạo

#### Kiểm tra trong Firebase Console:
1. Firebase Console → **Authentication** → **Users**
2. Thấy user vừa tạo với email `test@example.com`
3. UID: `abc123...`
4. Provider: **Password**

#### Kiểm tra trong MongoDB:
1. Mở **MongoDB Atlas** hoặc **Compass**
2. Database: `lingobros`
3. Collection: `users`
4. Tìm document:
```json
{
  "_id": "...",
  "firebaseUid": "abc123...",
  "email": "test@example.com",
  "displayName": "Nguyễn Văn A",
  "level": "beginner",
  "xp": 0,
  "streak": 0,
  "hearts": 5,
  "gems": 0,
  "createdAt": "2025-11-22T..."
}
```

### 3. Test đăng nhập

**Bước 1:** Đăng xuất (nếu đang đăng nhập)
- Click avatar → "Đăng xuất"

**Bước 2:** Click "Đăng Nhập" ở header

**Bước 3:** Tab "Đăng Nhập" → Nhập:
- **Email:** test@example.com
- **Mật khẩu:** 123456

**Bước 4:** Click "Đăng Nhập"

**✅ Kết quả mong đợi:**
- Toast: "Đăng nhập thành công!"
- Redirect về `/dashboard`
- User data được load từ MongoDB

---

## 🔍 DEBUG & XỬ LÝ LỖI

### Lỗi: "Email đã được sử dụng"
**Nguyên nhân:** Email đã tồn tại trong Firebase
**Giải pháp:** 
- Dùng email khác
- Hoặc xóa user cũ trong Firebase Console

### Lỗi: "Mật khẩu quá yếu"
**Nguyên nhân:** Password < 6 ký tự
**Giải pháp:** Nhập password ít nhất 6 ký tự

### Lỗi: "Email không hợp lệ"
**Nguyên nhân:** Format email sai
**Giải pháp:** Nhập đúng format: `abc@example.com`

### Lỗi: "Mật khẩu xác nhận không khớp"
**Nguyên nhân:** Password ≠ Confirm Password
**Giải pháp:** Nhập giống nhau ở 2 ô

### Lỗi: "Mật khẩu không đúng" (khi login)
**Nguyên nhân:** Sai password
**Giải pháp:** Nhập đúng password đã đăng ký

### Lỗi: "Tài khoản không tồn tại" (khi login)
**Nguyên nhân:** Email chưa được đăng ký
**Giải pháp:** Đăng ký trước khi login

---

## 📊 FLOW HOẠT ĐỘNG

### Đăng Ký (Sign Up)
```
1. User điền form → Click "Đăng Ký"
   ↓
2. AuthContext.signUpWithEmail()
   ↓
3. Firebase createUserWithEmailAndPassword()
   ↓
4. Firebase tạo user authentication ✅
   ↓
5. updateProfile() → Set displayName
   ↓
6. POST /api/auth/signup
   ↓
7. MongoDB tạo user document ✅
   ↓
8. Toast "Đăng ký thành công!"
   ↓
9. Auto login + redirect /dashboard
```

### Đăng Nhập (Sign In)
```
1. User điền email/password → Click "Đăng Nhập"
   ↓
2. AuthContext.signInWithEmail()
   ↓
3. Firebase signInWithEmailAndPassword()
   ↓
4. Firebase verify credentials ✅
   ↓
5. AuthContext fetch user data
   ↓
6. GET /api/users/me
   ↓
7. MongoDB trả về user document ✅
   ↓
8. Toast "Đăng nhập thành công!"
   ↓
9. Redirect /dashboard
```

---

## 🎯 CHECKLIST HOÀN THÀNH

- [ ] Đã bật Email/Password trong Firebase Console
- [ ] Test đăng ký thành công
- [ ] User xuất hiện trong Firebase Authentication
- [ ] User xuất hiện trong MongoDB
- [ ] Test đăng nhập thành công
- [ ] User data được load đúng
- [ ] Toast notifications hoạt động
- [ ] Redirect về dashboard sau login

---

## 💡 GHI CHÚ

### Các phương thức đăng nhập đã có:
1. ✅ **Google OAuth** - Click nút "Tiếp tục với Google"
2. ✅ **Facebook OAuth** - Click nút "Tiếp tục với Facebook"
3. ✅ **Email/Password** - Form đăng ký/đăng nhập (cần bật)

### Các phương thức có thể thêm sau:
- 📱 Phone OTP (đã code sẵn trong AuthContext)
- 🔗 Email Link (passwordless)
- 🍎 Apple Sign In
- 🐙 GitHub OAuth

### File liên quan:
- `contexts/AuthContext.tsx` - Logic authentication
- `components/auth/AuthModal.tsx` - UI modal
- `app/api/auth/signup/route.ts` - API tạo user
- `models/User.ts` - Schema MongoDB
- `lib/firebase.ts` - Firebase config
- `lib/firebase-admin.ts` - Firebase Admin SDK

---

## ❓ CẦN TRỢ GIÚP?

Nếu vẫn gặp lỗi, kiểm tra:
1. **Console log** trong browser (F12)
2. **Terminal log** của Next.js server
3. **Firebase Console** → Authentication → Users
4. **MongoDB** → Collection users
5. **Environment variables** trong `.env.local`

Lỗi thường gặp đều có message rõ ràng trong toast notification! 🎉
