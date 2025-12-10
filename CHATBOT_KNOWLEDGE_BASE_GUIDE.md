# 🤖 CHATBOT FROSTY - KNOWLEDGE BASE GUIDE

## 📋 Tổng quan

Chatbot Frosty đã được nâng cấp với **Knowledge Base** toàn diện về hệ thống LingoBros. Giờ đây Frosty hiểu rõ:

- ✅ Cấu trúc database (User, Course, Topic, Lesson, Exercise, UserProgress...)
- ✅ API endpoints và cách sử dụng
- ✅ Quy trình học tập (Onboarding → Placement Test → Courses → Topics → Lessons)
- ✅ Gamification (XP, Hearts, Streak)
- ✅ FAQ thường gặp
- ✅ Technical stack

## 🎯 Những câu hỏi Frosty có thể trả lời

### Về hệ thống LingoBros
```
- "LingoBros là gì?"
- "Có những tính năng gì?"
- "Làm sao để bắt đầu học?"
- "Miễn phí không?"
```

### Về cấu trúc học tập
```
- "Cấu trúc bài học như thế nào?"
- "Có bao nhiêu loại bài tập?"
- "Lesson bị khóa, mở như thế nào?"
- "Topic là gì?"
```

### Về Gamification
```
- "XP là gì? Kiếm bằng cách nào?"
- "Hearts là gì?"
- "Hết hearts thì sao?"
- "Streak là gì?"
- "Làm sao lên top leaderboard?"
```

### Về học tiếng Anh
```
- "Phân biệt 'affect' và 'effect'?"
- "Cách dùng present perfect?"
- "Giải thích idiom 'break a leg'"
- "Sửa lỗi: 'He go to school everyday'"
```

### Về Frosty
```
- "Frosty là ai?"
- "Frosty có thể làm gì?"
- "Chat với Frosty có mất phí không?"
```

## 🔧 Cách sử dụng (cho developers)

### 1. Basic Chat (không context)

```typescript
// Client-side
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Optional, for logged-in users
  },
  body: JSON.stringify({
    message: "XP là gì?"
  })
});

const data = await response.json();
console.log(data.message); // Frosty's response
```

### 2. Chat với Context (khi user đang học lesson)

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: "Giải thích câu này cho tôi",
    contextType: "lesson",
    contextData: {
      lessonTitle: "How to say Hello",
      lessonType: "vocabulary",
      exercisesCompleted: 5,
      totalExercises: 10
    }
  })
});
```

### 3. Chat với Context (khi user làm sai bài tập)

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: "Tại sao đáp án này sai?",
    contextType: "exercise",
    contextData: {
      exerciseType: "multiple-choice",
      question: "How are you?",
      isCorrect: false
    }
  })
});
```

### 4. Sử dụng buildChatbotContext helper

```typescript
import { buildChatbotContext } from '@/lib/chatbot-knowledge-base';

// Build context for lesson
const lessonContext = buildChatbotContext('lesson', {
  lessonTitle: "Present Simple Tense",
  lessonType: "grammar",
  exercisesCompleted: 3,
  totalExercises: 8
});

// Build context for vocabulary question
const vocabContext = buildChatbotContext('vocabulary', {
  word: "elaborate"
});

// Build context for grammar question
const grammarContext = buildChatbotContext('grammar', {
  grammarTopic: "Past Perfect vs Past Simple"
});
```

### 5. Kiểm tra FAQ trước khi gọi AI

```typescript
import { getFAQAnswer } from '@/lib/chatbot-knowledge-base';

const userQuestion = "XP là gì?";
const faqAnswer = getFAQAnswer(userQuestion);

if (faqAnswer) {
  // Trả lời luôn từ FAQ, không cần gọi Gemini API
  return faqAnswer;
} else {
  // Không có trong FAQ, gọi Gemini API
  const response = await getEnglishTutorResponse(userQuestion);
  return response;
}
```

## 📊 Knowledge Base Structure

File: `lib/chatbot-knowledge-base.ts`

```typescript
export const SYSTEM_KNOWLEDGE = {
  overview: {...},           // Tổng quan hệ thống
  models: {                  // Database models
    User: {...},
    Course: {...},
    Topic: {...},
    Lesson: {...},
    Exercise: {...},
    UserProgress: {...},
    // ...
  },
  api: {                     // API endpoints
    courses: {...},
    lessons: {...},
    progress: {...},
    chat: {...},
    // ...
  },
  gamification: {            // XP, Hearts, Streak
    XP: {...},
    Hearts: {...},
    Streak: {...},
    Achievements: {...}
  },
  learningFlow: {            // Quy trình học
    step1_Onboarding: {...},
    step2_PlacementTest: {...},
    // ...
  },
  chatbot: {                 // Thông tin về Frosty
    name: "Frosty",
    personality: "...",
    capabilities: [...],
    // ...
  },
  faq: {                     // Câu hỏi thường gặp
    about_system: {...},
    about_learning: {...},
    about_gamification: {...},
    // ...
  },
  techStack: {...},          // Tech stack
  examples: {...}            // Dữ liệu mẫu
};
```

## 🎨 Context Types

Các `contextType` được hỗ trợ:

| Context Type | Khi nào dùng | Context Data |
|--------------|--------------|--------------|
| `lesson` | User đang học lesson | `{ lessonTitle, lessonType, exercisesCompleted, totalExercises }` |
| `exercise` | User đang làm bài tập | `{ exerciseType, question, isCorrect }` |
| `grammar` | Câu hỏi về ngữ pháp | `{ grammarTopic }` |
| `vocabulary` | Câu hỏi về từ vựng | `{ word }` |
| `general` | Câu hỏi chung về LingoBros | `{}` |

## ✨ Tính năng mới

### 1. FAQ Instant Response
- Câu hỏi nằm trong FAQ sẽ được trả lời **ngay lập tức** mà không cần gọi Gemini API
- Tiết kiệm chi phí và thời gian
- Response bao gồm `isFAQ: true`

### 2. Enhanced System Knowledge
- Frosty hiểu rõ toàn bộ hệ thống (database, API, gamification)
- Trả lời chính xác hơn về cách hoạt động của LingoBros
- Có thể hướng dẫn user sử dụng các tính năng

### 3. Context-Aware Responses
- Frosty biết user đang làm gì (học lesson nào, gặp lỗi gì)
- Đưa ra gợi ý phù hợp với ngữ cảnh
- Giải thích bài tập dựa trên loại exercise

## 🔍 Testing

### Test FAQ
```bash
# Gửi request với câu hỏi FAQ
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "XP là gì?"}'

# Expected: Instant response với isFAQ: true
```

### Test với Context
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Giải thích câu này",
    "contextType": "lesson",
    "contextData": {
      "lessonTitle": "Present Simple",
      "lessonType": "grammar"
    }
  }'
```

### Test tiếng Anh
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Phân biệt affect và effect?"}'
```

## 📝 Maintenance

### Cập nhật FAQ
Edit file `lib/chatbot-knowledge-base.ts`, thêm vào `faq` section:

```typescript
faq: {
  about_system: {
    "Câu hỏi mới?": "Câu trả lời mới"
  }
}
```

### Thêm Context Type mới
1. Thêm vào `buildChatbotContext` function
2. Document trong guide này
3. Test thoroughly

### Cập nhật System Knowledge
Khi có thay đổi về database models, API endpoints, hoặc flow:
1. Update `SYSTEM_KNOWLEDGE` object
2. Frosty sẽ tự động nhận được thông tin mới
3. Không cần retrain model

## 🚀 Performance Tips

1. **Cache FAQ responses** ở client-side
2. **Debounce** user input trước khi gọi API
3. **Limit message length** để tránh spam
4. **Rate limiting** cho `/api/chat` endpoint
5. **Monitor Gemini API usage** để kiểm soát chi phí

## 🎯 Next Steps

- [ ] Thêm voice input/output cho Frosty
- [ ] Personalized learning recommendations
- [ ] Multi-turn conversation với memory
- [ ] Analytics dashboard cho chat interactions
- [ ] A/B testing different prompts

## 📞 Support

Nếu có vấn đề với chatbot:
1. Check console logs
2. Verify Gemini API key trong `.env.local`
3. Test với simple messages trước
4. Check network requests in DevTools

---

**Happy chatting with Frosty! ☃️**
