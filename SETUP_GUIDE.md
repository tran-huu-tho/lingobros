# 🎯 HƯỚNG DẪN TRIỂN KHAI DỰ ÁN LINGOBROS

## 📋 Checklist Setup

### ✅ 1. MongoDB Atlas
- [ ] Đăng ký tài khoản tại https://www.mongodb.com/atlas
- [ ] Tạo cluster mới (chọn Free tier M0)
- [ ] Tạo Database User (username + password)
- [ ] Whitelist IP: 0.0.0.0/0 (cho phép tất cả IP)
- [ ] Lấy Connection String: `mongodb+srv://username:password@cluster.mongodb.net/lingobros`
- [ ] Paste vào `.env.local`: `MONGODB_URI=...`

### ✅ 2. Firebase Setup

#### Tạo Firebase Project
- [ ] Vào https://console.firebase.google.com/
- [ ] Click "Add project" → Đặt tên "LingoBros"
- [ ] Disable Google Analytics (không bắt buộc)

#### Bật Authentication
- [ ] Vào Authentication → Sign-in method
- [ ] Enable **Google** provider
  - Thêm support email
  - Lưu
- [ ] Enable **Facebook** provider
  - Cần App ID & App secret từ Facebook Developers
  - Hoặc bỏ qua nếu chỉ dùng Google

#### Lấy Config (Client)
- [ ] Vào Project Settings → General
- [ ] Scroll xuống "Your apps" → Web app
- [ ] Copy các giá trị Firebase config
- [ ] Paste vào `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

#### Generate Service Account (Server)
- [ ] Vào Project Settings → Service accounts
- [ ] Click "Generate new private key" → Download JSON
- [ ] Mở file JSON, copy các giá trị:
```
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
- [ ] **LÀM ĐÚNG**: Private key phải giữ nguyên format với `\n`, và bọc trong dấu ngoặc kép

### ✅ 3. Cloudinary Setup
- [ ] Đăng ký tại https://cloudinary.com/
- [ ] Vào Dashboard
- [ ] Copy thông tin:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
- [ ] Vào Settings → Upload → Upload presets
- [ ] Create upload preset: `lingobros_unsigned` (unsigned)

### ✅ 4. OpenAI Setup
- [ ] Đăng ký/Đăng nhập tại https://platform.openai.com/
- [ ] Vào API keys → Create new secret key
- [ ] Copy key:
```
OPENAI_API_KEY=sk-...
```
- [ ] **CHÚ Ý**: Cần nạp credit (tối thiểu $5) để sử dụng

### ✅ 5. Config Admin
- [ ] Thêm email admin vào `.env.local`:
```
ADMIN_EMAILS=your-email@gmail.com,another-admin@gmail.com
```

### ✅ 6. Chạy Project Local

```bash
# 1. Cài dependencies (nếu chưa)
npm install

# 2. Tạo file .env.local
cp .env.example .env.local
# Điền tất cả thông tin ở trên

# 3. Chạy dev server
npm run dev
```

Mở http://localhost:3000

### ✅ 7. Test Chức Năng

- [ ] Trang chủ hiển thị đúng
- [ ] Đăng nhập Google hoạt động
- [ ] Redirect đến Placement Test
- [ ] Hoàn thành Placement Test
- [ ] Dashboard hiển thị thông tin user
- [ ] AI Chatbot hoạt động (click nút chat góc phải)
- [ ] User stats hiển thị (XP, hearts, streak)

## 🚀 Deploy lên Vercel

### 1. Push code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy trên Vercel
- [ ] Vào https://vercel.com/
- [ ] Import GitHub repository
- [ ] Add Environment Variables (tất cả từ `.env.local`)
- [ ] Deploy!

### 3. Cập nhật Firebase Authorized Domains
- [ ] Copy domain từ Vercel (vd: `lingobros.vercel.app`)
- [ ] Vào Firebase Console → Authentication → Settings
- [ ] Thêm domain vào "Authorized domains"

### 4. MongoDB Whitelist (nếu cần)
- [ ] Vào MongoDB Atlas → Network Access
- [ ] Thêm IP của Vercel (hoặc dùng 0.0.0.0/0)

## 📊 Seed Data (Tạo dữ liệu mẫu)

Hiện tại database còn trống. Bạn cần:

### Option 1: Tạo thủ công qua API
Dùng Postman/Thunder Client hoặc code:

```javascript
// Tạo Course mẫu
POST /api/courses
{
  "title": "English for Beginners",
  "description": "Khóa học tiếng Anh cơ bản",
  "level": "beginner",
  "isPublished": true
}

// Tạo Unit
POST /api/units
{
  "courseId": "<course-id>",
  "title": "Unit 1: Greetings",
  "order": 1
}

// Tạo Lesson
POST /api/lessons
{
  "unitId": "<unit-id>",
  "title": "Hello & Goodbye",
  "type": "vocabulary",
  "order": 1,
  "xpReward": 10,
  "content": {
    "exercises": [
      {
        "type": "multiple-choice",
        "question": "How do you say 'Xin chào' in English?",
        "options": ["Hello", "Goodbye", "Thanks", "Sorry"],
        "correctAnswer": "Hello",
        "explanation": "Hello là cách chào hỏi phổ biến nhất"
      }
    ]
  }
}
```

### Option 2: Tạo seed script
Tôi có thể tạo script tự động seed data nếu bạn cần.

## 🐛 Troubleshooting

### Lỗi MongoDB connection
```
Error: connect ECONNREFUSED
```
**Giải pháp**:
- Kiểm tra MONGODB_URI đúng format
- Whitelist IP 0.0.0.0/0 trong MongoDB Atlas
- Đảm bảo cluster đang chạy

### Lỗi Firebase Auth
```
auth/invalid-api-key
```
**Giải pháp**:
- Kiểm tra NEXT_PUBLIC_FIREBASE_API_KEY
- Đảm bảo project ID đúng
- Check authorized domains

### Lỗi OpenAI
```
insufficient_quota
```
**Giải pháp**:
- Nạp credit vào tài khoản OpenAI
- Hoặc dùng model rẻ hơn (gpt-3.5-turbo)
- Sửa trong `lib/openai.ts`: model: 'gpt-3.5-turbo'

### Lỗi Cloudinary upload
```
Upload failed
```
**Giải pháp**:
- Kiểm tra API credentials
- Tạo unsigned upload preset
- Check file size (<10MB)

## 📝 Next Steps

Sau khi setup xong, bạn nên:

1. **Tạo dữ liệu khóa học**
   - Vào `/admin` (đăng nhập với ADMIN_EMAILS)
   - Tạo courses, units, lessons

2. **Customize**
   - Thay logo/favicon trong `public/`
   - Sửa màu sắc trong components
   - Thêm content tiếng Việt

3. **Test kỹ**
   - Đăng nhập/đăng xuất
   - Hoàn thành lessons
   - Check XP, hearts, streak
   - Test AI chatbot

4. **Marketing**
   - Share với bạn bè
   - Post lên mạng xã hội
   - Thu thập feedback

## 💡 Tips

- Dùng MongoDB Compass để xem database trực quan
- Dùng Firebase Emulator để test local (tránh tốn quota)
- Monitor OpenAI usage để không bị over quota
- Backup database thường xuyên

## 📞 Support

Nếu gặp vấn đề:
1. Check console log (F12)
2. Đọc error message kỹ
3. Google search lỗi
4. Hỏi ChatGPT/Claude
5. Check GitHub Issues

---

**Chúc bạn setup thành công! 🎉**
