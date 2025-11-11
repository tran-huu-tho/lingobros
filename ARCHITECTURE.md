# 📐 KIẾN TRÚC DỰ ÁN LINGOBROS

## 🎯 Tổng quan

LingoBros là một ứng dụng học tiếng Anh full-stack được xây dựng theo mô hình **Monolithic** với Next.js, kết hợp cả Frontend và Backend trong một dự án.

## 🏗 Architecture Pattern

```
┌─────────────────────────────────────────┐
│           CLIENT (Browser)              │
│  React Components + Tailwind CSS       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         NEXT.JS APP ROUTER              │
│  • Server Components (SSR)              │
│  • Client Components (CSR)              │
│  • API Routes (Backend)                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         EXTERNAL SERVICES               │
│  ┌────────────────────────────────┐    │
│  │  Firebase Auth                 │    │
│  │  (Google/Facebook Login)       │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │  MongoDB Atlas                 │    │
│  │  (Database - NoSQL)            │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │  Google Gemini AI              │    │
│  │  (AI Chatbot - Gemini Pro)     │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │  Cloudinary                    │    │
│  │  (Media Storage)               │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## 📂 Cấu trúc thư mục chi tiết

```
lingobros/
│
├── app/                          # Next.js 13+ App Router
│   │
│   ├── api/                     # Backend API Routes
│   │   ├── auth/
│   │   │   └── signup/
│   │   │       └── route.ts    # POST: Tạo/cập nhật user
│   │   │
│   │   ├── users/
│   │   │   └── me/
│   │   │       └── route.ts    # GET/PATCH: User profile
│   │   │
│   │   ├── courses/
│   │   │   ├── route.ts        # GET: Danh sách courses
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET: Chi tiết course
│   │   │
│   │   ├── lessons/
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET: Chi tiết lesson
│   │   │
│   │   ├── progress/
│   │   │   └── route.ts        # GET/POST: User progress
│   │   │
│   │   ├── quizzes/
│   │   │   └── route.ts        # GET/POST: Quizzes
│   │   │
│   │   ├── chat/
│   │   │   └── route.ts        # POST: AI chatbot
│   │   │
│   │   └── upload/
│   │       └── route.ts        # POST/DELETE: Cloudinary
│   │
│   ├── (pages)/                 # Frontend Pages
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx        # User dashboard
│   │   │
│   │   ├── learn/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Learning interface
│   │   │
│   │   ├── lesson/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Lesson player
│   │   │
│   │   ├── placement-test/
│   │   │   └── page.tsx        # Initial test
│   │   │
│   │   └── admin/
│   │       └── page.tsx        # Admin dashboard
│   │
│
├── components/                   # React Components
│   ├── ui/                      # UI Components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Progress.tsx
│   │   ├── UserStats.tsx
│   │   └── AIChatbot.tsx
│   │
│   ├── lesson/                  # Lesson Components
│   │   ├── Exercise.tsx
│   │   └── LessonPlayer.tsx
│   │
│   ├── quiz/                    # Quiz Components
│   │
│   └── admin/                   # Admin Components
│
├── contexts/                     # React Contexts
│   └── AuthContext.tsx          # Authentication state
│
├── lib/                         # Utilities & Configs
│   ├── mongodb.ts              # MongoDB connection
│   ├── firebase.ts             # Firebase client
│   ├── firebase-admin.ts       # Firebase admin
│   ├── cloudinary.ts           # Cloudinary config
│   ├── gemini.ts               # Gemini AI integration
│   └── utils.ts                # Helper functions
│
├── models/                      # MongoDB Models (Mongoose)
│   ├── User.ts                 # User schema
│   ├── Course.ts               # Course schema
│   ├── Unit.ts                 # Unit schema
│   ├── Lesson.ts               # Lesson schema
│   ├── UserProgress.ts         # Progress tracking
│   ├── Quiz.ts                 # Quiz schema
│   └── Achievement.ts          # Achievement schema
│
├── types/                       # TypeScript Types
│   └── index.ts                # All type definitions
│
├── public/                      # Static Assets
│   ├── images/
│   └── icons/
│
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment (gitignored)
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
├── next.config.ts              # Next.js config
├── README.md                   # Documentation
└── SETUP_GUIDE.md             # Setup instructions
```

## 🔄 Data Flow

### 1. Authentication Flow
```
User clicks "Login"
    ↓
Firebase Auth (Google/Facebook popup)
    ↓
Firebase returns user token
    ↓
POST /api/auth/signup (create/update user in MongoDB)
    ↓
AuthContext updates user state
    ↓
Redirect to Dashboard or Placement Test
```

### 2. Learning Flow
```
User selects Course
    ↓
GET /api/courses/[id] (fetch course with units & lessons)
    ↓
User clicks Lesson
    ↓
GET /api/lessons/[id] (fetch lesson content)
    ↓
LessonPlayer renders exercises
    ↓
User completes exercises
    ↓
POST /api/progress (update progress, award XP)
    ↓
Update user stats (XP, hearts, streak)
```

### 3. AI Chat Flow
```
User types message in chatbot
    ↓
POST /api/chat (message)
    ↓
Gemini API processes with context
    ↓
Return AI response
    ↓
Display in chat UI
```

## 🗄 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  firebaseUid: String,
  email: String,
  displayName: String,
  photoURL: String,
  level: String, // beginner, elementary, intermediate, etc.
  xp: Number,
  streak: Number,
  hearts: Number,
  gems: Number,
  preferences: {
    learningGoal: String,
    dailyGoalMinutes: Number,
    interests: [String]
  },
  isAdmin: Boolean,
  createdAt: Date,
  lastActiveAt: Date
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  language: String,
  level: String,
  imageUrl: String,
  totalLessons: Number,
  isPublished: Boolean,
  createdAt: Date
}
```

### Units Collection
```javascript
{
  _id: ObjectId,
  courseId: ObjectId, // ref: Course
  title: String,
  description: String,
  order: Number,
  isLocked: Boolean
}
```

### Lessons Collection
```javascript
{
  _id: ObjectId,
  unitId: ObjectId, // ref: Unit
  title: String,
  type: String, // vocabulary, grammar, listening, etc.
  order: Number,
  xpReward: Number,
  content: {
    exercises: [{
      type: String,
      question: String,
      options: [String],
      correctAnswer: String,
      explanation: String,
      imageUrl: String,
      audioUrl: String
    }]
  }
}
```

### UserProgress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: User
  courseId: ObjectId,
  unitId: ObjectId,
  lessonId: ObjectId,
  status: String, // not-started, in-progress, completed
  score: Number,
  attemptsCount: Number,
  completedAt: Date
}
```

## 🔐 Security

### Authentication
- Firebase Auth handles login security
- JWT tokens verified on server-side
- Firebase Admin SDK validates tokens

### API Protection
```typescript
// Middleware pattern
const token = req.headers.get('Authorization')?.split('Bearer ')[1];
const decodedToken = await adminAuth.verifyIdToken(token);
// Proceed with authenticated request
```

### Environment Variables
- Sensitive keys in `.env.local`
- Never committed to Git
- Different values for dev/production

## 🚀 Performance Optimization

### Next.js Features
- **Server Components**: Default for better performance
- **Client Components**: Only when needed (interactivity)
- **API Routes**: Backend endpoints without separate server

### Database
- **Indexes**: On frequently queried fields
- **Connection Pooling**: Reuse MongoDB connections
- **Caching**: Consider Redis for future

### Frontend
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components load on demand

## 📊 Monitoring & Analytics

### Recommended Tools
- **Vercel Analytics**: Built-in performance monitoring
- **MongoDB Atlas Monitoring**: Database metrics
- **Firebase Console**: Auth analytics
- **OpenAI Dashboard**: API usage tracking
- **Cloudinary Dashboard**: Media delivery stats

## 🔮 Future Enhancements

### Scalability
- Add Redis for caching
- Implement CDN for static assets
- Database sharding for large user base
- Microservices architecture (optional)

### Features
- Real-time leaderboard (WebSockets)
- Video lessons (streaming)
- Voice recognition (Web Speech API)
- Mobile app (React Native)
- Offline mode (PWA)

## 🛠 Development Workflow

```bash
# Local Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check code quality

# Database
# Use MongoDB Compass for GUI

# Git Workflow
git checkout -b feature/new-feature
# Make changes
git commit -m "Add: new feature"
git push origin feature/new-feature
# Create Pull Request
```

## 📚 Tech Stack Summary

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 16 | Full-stack framework |
| Language | TypeScript | Type-safe code |
| Database | MongoDB | NoSQL database |
| Auth | Firebase | Authentication |
| AI | Google Gemini | Chatbot |
| Storage | Cloudinary | Media files |
| Styling | Tailwind CSS | Utility-first CSS |
| UI | Radix UI | Accessible components |
| State | React Context | Global state |
| Forms | Native | Form handling |
| Deployment | Vercel | Hosting platform |

---

**Tài liệu này giúp hiểu rõ kiến trúc và cách hoạt động của LingoBros** 🎓
