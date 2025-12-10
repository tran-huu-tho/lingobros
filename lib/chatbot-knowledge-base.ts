/**
 * LINGOBROS KNOWLEDGE BASE - Training Data cho Chatbot Frosty ☃️
 * File này chứa toàn bộ kiến thức về hệ thống LingoBros
 */

export const SYSTEM_KNOWLEDGE = {
  // ========== TỔNG QUAN HỆ THỐNG ==========
  overview: {
    name: "LingoBros",
    description: "Ứng dụng học tiếng Anh trực tuyến gamification với AI chatbot Frosty",
    platform: "Next.js 14 (App Router), TypeScript, MongoDB, Firebase Auth, Google Gemini AI",
    features: [
      "Học tiếng Anh theo lộ trình có cấu trúc",
      "Bài tập tương tác đa dạng (multiple-choice, fill-blank, word-order, listen-repeat, match, translate)",
      "Hệ thống XP, Hearts, Streak để tăng động lực học",
      "AI Chatbot Frosty hỗ trợ học tập 24/7",
      "Placement Test để xác định trình độ",
      "Forum cộng đồng học viên",
      "Leaderboard xếp hạng",
      "Admin dashboard quản lý nội dung"
    ]
  },

  // ========== DATABASE MODELS ==========
  models: {
    User: {
      description: "Lưu thông tin người dùng",
      fields: {
        firebaseUid: "ID từ Firebase Authentication (unique)",
        email: "Email người dùng (unique)",
        displayName: "Tên hiển thị",
        photoURL: "Ảnh đại diện",
        bio: "Tiểu sử cá nhân",
        level: "Trình độ hiện tại (beginner/intermediate/advanced)",
        xp: "Điểm kinh nghiệm (Experience Points)",
        streak: "Số ngày học liên tiếp",
        hearts: "Số tim (mạng sống khi làm sai bài tập, mặc định 50)",
        lastHeartUpdate: "Lần cập nhật hearts gần nhất",
        studyTime: "Tổng thời gian học (seconds)",
        learningGoal: "Mục tiêu học tập",
        preferences: {
          learningGoal: "Mục đích học (communication/study-abroad/exam/improvement/other)",
          dailyGoalMinutes: "Mục tiêu học mỗi ngày (phút)",
          notificationsEnabled: "Bật/tắt thông báo",
          soundEnabled: "Bật/tắt âm thanh",
          interests: "Sở thích cá nhân"
        },
        hasCompletedOnboarding: "Đã hoàn thành onboarding chưa",
        isAdmin: "Có quyền admin không",
        lastActiveAt: "Lần hoạt động gần nhất",
        createdAt: "Ngày tạo tài khoản"
      },
      notes: "Hearts tự động reset về 50 mỗi ngày. Mỗi câu sai trừ 1 heart."
    },

    Level: {
      description: "Các cấp độ học (Beginner, Intermediate, Advanced)",
      fields: {
        name: "Tên code (beginner/intermediate/advanced)",
        displayName: "Tên hiển thị tiếng Việt (Cơ bản/Trung cấp/Nâng cao)",
        description: "Mô tả cấp độ",
        color: "Màu đại diện",
        isActive: "Đang hoạt động hay không"
      }
    },

    Course: {
      description: "Khóa học thuộc một Level",
      fields: {
        title: "Tên khóa học",
        slug: "URL slug (unique)",
        description: "Mô tả khóa học",
        level: "Reference đến Level (beginner/intermediate/advanced)",
        color: "Màu chủ đạo",
        gradientFrom: "Màu gradient bắt đầu",
        gradientTo: "Màu gradient kết thúc",
        totalTopics: "Tổng số topics",
        totalLessons: "Tổng số lessons",
        estimatedHours: "Thời gian ước tính (giờ)",
        isPublished: "Đã publish chưa",
        isActive: "Đang hoạt động hay không"
      },
      structure: "Level -> Course -> Topic -> Lesson -> Exercise"
    },

    Topic: {
      description: "Chủ đề trong Course (ví dụ: Greetings, Numbers, Colors)",
      fields: {
        courseId: "Reference đến Course",
        title: "Tên topic",
        description: "Mô tả topic",
        icon: "Icon emoji (🏠, 👋, 🔢)",
        color: "Màu sắc",
        order: "Thứ tự hiển thị",
        totalLessons: "Số lượng lessons",
        xpReward: "XP thưởng khi hoàn thành (mặc định 50)",
        isLocked: "Có bị khóa không",
        unlockCondition: {
          requiredTopicId: "Topic cần hoàn thành trước",
          requiredScore: "Điểm tối thiểu cần đạt"
        },
        thumbnail: "Ảnh thumbnail",
        estimatedMinutes: "Thời gian ước tính (phút)",
        isPublished: "Đã publish chưa"
      }
    },

    Lesson: {
      description: "Bài học trong Topic",
      fields: {
        topicId: "Reference đến Topic",
        title: "Tên bài học",
        description: "Mô tả bài học",
        type: "Loại bài học (vocabulary/grammar/listening/speaking/practice/story)",
        order: "Thứ tự trong topic",
        xpReward: "XP thưởng (mặc định 10)",
        content: {
          introduction: "Phần giới thiệu",
          vocabulary: [
            {
              word: "Từ vựng",
              pronunciation: "Phiên âm",
              meaning: "Nghĩa",
              example: "Câu ví dụ",
              audioUrl: "Link audio"
            }
          ],
          grammarPoints: [
            {
              rule: "Quy tắc ngữ pháp",
              examples: ["Ví dụ 1", "Ví dụ 2"],
              notes: "Ghi chú thêm"
            }
          ],
          tips: ["Mẹo học tập"]
        },
        thumbnailUrl: "Ảnh thumbnail",
        videoUrl: "Link video bài học",
        audioUrl: "Link audio bài học",
        isLocked: "Có bị khóa không",
        unlockCondition: {
          requiredLessonId: "Lesson cần học trước",
          minimumScore: "Điểm tối thiểu"
        },
        difficulty: "Độ khó (easy/medium/hard)",
        estimatedMinutes: "Thời gian ước tính (phút, mặc định 15)",
        isPublished: "Đã publish chưa"
      }
    },

    Exercise: {
      description: "Bài tập trong Lesson hoặc Quiz",
      fields: {
        topicId: "Reference đến Topic",
        type: "Loại bài tập",
        question: "Câu hỏi",
        questionAudio: "Audio câu hỏi",
        questionImage: "Ảnh câu hỏi",
        difficulty: "Độ khó (easy/medium/hard)"
      },
      types: {
        "multiple-choice": {
          fields: ["options", "correctAnswer"],
          description: "Trắc nghiệm nhiều lựa chọn",
          example: {
            question: "How are you?",
            options: ["I'm fine", "I'm 5 years old", "I'm a student"],
            correctAnswer: "I'm fine"
          }
        },
        "fill-blank": {
          fields: ["sentence", "blanks"],
          description: "Điền vào chỗ trống",
          example: {
            sentence: "I ___ a student",
            blanks: [
              {
                position: 2,
                answer: "am",
                acceptableAnswers: ["am", "'m"]
              }
            ]
          }
        },
        "word-order": {
          fields: ["words", "correctOrder"],
          description: "Sắp xếp từ thành câu",
          example: {
            words: ["am", "I", "a", "student"],
            correctOrder: ["I", "am", "a", "student"]
          }
        },
        "listen-repeat": {
          fields: ["targetSentence", "targetAudio", "minAccuracy"],
          description: "Nghe và lặp lại (speech recognition)",
          example: {
            targetSentence: "Hello, how are you?",
            targetAudio: "https://...",
            minAccuracy: 70
          }
        },
        "match": {
          fields: ["pairs"],
          description: "Ghép cặp (từ - nghĩa, câu hỏi - câu trả lời)",
          example: {
            pairs: [
              { left: "Hello", right: "Xin chào" },
              { left: "Goodbye", right: "Tạm biệt" }
            ]
          }
        },
        "translate": {
          fields: ["correctAnswer"],
          description: "Dịch câu",
          example: {
            question: "Tôi là một học sinh",
            correctAnswer: "I am a student"
          }
        }
      },
      commonFields: {
        explanation: "Giải thích đáp án",
        hint: "Gợi ý cho người học"
      }
    },

    Quiz: {
      description: "Bài kiểm tra tổng hợp các Exercise",
      fields: {
        title: "Tên quiz",
        description: "Mô tả quiz",
        topicId: "Reference đến Topic (nếu quiz thuộc topic)",
        questions: [
          {
            exerciseId: "Reference đến Exercise",
            order: "Thứ tự câu hỏi",
            points: "Điểm cho câu hỏi (mặc định 10)"
          }
        ],
        duration: "Thời gian làm bài (phút)",
        passingScore: "Điểm đạt (%, mặc định 70)",
        shuffleQuestions: "Có xáo trộn câu hỏi không",
        isPublished: "Đã publish chưa"
      }
    },

    UserProgress: {
      description: "Lưu tiến trình học tập của user",
      fields: {
        userId: "Reference đến User",
        courseId: "Reference đến Course",
        topicId: "Reference đến Topic",
        lessonId: "Reference đến Lesson",
        quizId: "Reference đến Quiz",
        status: "Trạng thái (not-started/in-progress/completed)",
        score: "Điểm số đạt được",
        maxScore: "Điểm tối đa",
        accuracy: "Phần trăm chính xác (%)",
        attemptsCount: "Số lần thử",
        timeSpent: "Thời gian đã học (seconds)",
        exercisesCompleted: "Số bài tập đã hoàn thành",
        totalExercises: "Tổng số bài tập",
        exerciseResults: [
          {
            exerciseId: "ID bài tập",
            isCorrect: "Đúng/sai",
            score: "Điểm",
            timeSpent: "Thời gian (seconds)",
            attempts: "Số lần thử"
          }
        ],
        startedAt: "Thời điểm bắt đầu",
        completedAt: "Thời điểm hoàn thành",
        lastAccessedAt: "Lần truy cập gần nhất"
      },
      notes: "Mỗi lần user làm bài, tạo/update progress. XP được cộng vào User khi completed."
    },

    ChatHistory: {
      description: "Lịch sử chat với Frosty",
      fields: {
        userId: "Reference đến User (hoặc null nếu guest)",
        messages: [
          {
            role: "user hoặc assistant",
            content: "Nội dung tin nhắn",
            timestamp: "Thời gian gửi"
          }
        ]
      }
    },

    ForumPost: {
      description: "Bài đăng trong diễn đàn cộng đồng",
      fields: {
        userId: "Người đăng",
        title: "Tiêu đề",
        content: "Nội dung",
        category: "Chuyên mục (grammar/vocabulary/listening/speaking/general)",
        tags: "Tags phân loại",
        likes: "Số lượt thích",
        views: "Số lượt xem",
        comments: [
          {
            userId: "Người comment",
            content: "Nội dung comment",
            createdAt: "Thời gian"
          }
        ]
      }
    },

    TranslationHistory: {
      description: "Lịch sử dịch thuật của user",
      fields: {
        userId: "Reference đến User",
        sourceText: "Văn bản gốc",
        translatedText: "Văn bản đã dịch",
        sourceLang: "Ngôn ngữ nguồn (vi/en)",
        targetLang: "Ngôn ngữ đích (vi/en)"
      }
    },

    Achievement: {
      description: "Thành tích/huy hiệu",
      fields: {
        title: "Tên thành tích",
        description: "Mô tả",
        icon: "Icon/emoji",
        condition: "Điều kiện đạt được",
        xpReward: "XP thưởng"
      }
    },

    LearningPath: {
      description: "Lộ trình học tập đề xuất",
      fields: {
        title: "Tên lộ trình",
        description: "Mô tả",
        level: "Cấp độ phù hợp",
        courses: ["Danh sách courseId theo thứ tự"],
        estimatedWeeks: "Thời gian ước tính (tuần)"
      }
    }
  },

  // ========== API ENDPOINTS ==========
  api: {
    auth: {
      "/api/auth/signup": {
        method: "POST",
        description: "Tạo tài khoản mới sau khi đăng ký Firebase",
        body: { firebaseUid: "string", email: "string", displayName: "string", photoURL: "string?" },
        response: { user: "User object" }
      }
    },
    users: {
      "/api/users/me": {
        GET: {
          description: "Lấy thông tin user hiện tại",
          auth: "Required (Bearer token)",
          response: { user: "User object" }
        },
        PATCH: {
          description: "Cập nhật thông tin user",
          auth: "Required",
          body: { displayName: "string?", bio: "string?", preferences: "object?" },
          response: { user: "Updated user" }
        }
      },
      "/api/users/stats": {
        GET: {
          description: "Lấy thống kê học tập của user",
          auth: "Required",
          response: { totalXp: "number", streak: "number", lessonsCompleted: "number", studyTime: "number" }
        }
      },
      "/api/users/daily-checkin": {
        POST: {
          description: "Check-in hàng ngày (tăng streak, nhận XP)",
          auth: "Required",
          response: { streak: "number", xpGained: "number" }
        }
      },
      "/api/users/upload-avatar": {
        POST: {
          description: "Upload ảnh đại diện lên Cloudinary",
          auth: "Required",
          body: { image: "base64 string hoặc file" },
          response: { photoURL: "string" }
        }
      }
    },
    courses: {
      "/api/courses": {
        GET: {
          description: "Lấy danh sách courses",
          query: { level: "beginner|intermediate|advanced (optional)" },
          response: { courses: "Course[] with populated level" }
        },
        POST: {
          description: "Tạo course mới (Admin only)",
          auth: "Required (Admin)",
          body: "Course data",
          response: { course: "Created course" }
        }
      },
      "/api/courses/[id]": {
        GET: {
          description: "Lấy chi tiết course và danh sách topics",
          response: { course: "Course object", topics: "Topic[]" }
        }
      }
    },
    topics: {
      "/api/topics": {
        GET: {
          description: "Lấy danh sách topics theo courseId",
          query: { courseId: "string" },
          response: { topics: "Topic[]" }
        }
      },
      "/api/topics/[id]": {
        GET: {
          description: "Lấy chi tiết topic và lessons",
          response: { topic: "Topic object", lessons: "Lesson[]" }
        }
      }
    },
    lessons: {
      "/api/lessons/[id]": {
        GET: {
          description: "Lấy chi tiết lesson (content, vocabulary, grammar)",
          response: { lesson: "Lesson object with full content" }
        }
      },
      "/api/lessons/[id]/exercises": {
        GET: {
          description: "Lấy danh sách exercises của lesson",
          response: { exercises: "Exercise[]" }
        }
      }
    },
    quizzes: {
      "/api/quizzes": {
        GET: {
          description: "Lấy danh sách quizzes",
          query: { topicId: "string (optional)" },
          response: { quizzes: "Quiz[]" }
        }
      },
      "/api/quizzes/[id]": {
        GET: {
          description: "Lấy chi tiết quiz với questions",
          response: { quiz: "Quiz with populated exercises" }
        }
      },
      "/api/quizzes/submit": {
        POST: {
          description: "Nộp bài quiz",
          auth: "Required",
          body: { quizId: "string", answers: "object", timeSpent: "number" },
          response: { score: "number", passed: "boolean", feedback: "string" }
        }
      }
    },
    progress: {
      "/api/progress": {
        GET: {
          description: "Lấy tiến trình học tập của user",
          auth: "Required",
          query: { courseId: "string?", topicId: "string?", lessonId: "string?" },
          response: { progress: "UserProgress[]" }
        },
        POST: {
          description: "Cập nhật tiến trình học tập",
          auth: "Required",
          body: { lessonId: "string", status: "string", score: "number", exerciseResults: "array" },
          response: { progress: "Updated UserProgress", xpGained: "number" }
        }
      }
    },
    chat: {
      "/api/chat": {
        POST: {
          description: "Chat với Frosty AI (hỗ trợ cả guest và logged-in user)",
          auth: "Optional",
          body: { message: "string", context: "string?" },
          response: { message: "AI response", timestamp: "Date", isGuest: "boolean" }
        },
        GET: {
          description: "Lấy lịch sử chat (logged-in user only)",
          auth: "Required",
          response: { messages: "ChatMessage[]" }
        }
      }
    },
    translate: {
      "/api/translate": {
        POST: {
          description: "Dịch văn bản (Google Translate API)",
          body: { text: "string", sourceLang: "vi|en", targetLang: "vi|en" },
          response: { translatedText: "string" }
        }
      }
    },
    ipa: {
      "/api/ipa": {
        POST: {
          description: "Chuyển văn bản thành phiên âm IPA",
          body: { text: "string" },
          response: { ipa: "string" }
        }
      }
    },
    forum: {
      "/api/forum/posts": {
        GET: {
          description: "Lấy danh sách bài đăng",
          query: { category: "string?", page: "number?", limit: "number?" },
          response: { posts: "ForumPost[]", totalPages: "number" }
        },
        POST: {
          description: "Tạo bài đăng mới",
          auth: "Required",
          body: { title: "string", content: "string", category: "string", tags: "string[]" },
          response: { post: "Created ForumPost" }
        }
      }
    },
    leaderboard: {
      "/api/leaderboard": {
        GET: {
          description: "Lấy bảng xếp hạng top users theo XP",
          query: { limit: "number (default 50)" },
          response: { leaderboard: "User[] sorted by XP" }
        }
      }
    },
    onboarding: {
      "/api/onboarding": {
        POST: {
          description: "Hoàn thành onboarding và lưu preferences",
          auth: "Required",
          body: { learningGoal: "string", dailyGoalMinutes: "number", interests: "string[]" },
          response: { user: "Updated User" }
        }
      }
    },
    admin: {
      "/api/admin/courses": {
        description: "CRUD operations cho courses (Admin only)",
        auth: "Required (isAdmin = true)"
      },
      "/api/admin/topics": {
        description: "CRUD operations cho topics (Admin only)",
        auth: "Required (isAdmin = true)"
      },
      "/api/admin/lessons": {
        description: "CRUD operations cho lessons (Admin only)",
        auth: "Required (isAdmin = true)"
      },
      "/api/admin/exercises": {
        description: "CRUD operations cho exercises (Admin only)",
        auth: "Required (isAdmin = true)"
      },
      "/api/admin/quizzes": {
        description: "CRUD operations cho quizzes (Admin only)",
        auth: "Required (isAdmin = true)"
      },
      "/api/admin/students": {
        GET: {
          description: "Lấy danh sách học viên (Admin only)",
          auth: "Required (isAdmin = true)",
          response: { students: "User[]" }
        }
      }
    }
  },

  // ========== GAMIFICATION SYSTEM ==========
  gamification: {
    XP: {
      description: "Experience Points - Điểm kinh nghiệm",
      earning: {
        "Hoàn thành lesson": "10 XP (default, có thể tùy chỉnh)",
        "Hoàn thành topic": "50 XP (default)",
        "Hoàn thành quiz đạt yêu cầu": "20-100 XP tùy độ khó",
        "Daily check-in": "5-10 XP",
        "Streak milestone": "Bonus XP khi đạt 7, 30, 100 ngày liên tiếp"
      },
      purpose: "Xếp hạng trên leaderboard, mở khóa thành tích"
    },
    Hearts: {
      description: "Mạng sống khi làm bài tập",
      mechanism: {
        initial: "50 hearts khi đăng ký",
        cost: "Mỗi câu trả lời sai trừ 1 heart",
        refill: "Tự động reset về 50 mỗi ngày (00:00)",
        limit: "Khi hết hearts, user vẫn học được nhưng không được cộng XP"
      }
    },
    Streak: {
      description: "Số ngày học liên tiếp",
      mechanism: {
        count: "Mỗi ngày user hoàn thành ít nhất 1 lesson, streak +1",
        reset: "Nếu 1 ngày không học, streak reset về 0",
        reward: "Milestones: 7 ngày (+50 XP), 30 ngày (+200 XP), 100 ngày (+1000 XP)"
      }
    },
    Achievements: {
      examples: [
        "First Step: Hoàn thành lesson đầu tiên",
        "Quick Learner: Hoàn thành 10 lessons trong 1 ngày",
        "Grammar Master: Đạt 100% accuracy ở 5 bài grammar",
        "Social Butterfly: Đăng 10 bài trong forum",
        "Dedication: Duy trì streak 30 ngày"
      ]
    }
  },

  // ========== LEARNING FLOW ==========
  learningFlow: {
    step1_Onboarding: {
      description: "User mới đăng ký sẽ làm onboarding",
      actions: [
        "Chọn mục tiêu học (communication/study-abroad/exam/improvement)",
        "Chọn thời gian học mỗi ngày (5/10/15/30 phút)",
        "Chọn sở thích (travel, movies, music, sports, etc.)",
        "Lưu preferences vào User.preferences"
      ]
    },
    step2_PlacementTest: {
      description: "Làm bài test xác định trình độ (beginner/intermediate/advanced)",
      actions: [
        "6 câu hỏi trắc nghiệm trộn từ 3 level",
        "Dựa vào kết quả, assign User.level",
        "Đề xuất Course phù hợp"
      ]
    },
    step3_ChooseCourse: {
      description: "Chọn Course trong Level của mình",
      actions: [
        "GET /api/courses?level=beginner",
        "Hiển thị danh sách courses",
        "User chọn course muốn học"
      ]
    },
    step4_StudyTopics: {
      description: "Học từng Topic trong Course",
      structure: "Course -> Topics (ordered) -> Lessons (ordered) -> Exercises",
      actions: [
        "GET /api/courses/[id] để lấy topics",
        "User chọn topic (check isLocked)",
        "GET /api/topics/[id] để lấy lessons",
        "User học từng lesson theo thứ tự"
      ]
    },
    step5_CompleteLesson: {
      description: "Học lesson và làm exercises",
      actions: [
        "GET /api/lessons/[id] để xem nội dung (vocabulary, grammar, tips)",
        "GET /api/lessons/[id]/exercises để lấy bài tập",
        "User làm từng exercise (multiple-choice, fill-blank, word-order, etc.)",
        "POST /api/progress để lưu kết quả và nhận XP",
        "Hearts giảm khi làm sai, XP tăng khi hoàn thành"
      ]
    },
    step6_TakeQuiz: {
      description: "Làm quiz tổng hợp topic",
      actions: [
        "GET /api/quizzes?topicId=[id]",
        "User làm bài quiz",
        "POST /api/quizzes/submit",
        "Nếu đạt passingScore (70%), topic completed, nhận XP reward"
      ]
    },
    step7_Progression: {
      description: "Tiến trình và unlock",
      mechanism: [
        "Topic sau có thể bị lock, cần hoàn thành topic trước",
        "Lesson sau có thể bị lock, cần đạt điểm tối thiểu lesson trước",
        "UserProgress tracking toàn bộ quá trình học"
      ]
    }
  },

  // ========== CHATBOT FROSTY ☃️ ==========
  chatbot: {
    name: "Frosty",
    icon: "☃️",
    personality: "Bựa bựa, lầy lội, thân thiện, đôi khi hơi quậy nhưng rất hữu ích",
    capabilities: [
      "Trả lời câu hỏi về tiếng Anh (ngữ pháp, từ vựng, phát âm)",
      "Giải thích bài tập, đưa ra gợi ý khi user gặp khó khăn",
      "Trò chuyện bằng tiếng Anh để luyện tập",
      "Sửa lỗi ngữ pháp, phát âm của user",
      "Đưa ra lời khuyên học tập cá nhân hóa",
      "Giải đáp thắc mắc về hệ thống LingoBros"
    ],
    technology: "Google Gemini 2.0 Flash (API)",
    features: {
      guestMode: "User chưa đăng nhập vẫn chat được, nhưng không lưu lịch sử",
      loggedInMode: "User đã đăng nhập, lưu lịch sử chat vào ChatHistory",
      context: "Có thể truyền context (ví dụ: đang học lesson nào, gặp khó khăn gì)"
    },
    responseStyle: {
      tone: "Thân thiện, hài hước, khuyến khích",
      language: "Chủ yếu tiếng Việt, có thêm tiếng Anh trong ngoặc",
      length: "Ngắn gọn, 1-5 dòng, không lan man",
      formatting: "KHÔNG dùng markdown bold/italic, trả lời thẳng vào vấn đề"
    },
    prompts: {
      system: `Bạn là Frosty ☃️ - trợ lý AI học tiếng Anh của LingoBros.
Tính cách: bựa bựa, lầy lội, thân thiện, đôi khi hơi quậy.
QUAN TRỌNG: Luôn trả lời tóm tắt ngắn gọn, chỉ 1-5 dòng, không lan man.
TUYỆT ĐỐI KHÔNG chào đầu, không giới thiệu bản thân.
KHÔNG dùng markdown để in đậm (**bold** hoặc *italic*).
Trả lời ngắn gọn, đúng trọng tâm, dùng tiếng Việt chính, có thể thêm tiếng Anh trong [ngoặc].`,
      exampleQuestions: [
        "Phân biệt 'affect' và 'effect'?",
        "Cách dùng present perfect?",
        "Giải thích idiom 'break a leg'",
        "Sửa lỗi: 'He go to school everyday'",
        "LingoBros có những gì?",
        "Làm sao tăng streak?"
      ]
    }
  },

  // ========== FREQUENTLY ASKED QUESTIONS ==========
  faq: {
    about_system: {
      "LingoBros là gì?": "LingoBros là ứng dụng học tiếng Anh trực tuyến với phương pháp gamification, có AI chatbot Frosty hỗ trợ 24/7. Học theo lộ trình có cấu trúc từ beginner đến advanced.",
      "Có những tính năng gì?": "- Lộ trình học có cấu trúc (Courses -> Topics -> Lessons)\n- Bài tập đa dạng: trắc nghiệm, điền từ, sắp xếp câu, nghe-lặp lại, ghép cặp, dịch\n- Hệ thống XP, Hearts, Streak\n- AI Chatbot Frosty\n- Forum cộng đồng\n- Leaderboard xếp hạng\n- Placement Test xác định trình độ",
      "Miễn phí không?": "Hiện tại LingoBros đang trong giai đoạn beta, hoàn toàn miễn phí cho tất cả tính năng.",
      "Cần đăng ký không?": "Cần đăng ký để lưu tiến trình học, tích lũy XP và streak. Nhưng có thể chat với Frosty mà không cần đăng nhập."
    },
    
    about_learning: {
      "Làm sao bắt đầu học?": "1. Đăng ký tài khoản\n2. Hoàn thành Onboarding (chọn mục tiêu học)\n3. Làm Placement Test để xác định trình độ\n4. Chọn Course phù hợp và bắt đầu học từ Topic đầu tiên",
      "Cấu trúc bài học như thế nào?": "Level (Beginner/Intermediate/Advanced) -> Course -> Topic -> Lesson -> Exercise",
      "Các loại bài tập có gì?": "1. Multiple-choice: Trắc nghiệm\n2. Fill-blank: Điền từ vào chỗ trống\n3. Word-order: Sắp xếp từ thành câu\n4. Listen-repeat: Nghe và lặp lại\n5. Match: Ghép cặp\n6. Translate: Dịch câu",
      "Lesson bị khóa, mở như thế nào?": "Hoàn thành lesson/topic trước đó với điểm tối thiểu yêu cầu (thường 70%)."
    },

    about_gamification: {
      "XP là gì? Kiếm bằng cách nào?": "XP (Experience Points) là điểm kinh nghiệm. Kiếm bằng:\n- Hoàn thành lesson: +10 XP\n- Hoàn thành topic: +50 XP\n- Hoàn thành quiz: +20-100 XP\n- Daily check-in: +5-10 XP\n- Streak milestone: Bonus XP",
      "Hearts là gì?": "Hearts là mạng sống. Mỗi câu sai trừ 1 heart. Bắt đầu với 50 hearts, tự động reset về 50 mỗi ngày.",
      "Hết hearts thì sao?": "Vẫn học được nhưng không được cộng XP cho đến khi hearts reset.",
      "Streak là gì?": "Số ngày học liên tiếp. Mỗi ngày hoàn thành ít nhất 1 lesson thì streak +1. Không học 1 ngày sẽ reset về 0.",
      "Làm sao lên top leaderboard?": "Tích lũy nhiều XP bằng cách học nhiều lessons, topics, quizzes và duy trì streak."
    },

    about_chatbot: {
      "Frosty là ai?": "Frosty ☃️ là AI chatbot học tiếng Anh của LingoBros, được trang bị Google Gemini AI. Frosty giúp giải đáp thắc mắc, sửa lỗi, luyện tập tiếng Anh.",
      "Chat với Frosty có mất phí không?": "Không, hoàn toàn miễn phí.",
      "Frosty có thể làm gì?": "- Trả lời câu hỏi ngữ pháp, từ vựng\n- Giải thích bài tập\n- Sửa lỗi câu của bạn\n- Trò chuyện bằng tiếng Anh\n- Tư vấn lộ trình học",
      "Guest có chat được không?": "Có, nhưng không lưu lịch sử. Đăng nhập để lưu lại cuộc trò chuyện."
    },

    about_progress: {
      "Xem tiến trình học ở đâu?": "Vào Dashboard hoặc Profile để xem XP, streak, lessons completed, study time.",
      "Tiến trình có bị mất không?": "Không, tất cả lưu trong database MongoDB, an toàn tuyệt đối.",
      "Có thể học lại lesson cũ không?": "Có, bất cứ lúc nào. UserProgress sẽ update với điểm cao nhất."
    },

    about_admin: {
      "Làm sao trở thành admin?": "Chỉ admin hiện tại mới có thể set isAdmin = true cho user khác. Liên hệ quản trị viên.",
      "Admin có quyền gì?": "CRUD courses, topics, lessons, exercises, quizzes. Xem danh sách học viên và tiến trình của họ."
    }
  },

  // ========== TECHNICAL STACK ==========
  techStack: {
    frontend: {
      framework: "Next.js 14 (App Router)",
      language: "TypeScript",
      styling: "Tailwind CSS",
      components: "Custom components in components/ folder",
      stateManagement: "React Context (AuthContext, ThemeContext)"
    },
    backend: {
      framework: "Next.js API Routes",
      database: "MongoDB Atlas (Mongoose ODM)",
      authentication: "Firebase Authentication (Google, Facebook)",
      fileStorage: "Cloudinary (images, audio)",
      ai: "Google Gemini 2.0 Flash"
    },
    deployment: {
      platform: "Vercel (recommended) hoặc tự host",
      database: "MongoDB Atlas (cloud)",
      env: ".env.local với các keys: MONGODB_URI, FIREBASE_*, GEMINI_API_KEY, CLOUDINARY_*"
    }
  },

  // ========== SAMPLE DATA EXAMPLES ==========
  examples: {
    user: {
      firebaseUid: "abc123firebase",
      email: "student@example.com",
      displayName: "Nguyễn Văn A",
      level: "beginner",
      xp: 250,
      streak: 7,
      hearts: 45,
      studyTime: 3600,
      hasCompletedOnboarding: true,
      isAdmin: false
    },
    course: {
      title: "English for Beginners",
      slug: "english-for-beginners",
      level: "beginner (Level ObjectId)",
      totalTopics: 10,
      totalLessons: 50,
      estimatedHours: 20
    },
    topic: {
      title: "Greetings & Introductions",
      icon: "👋",
      order: 1,
      totalLessons: 5,
      xpReward: 50
    },
    lesson: {
      title: "How to say Hello",
      type: "vocabulary",
      order: 1,
      xpReward: 10,
      content: {
        vocabulary: [
          {
            word: "Hello",
            pronunciation: "/həˈloʊ/",
            meaning: "Xin chào",
            example: "Hello, nice to meet you!",
            audioUrl: "https://cloudinary.com/audio/hello.mp3"
          }
        ]
      }
    },
    exercise_multipleChoice: {
      type: "multiple-choice",
      question: "How do you greet someone in the morning?",
      options: ["Good morning", "Good night", "Good afternoon", "Goodbye"],
      correctAnswer: "Good morning"
    },
    userProgress: {
      userId: "User ObjectId",
      lessonId: "Lesson ObjectId",
      status: "completed",
      score: 90,
      accuracy: 90,
      exercisesCompleted: 10,
      totalExercises: 10,
      timeSpent: 600
    }
  }
};

/**
 * Helper function: Tạo context string cho Frosty
 */
export function buildChatbotContext(contextType?: string, data?: any): string {
  const baseContext = `
=== HỆ THỐNG LINGOBROS ===
LingoBros là ứng dụng học tiếng Anh với gamification.

Cấu trúc: Level -> Course -> Topic -> Lesson -> Exercise

Gamification:
- XP: Điểm kinh nghiệm (hoàn thành lesson +10 XP, topic +50 XP)
- Hearts: Mạng sống (50 hearts, mỗi câu sai -1, reset mỗi ngày)
- Streak: Số ngày học liên tiếp

Loại bài tập: multiple-choice, fill-blank, word-order, listen-repeat, match, translate

API chính:
- /api/courses - Lấy danh sách khóa học
- /api/lessons/[id] - Chi tiết bài học
- /api/progress - Lưu tiến trình học
- /api/chat - Chat với Frosty AI

Frosty có thể:
- Trả lời câu hỏi tiếng Anh
- Giải thích bài tập
- Sửa lỗi ngữ pháp
- Tư vấn lộ trình học
`;

  if (!contextType) return baseContext;

  // Thêm context cụ thể theo tình huống
  const specificContexts: Record<string, string> = {
    lesson: `
User đang học lesson: "${data?.lessonTitle}"
Loại bài học: ${data?.lessonType}
Tiến độ: ${data?.exercisesCompleted}/${data?.totalExercises} bài tập
`,
    exercise: `
User đang làm bài tập loại: ${data?.exerciseType}
Câu hỏi: "${data?.question}"
${data?.isCorrect === false ? "User đã trả lời SAI." : ""}
`,
    grammar: `
User hỏi về ngữ pháp: ${data?.grammarTopic}
`,
    vocabulary: `
User hỏi về từ vựng: ${data?.word}
`,
    general: `
User hỏi về hệ thống LingoBros.
`
  };

  return baseContext + (specificContexts[contextType] || "");
}

/**
 * Helper function: Lấy câu trả lời mẫu cho FAQ
 */
export function getFAQAnswer(question: string): string | null {
  const normalizedQuestion = question.toLowerCase().trim();
  
  for (const category of Object.values(SYSTEM_KNOWLEDGE.faq)) {
    for (const [q, a] of Object.entries(category)) {
      if (normalizedQuestion.includes(q.toLowerCase()) || q.toLowerCase().includes(normalizedQuestion)) {
        return a;
      }
    }
  }
  
  return null;
}

export default SYSTEM_KNOWLEDGE;
