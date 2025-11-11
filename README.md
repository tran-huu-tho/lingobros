# 🦉 LingoBros - Ứng Dụng Học Tiếng Anh Trực Tuyến

Ứng dụng học tiếng Anh thông minh với AI, được xây dựng tương tự Duolingo, sử dụng Next.js, TypeScript, MongoDB, Firebase, Cloudinary và OpenAI.

## ✨ Tính năng chính

- 🔐 **Authentication**: Đăng nhập với Google/Facebook qua Firebase
- 📚 **Learning Path**: Hệ thống học theo step giống Duolingo
- 🧠 **Placement Test**: Kiểm tra đầu vào để xác định trình độ
- 🤖 **AI Chatbot**: Trợ lý AI hỗ trợ học viên 24/7 (OpenAI)
- 📝 **Bài học đa dạng**: Từ vựng, ngữ pháp, nghe, nói, quiz
- 🏆 **Gamification**: XP, streak, hearts, gems, achievements
- 📊 **Progress Tracking**: Theo dõi tiến trình học tập
- 👨‍💼 **Admin Dashboard**: Quản lý khóa học và học viên
- ☁️ **Cloud Storage**: Lưu trữ media trên Cloudinary

## 🛠 Tech Stack

- **Framework**: Next.js 16 + TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: Firebase (Google/Facebook)
- **AI**: OpenAI GPT-4
- **Storage**: Cloudinary
- **UI**: Tailwind CSS 4 + Radix UI

## 📦 Cài đặt

### 1. Clone & Install

```bash
git clone <your-repo>
cd lingobros
npm install
```

### 2. Environment Variables

Tạo file `.env.local` từ `.env.example` và điền thông tin:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# OpenAI
OPENAI_API_KEY=sk-...

# Admin
ADMIN_EMAILS=admin@example.com
```

### 3. Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc

```
lingobros/
├── app/                  # Next.js App Router
│   ├── api/             # API endpoints
│   ├── dashboard/       # User dashboard
│   ├── learn/           # Learning interface
│   ├── lesson/          # Lesson player
│   ├── placement-test/  # Initial assessment
│   └── admin/           # Admin panel
├── components/          # React components
├── lib/                 # Utilities & configs
├── models/              # MongoDB models
├── types/               # TypeScript types
└── contexts/            # React contexts
```

## 🎯 Workflow

### Người dùng mới:
1. Đăng nhập Google/Facebook
2. Làm Placement Test (6 câu)
3. Chọn mục tiêu học (casual/regular/serious/intense)
4. Chọn sở thích (phim, nhạc, du lịch...)
5. Hệ thống tạo lộ trình cá nhân hóa

### Học tập:
1. Chọn course theo level
2. Học Units → Lessons
3. Hoàn thành exercises (multiple-choice, fill-blank, etc.)
4. Kiếm XP, hearts, streak
5. Chat với AI tutor khi cần

## 🚀 Deployment

### Vercel
```bash
vercel
```

### MongoDB Atlas
- Tạo cluster tại mongodb.com/atlas
- Copy connection string

### Firebase
- Tạo project tại console.firebase.google.com
- Bật Google/Facebook providers
- Download service account key

### Cloudinary & OpenAI
- Đăng ký và lấy API keys

## 📝 API Endpoints

- `POST /api/auth/signup` - Create/update user
- `GET /api/users/me` - Get current user
- `GET /api/courses` - List courses
- `GET /api/lessons/[id]` - Get lesson
- `POST /api/progress` - Update progress
- `POST /api/chat` - AI chatbot
- `POST /api/upload` - Upload to Cloudinary

## 🤝 Contributing

Contributions welcome! Submit a PR.

## 📄 License

MIT

---

Made with ❤️ in Vietnam 🇻🇳
