# 📝 HƯỚNG DẪN TẠO NỘI DUNG - CONTENT CREATION GUIDE

## 🎯 Tổng quan

Để ứng dụng LingoBros hoạt động đầy đủ, bạn cần tạo nội dung khóa học. Đây là hướng dẫn từng bước.

## 🏗 Cấu trúc nội dung

```
Course (Khóa học)
  └── Unit (Đơn vị)
      └── Lesson (Bài học)
          └── Exercise (Bài tập)
```

## 📚 Ví dụ cấu trúc

### Course: English for Beginners
- **Unit 1**: Greetings & Introductions
  - Lesson 1.1: Hello & Goodbye (vocabulary)
  - Lesson 1.2: My Name Is... (grammar)
  - Lesson 1.3: Practice (quiz)
  
- **Unit 2**: Numbers & Time
  - Lesson 2.1: Numbers 1-10 (vocabulary)
  - Lesson 2.2: What Time Is It? (listening)
  - Lesson 2.3: Practice (quiz)

- **Unit 3**: Family & Friends
  - ...

## 🚀 Cách tạo nội dung

### Option 1: Qua API (Postman/Thunder Client)

#### 1. Tạo Course
```http
POST http://localhost:3000/api/courses
Content-Type: application/json

{
  "title": "English for Beginners",
  "description": "Khóa học tiếng Anh cơ bản cho người mới bắt đầu",
  "language": "English",
  "level": "beginner",
  "isPublished": true
}
```

**Response**: Lưu lại `_id` của course

#### 2. Tạo Unit
```http
POST http://localhost:3000/api/units
Content-Type: application/json

{
  "courseId": "673abcdef1234567890",
  "title": "Unit 1: Greetings & Introductions",
  "description": "Học cách chào hỏi và giới thiệu bản thân",
  "order": 1,
  "isLocked": false
}
```

**Response**: Lưu lại `_id` của unit

#### 3. Tạo Lesson
```http
POST http://localhost:3000/api/lessons
Content-Type: application/json

{
  "unitId": "673abcdef1234567891",
  "title": "Hello & Goodbye",
  "description": "Học từ vựng chào hỏi cơ bản",
  "type": "vocabulary",
  "order": 1,
  "xpReward": 10,
  "content": {
    "introduction": "Trong bài học này, bạn sẽ học cách chào hỏi bằng tiếng Anh",
    "exercises": [
      {
        "type": "multiple-choice",
        "question": "How do you say 'Xin chào' in English?",
        "options": ["Hello", "Goodbye", "Thanks", "Sorry"],
        "correctAnswer": "Hello",
        "explanation": "Hello là từ chào hỏi phổ biến nhất trong tiếng Anh"
      },
      {
        "type": "multiple-choice",
        "question": "What does 'Goodbye' mean in Vietnamese?",
        "options": ["Tạm biệt", "Xin chào", "Cảm ơn", "Xin lỗi"],
        "correctAnswer": "Tạm biệt",
        "explanation": "Goodbye có nghĩa là tạm biệt"
      },
      {
        "type": "fill-blank",
        "question": "______ ! How are you?",
        "correctAnswer": "Hello",
        "explanation": "Chúng ta dùng Hello để chào hỏi"
      }
    ],
    "tips": [
      "Hello dùng khi chào hỏi",
      "Goodbye dùng khi chia tay",
      "Hi là cách nói thân mật hơn Hello"
    ]
  }
}
```

### Option 2: Tạo Seed Script

Tôi đã chuẩn bị một script mẫu:

```typescript
// scripts/seed.ts
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Unit from '@/models/Unit';
import Lesson from '@/models/Lesson';

async function seed() {
  await connectDB();

  // Create Course
  const course = await Course.create({
    title: "English for Beginners",
    description: "Khóa học tiếng Anh cơ bản",
    level: "beginner",
    isPublished: true,
  });

  // Create Unit
  const unit = await Unit.create({
    courseId: course._id,
    title: "Unit 1: Greetings",
    description: "Học chào hỏi",
    order: 1,
  });

  // Create Lessons
  await Lesson.create({
    unitId: unit._id,
    title: "Hello & Goodbye",
    type: "vocabulary",
    order: 1,
    xpReward: 10,
    content: {
      exercises: [
        {
          type: "multiple-choice",
          question: "How do you say 'Xin chào'?",
          options: ["Hello", "Goodbye", "Thanks", "Sorry"],
          correctAnswer: "Hello",
          explanation: "Hello là chào hỏi"
        }
      ]
    }
  });

  console.log('✅ Seed completed!');
  process.exit(0);
}

seed();
```

Chạy script:
```bash
npx tsx scripts/seed.ts
```

## 📝 Mẫu nội dung đầy đủ

### Course Template
```json
{
  "title": "Tên khóa học",
  "description": "Mô tả khóa học",
  "language": "English",
  "level": "beginner|elementary|intermediate|upper-intermediate|advanced",
  "imageUrl": "https://cloudinary.com/...",
  "isPublished": true
}
```

### Unit Template
```json
{
  "courseId": "course-id-here",
  "title": "Unit X: Tên unit",
  "description": "Mô tả unit",
  "order": 1,
  "isLocked": false
}
```

### Lesson Template
```json
{
  "unitId": "unit-id-here",
  "title": "Tên bài học",
  "description": "Mô tả ngắn",
  "type": "vocabulary|grammar|listening|speaking|quiz|story",
  "order": 1,
  "xpReward": 10,
  "content": {
    "introduction": "Giới thiệu bài học",
    "exercises": [...],
    "tips": ["Tip 1", "Tip 2"]
  }
}
```

### Exercise Types

#### 1. Multiple Choice
```json
{
  "type": "multiple-choice",
  "question": "Câu hỏi?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Giải thích đáp án",
  "imageUrl": "https://... (optional)",
  "audioUrl": "https://... (optional)"
}
```

#### 2. Fill in the Blank
```json
{
  "type": "fill-blank",
  "question": "I ___ a student.",
  "correctAnswer": "am",
  "explanation": "Dùng 'am' với 'I'"
}
```

#### 3. Listening
```json
{
  "type": "listen",
  "question": "What did you hear?",
  "audioUrl": "https://cloudinary.com/audio.mp3",
  "options": ["Option A", "Option B", "Option C"],
  "correctAnswer": "Option A",
  "explanation": "..."
}
```

#### 4. Translation
```json
{
  "type": "translate",
  "question": "Translate to English: 'Tôi là học sinh'",
  "correctAnswer": "I am a student",
  "explanation": "..."
}
```

## 🎨 Upload Media (Images/Audio)

### Qua API
```http
POST http://localhost:3000/api/upload
Content-Type: multipart/form-data

{
  "file": <file-upload>,
  "folder": "lingobros/lessons"
}
```

**Response**:
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "lingobros/lessons/abc123"
}
```

Dùng `url` này trong lesson content.

## 📊 Suggested Content Structure

### Beginner Level (A1-A2)

**Course 1: English Basics**
- Unit 1: Alphabet & Pronunciation
- Unit 2: Greetings & Introductions
- Unit 3: Numbers & Colors
- Unit 4: Family & Relationships
- Unit 5: Daily Activities

**Course 2: Basic Grammar**
- Unit 1: Present Simple
- Unit 2: Present Continuous
- Unit 3: Past Simple
- Unit 4: Future (will/going to)

### Elementary Level (A2-B1)

**Course 3: Everyday English**
- Unit 1: Shopping
- Unit 2: At a Restaurant
- Unit 3: Travel & Transportation
- Unit 4: Health & Body

### Intermediate & Above (B1-C2)

**Course 4: Business English**
**Course 5: Academic English**
**Course 6: IELTS Preparation**

## 🤖 AI-Generated Content

Bạn có thể dùng ChatGPT/Claude để tạo nội dung:

**Prompt Example**:
```
Tạo 10 câu hỏi trắc nghiệm về Present Simple tense 
trong tiếng Anh, mỗi câu có 4 đáp án, định dạng JSON:

{
  "type": "multiple-choice",
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "A",
  "explanation": "..."
}
```

## 📈 Recommended Learning Path

```
Placement Test
    ↓
Level Determination (A1, A2, B1, B2, C1, C2)
    ↓
Recommended Courses
    ↓
Sequential Units
    ↓
Lesson-by-Lesson Progression
```

## ✅ Quality Checklist

Mỗi lesson nên có:
- [ ] 5-10 exercises
- [ ] Đa dạng exercise types
- [ ] Explanation cho mỗi câu
- [ ] Tips/notes
- [ ] Độ khó phù hợp
- [ ] Hình ảnh (nếu có)
- [ ] Audio (cho listening)

## 🎯 Content Creation Tools

### Recommended
1. **ChatGPT/Claude** - Generate questions
2. **Canva** - Create images
3. **Google Text-to-Speech** - Generate audio
4. **Grammarly** - Check grammar
5. **DeepL** - Translation quality check

### Free Resources
- **Pixabay** - Free images
- **Unsplash** - Free photos
- **Freesound** - Free audio
- **TTS Tools** - Text-to-speech

## 💡 Tips

1. **Start Small**: Tạo 1 course → 3 units → 15 lessons trước
2. **Test Often**: Test từng lesson sau khi tạo
3. **User Feedback**: Thu thập feedback để improve
4. **Progressive Difficulty**: Tăng dần độ khó
5. **Real Context**: Dùng ví dụ thực tế
6. **Engaging**: Làm cho vui và thú vị

## 📞 Cần giúp?

Nếu bạn cần:
- Script tự động tạo nội dung
- Mẫu nội dung sẵn
- Convert từ file Excel/CSV
- Bulk import

→ Tôi có thể giúp tạo script automation!

---

**Good luck với content creation! 🎨📚**
