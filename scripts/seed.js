require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingobros';

// Define schemas inline
const { Schema } = mongoose;

const CourseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  language: { type: String, required: true, default: 'English' },
  level: { 
    type: String, 
    enum: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'],
    default: 'beginner' 
  },
  imageUrl: { type: String },
  totalLessons: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

const UnitSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

const ExerciseSchema = new Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'fill-blank', 'match', 'speak', 'listen', 'translate'],
    required: true
  },
  question: { type: String, required: true },
  questionAudio: { type: String },
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  explanation: { type: String },
  imageUrl: { type: String },
  audioUrl: { type: String }
});

const LessonContentSchema = new Schema({
  introduction: { type: String },
  exercises: [ExerciseSchema],
  tips: [{ type: String }]
});

const LessonSchema = new Schema({
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['vocabulary', 'grammar', 'listening', 'speaking', 'quiz', 'story'],
    required: true
  },
  order: { type: Number, required: true },
  xpReward: { type: Number, default: 10 },
  content: { type: LessonContentSchema, required: true },
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

const UserPreferencesSchema = new Schema({
  learningGoal: {
    type: String,
    enum: ['casual', 'regular', 'serious', 'intense'],
    default: 'regular'
  },
  dailyGoalMinutes: { type: Number, default: 15 },
  notificationsEnabled: { type: Boolean, default: true },
  soundEnabled: { type: Boolean, default: true },
  interests: [{ type: String }]
});

const UserSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: { type: String },
  level: { type: String, default: 'beginner' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  hearts: { type: Number, default: 5 },
  gems: { type: Number, default: 0 },
  lastStreakDate: { type: Date },
  preferences: { type: UserPreferencesSchema, default: () => ({}) },
  isAdmin: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true });

const UserProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  score: { type: Number },
  attemptsCount: { type: Number, default: 0 },
  completedAt: { type: Date },
}, { timestamps: true });

const QuizQuestionSchema = new Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'true-false', 'fill-blank'], required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 10 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

const QuizSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['placement', 'unit-test', 'final'], required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
  questions: [QuizQuestionSchema],
  passingScore: { type: Number, default: 70 },
  timeLimit: { type: Number },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

const QuizResultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  timeSpent: { type: Number },
  answers: [{
    questionId: String,
    userAnswer: String,
    isCorrect: Boolean
  }],
}, { timestamps: true });

const AchievementSchema = new Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  type: { type: String, enum: ['streak', 'xp', 'lessons', 'perfect'], required: true },
  requirement: { type: Number, required: true },
  xpReward: { type: Number, default: 0 },
  gemsReward: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const UserAchievementSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  progress: { type: Number, default: 0 },
  unlockedAt: { type: Date },
}, { timestamps: true });

const DailyActivitySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  minutesLearned: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  lessonsCompleted: { type: Number, default: 0 },
  exercisesCompleted: { type: Number, default: 0 },
  perfectScores: { type: Number, default: 0 },
  heartsUsed: { type: Number, default: 0 },
}, { timestamps: true });

// Create models
const Course = mongoose.model('Course', CourseSchema);
const Unit = mongoose.model('Unit', UnitSchema);
const Lesson = mongoose.model('Lesson', LessonSchema);
const User = mongoose.model('User', UserSchema);
const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
const Quiz = mongoose.model('Quiz', QuizSchema);
const QuizResult = mongoose.model('QuizResult', QuizResultSchema);
const Achievement = mongoose.model('Achievement', AchievementSchema);
const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);
const DailyActivity = mongoose.model('DailyActivity', DailyActivitySchema);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Course.deleteMany({});
    await Unit.deleteMany({});
    await Lesson.deleteMany({});
    await User.deleteMany({});
    await UserProgress.deleteMany({});
    await Quiz.deleteMany({});
    await QuizResult.deleteMany({});
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});
    await DailyActivity.deleteMany({});
    console.log('✅ Cleared old data\n');

    // ===========================
    // COURSE 1: English for Beginners
    // ===========================
    console.log('📚 Creating Course 1: English for Beginners');
    const course1 = await Course.create({
      title: 'English for Beginners',
      description: 'Khóa học tiếng Anh cơ bản cho người mới bắt đầu',
      language: 'English',
      level: 'beginner',
      imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
      totalLessons: 6,
      isPublished: true
    });
    console.log(`✅ Created course: ${course1.title}`);

    // Unit 1.1: Greetings
    const unit1_1 = await Unit.create({
      courseId: course1._id,
      title: 'Unit 1: Greetings & Introductions',
      description: 'Học cách chào hỏi và giới thiệu bản thân',
      order: 1,
      isLocked: false
    });

    await Lesson.create({
      unitId: unit1_1._id,
      title: 'Hello & Goodbye',
      description: 'Học từ vựng chào hỏi cơ bản',
      type: 'vocabulary',
      order: 1,
      xpReward: 10,
      content: {
        introduction: 'Trong bài học này, bạn sẽ học các cách chào hỏi phổ biến trong tiếng Anh.',
        exercises: [
          {
            type: 'multiple-choice',
            question: 'How do you say "Xin chào" in English?',
            options: ['Hello', 'Goodbye', 'Thanks', 'Sorry'],
            correctAnswer: 'Hello',
            explanation: 'Hello là cách chào hỏi phổ biến nhất trong tiếng Anh.'
          },
          {
            type: 'multiple-choice',
            question: 'What does "Goodbye" mean in Vietnamese?',
            options: ['Tạm biệt', 'Xin chào', 'Cảm ơn', 'Xin lỗi'],
            correctAnswer: 'Tạm biệt',
            explanation: 'Goodbye có nghĩa là tạm biệt, dùng khi chia tay.'
          },
          {
            type: 'fill-blank',
            question: '_____ ! How are you?',
            correctAnswer: 'Hello',
            explanation: 'Chúng ta dùng Hello để chào hỏi ai đó.'
          }
        ],
        tips: [
          'Hello có thể dùng trong mọi tình huống',
          'Hi là cách nói thân mật hơn Hello',
          'Goodbye thường được viết tắt là Bye'
        ]
      },
      isLocked: false
    });

    await Lesson.create({
      unitId: unit1_1._id,
      title: 'My Name Is...',
      description: 'Học cách giới thiệu tên',
      type: 'grammar',
      order: 2,
      xpReward: 15,
      content: {
        introduction: 'Học cách giới thiệu bản thân bằng tiếng Anh.',
        exercises: [
          {
            type: 'multiple-choice',
            question: 'Complete: My name ___ John.',
            options: ['is', 'are', 'am', 'be'],
            correctAnswer: 'is',
            explanation: 'Dùng "is" với chủ ngữ "name" (danh từ số ít).'
          },
          {
            type: 'fill-blank',
            question: 'I ___ a student.',
            correctAnswer: 'am',
            explanation: 'Dùng "am" với chủ ngữ "I".'
          },
          {
            type: 'translate',
            question: 'Translate: "Tên tôi là Mai"',
            correctAnswer: 'My name is Mai',
            explanation: 'My name is + [tên của bạn]'
          }
        ],
        tips: [
          'My name is... là cách giới thiệu chính thức',
          "I'm... là cách nói thân mật hơn",
          'Nhớ viết hoa chữ cái đầu của tên riêng'
        ]
      },
      isLocked: false
    });

    // Unit 1.2: Numbers
    const unit1_2 = await Unit.create({
      courseId: course1._id,
      title: 'Unit 2: Numbers & Time',
      description: 'Học số đếm và thời gian',
      order: 2,
      isLocked: false
    });

    await Lesson.create({
      unitId: unit1_2._id,
      title: 'Numbers 1-10',
      description: 'Học đếm số từ 1 đến 10',
      type: 'vocabulary',
      order: 1,
      xpReward: 10,
      content: {
        introduction: 'Học cách đếm số từ 1 đến 10 bằng tiếng Anh.',
        exercises: [
          {
            type: 'multiple-choice',
            question: 'How do you say "5" in English?',
            options: ['Five', 'Four', 'Six', 'Seven'],
            correctAnswer: 'Five',
            explanation: '5 trong tiếng Anh là Five.'
          },
          {
            type: 'multiple-choice',
            question: 'What number is "Ten"?',
            options: ['10', '8', '9', '11'],
            correctAnswer: '10',
            explanation: 'Ten là số 10.'
          },
          {
            type: 'fill-blank',
            question: 'One, two, three, _____, five',
            correctAnswer: 'four',
            explanation: 'Số 4 trong tiếng Anh là four.'
          }
        ],
        tips: [
          'Học thuộc số từ 1-10 trước khi học số lớn hơn',
          'Luyện phát âm: three /θriː/, five /faɪv/',
          'Số 0 đọc là "zero" hoặc "oh"'
        ]
      },
      isLocked: false
    });

    console.log(`  ✅ Created ${await Lesson.countDocuments({ unitId: { $in: [unit1_1._id, unit1_2._id] } })} lessons for Course 1\n`);

    // ===========================
    // COURSE 2: Elementary English
    // ===========================
    console.log('📚 Creating Course 2: Elementary English');
    const course2 = await Course.create({
      title: 'Elementary English',
      description: 'Nâng cao kỹ năng tiếng Anh của bạn',
      language: 'English',
      level: 'elementary',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
      totalLessons: 3,
      isPublished: true
    });
    console.log(`✅ Created course: ${course2.title}`);

    const unit2_1 = await Unit.create({
      courseId: course2._id,
      title: 'Unit 1: Daily Activities',
      description: 'Học về các hoạt động hàng ngày',
      order: 1,
      isLocked: false
    });

    await Lesson.create({
      unitId: unit2_1._id,
      title: 'Present Simple Tense',
      description: 'Học thì hiện tại đơn',
      type: 'grammar',
      order: 1,
      xpReward: 20,
      content: {
        introduction: 'Thì hiện tại đơn dùng để nói về thói quen và sự thật.',
        exercises: [
          {
            type: 'multiple-choice',
            question: 'She ___ to school every day.',
            options: ['go', 'goes', 'going', 'gone'],
            correctAnswer: 'goes',
            explanation: 'Động từ thêm -s/-es với chủ ngữ ngôi thứ 3 số ít (he, she, it).'
          },
          {
            type: 'multiple-choice',
            question: 'I ___ coffee every morning.',
            options: ['drink', 'drinks', 'drinking', 'drank'],
            correctAnswer: 'drink',
            explanation: 'Dùng động từ nguyên mẫu với chủ ngữ I, you, we, they.'
          },
          {
            type: 'fill-blank',
            question: 'He ___ (play) soccer on weekends.',
            correctAnswer: 'plays',
            explanation: 'Play + s = plays với chủ ngữ he.'
          }
        ],
        tips: [
          'Thêm -s/-es cho he/she/it',
          'Dùng do/does trong câu hỏi và phủ định',
          'Always, often, usually là dấu hiệu nhận biết'
        ]
      },
      isLocked: false
    });

    console.log(`  ✅ Created ${await Lesson.countDocuments({ unitId: unit2_1._id })} lesson for Course 2\n`);

    // ===========================
    // COURSE 3: Intermediate English
    // ===========================
    console.log('📚 Creating Course 3: Intermediate English');
    const course3 = await Course.create({
      title: 'Intermediate English',
      description: 'Phát triển kỹ năng giao tiếp tiếng Anh',
      language: 'English',
      level: 'intermediate',
      imageUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0',
      totalLessons: 2,
      isPublished: true
    });
    console.log(`✅ Created course: ${course3.title}`);

    const unit3_1 = await Unit.create({
      courseId: course3._id,
      title: 'Unit 1: Past Experiences',
      description: 'Kể về kinh nghiệm trong quá khứ',
      order: 1,
      isLocked: false
    });

    await Lesson.create({
      unitId: unit3_1._id,
      title: 'Present Perfect Tense',
      description: 'Học thì hiện tại hoàn thành',
      type: 'grammar',
      order: 1,
      xpReward: 25,
      content: {
        introduction: 'Thì hiện tại hoàn thành dùng để nói về hành động đã xảy ra nhưng không rõ thời gian.',
        exercises: [
          {
            type: 'multiple-choice',
            question: 'I ___ to Japan three times.',
            options: ['have been', 'has been', 'was', 'am'],
            correctAnswer: 'have been',
            explanation: 'Dùng have + V3 với chủ ngữ I để diễn tả kinh nghiệm.'
          },
          {
            type: 'multiple-choice',
            question: 'She ___ her homework yet.',
            options: ["hasn't finished", "haven't finished", "didn't finish", "don't finish"],
            correctAnswer: "hasn't finished",
            explanation: "Dùng hasn't + V3 cho câu phủ định với she."
          },
          {
            type: 'fill-blank',
            question: 'They ___ (live) here for 5 years.',
            correctAnswer: 'have lived',
            explanation: 'Have + lived (V3) để diễn tả hành động kéo dài đến hiện tại.'
          }
        ],
        tips: [
          'For + khoảng thời gian (for 3 years)',
          'Since + mốc thời gian (since 2020)',
          'Already, yet, just là dấu hiệu nhận biết'
        ]
      },
      isLocked: false
    });

    console.log(`  ✅ Created ${await Lesson.countDocuments({ unitId: unit3_1._id })} lesson for Course 3\n`);

    // ===========================
    // USERS - Sample Users
    // ===========================
    console.log('👥 Creating Sample Users');
    
    const user1 = await User.create({
      firebaseUid: 'demo-user-001',
      email: 'demo@lingobros.com',
      displayName: 'Demo User',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      level: 'beginner',
      xp: 150,
      streak: 5,
      hearts: 5,
      gems: 50,
      lastStreakDate: new Date(),
      preferences: {
        learningGoal: 'regular',
        dailyGoalMinutes: 15,
        notificationsEnabled: true,
        soundEnabled: true,
        interests: ['🎬 Phim ảnh', '🎵 Âm nhạc', '✈️ Du lịch']
      },
      isAdmin: false
    });

    const user2 = await User.create({
      firebaseUid: 'demo-user-002',
      email: 'student@lingobros.com',
      displayName: 'Học Viên Siêng',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
      level: 'elementary',
      xp: 520,
      streak: 12,
      hearts: 4,
      gems: 120,
      lastStreakDate: new Date(),
      preferences: {
        learningGoal: 'serious',
        dailyGoalMinutes: 30,
        notificationsEnabled: true,
        soundEnabled: true,
        interests: ['📚 Sách', '💼 Công việc', '🎮 Game']
      },
      isAdmin: false
    });

    const adminUser = await User.create({
      firebaseUid: 'admin-001',
      email: 'admin@lingobros.com',
      displayName: 'Admin LingoBros',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      level: 'advanced',
      xp: 9999,
      streak: 100,
      hearts: 5,
      gems: 1000,
      lastStreakDate: new Date(),
      preferences: {
        learningGoal: 'intense',
        dailyGoalMinutes: 60,
        notificationsEnabled: true,
        soundEnabled: true,
        interests: []
      },
      isAdmin: true
    });

    console.log(`✅ Created ${await User.countDocuments()} users\n`);

    // ===========================
    // USER PROGRESS - Demo progress for user1
    // ===========================
    console.log('📈 Creating User Progress');
    
    const allLessons = await Lesson.find();
    
    // User1 completed first 2 lessons
    await UserProgress.create({
      userId: user1._id,
      courseId: course1._id,
      unitId: unit1_1._id,
      lessonId: allLessons[0]._id,
      status: 'completed',
      score: 100,
      attemptsCount: 1,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });

    await UserProgress.create({
      userId: user1._id,
      courseId: course1._id,
      unitId: unit1_1._id,
      lessonId: allLessons[1]._id,
      status: 'completed',
      score: 85,
      attemptsCount: 2,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });

    // User1 in progress on 3rd lesson
    await UserProgress.create({
      userId: user1._id,
      courseId: course1._id,
      unitId: unit1_2._id,
      lessonId: allLessons[2]._id,
      status: 'in-progress',
      score: 60,
      attemptsCount: 1
    });

    // User2 completed more lessons
    await UserProgress.create({
      userId: user2._id,
      courseId: course1._id,
      unitId: unit1_1._id,
      lessonId: allLessons[0]._id,
      status: 'completed',
      score: 100,
      attemptsCount: 1,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    await UserProgress.create({
      userId: user2._id,
      courseId: course2._id,
      unitId: unit2_1._id,
      lessonId: allLessons[3]._id,
      status: 'completed',
      score: 95,
      attemptsCount: 1,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    console.log(`✅ Created ${await UserProgress.countDocuments()} progress records\n`);

    // ===========================
    // QUIZZES - Placement Test & Unit Tests
    // ===========================
    console.log('📝 Creating Quizzes');
    
    const placementTest = await Quiz.create({
      title: 'Placement Test - Kiểm tra trình độ',
      type: 'placement',
      questions: [
        {
          question: 'What ___ your name?',
          type: 'multiple-choice',
          options: ['is', 'are', 'am', 'be'],
          correctAnswer: 'is',
          points: 10,
          difficulty: 'easy'
        },
        {
          question: 'I ___ from Vietnam.',
          type: 'multiple-choice',
          options: ['am', 'is', 'are', 'be'],
          correctAnswer: 'am',
          points: 10,
          difficulty: 'easy'
        },
        {
          question: 'She ___ to school every day.',
          type: 'multiple-choice',
          options: ['go', 'goes', 'going', 'gone'],
          correctAnswer: 'goes',
          points: 15,
          difficulty: 'medium'
        },
        {
          question: 'I have ___ studying English for 3 years.',
          type: 'multiple-choice',
          options: ['been', 'be', 'being', 'was'],
          correctAnswer: 'been',
          points: 20,
          difficulty: 'hard'
        },
        {
          question: 'If I ___ rich, I would travel the world.',
          type: 'multiple-choice',
          options: ['am', 'was', 'were', 'be'],
          correctAnswer: 'were',
          points: 20,
          difficulty: 'hard'
        },
        {
          question: 'The report ___ by tomorrow morning.',
          type: 'multiple-choice',
          options: ['must finish', 'must be finished', 'must finished', 'must finishing'],
          correctAnswer: 'must be finished',
          points: 25,
          difficulty: 'hard'
        }
      ],
      passingScore: 60,
      timeLimit: 600,
      isPublished: true
    });

    const unitTest1 = await Quiz.create({
      title: 'Unit 1 Test - Greetings',
      type: 'unit-test',
      courseId: course1._id,
      unitId: unit1_1._id,
      questions: [
        {
          question: 'How do you greet someone in the morning?',
          type: 'multiple-choice',
          options: ['Good morning', 'Good night', 'Goodbye', 'See you'],
          correctAnswer: 'Good morning',
          points: 10,
          difficulty: 'easy'
        },
        {
          question: 'What is the informal way to say "Hello"?',
          type: 'multiple-choice',
          options: ['Hi', 'Good day', 'Greetings', 'Salutations'],
          correctAnswer: 'Hi',
          points: 10,
          difficulty: 'easy'
        },
        {
          question: '"Nice to meet you" is used when meeting someone for the first time.',
          type: 'true-false',
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 10,
          difficulty: 'easy'
        }
      ],
      passingScore: 70,
      timeLimit: 300,
      isPublished: true
    });

    console.log(`✅ Created ${await Quiz.countDocuments()} quizzes\n`);

    // ===========================
    // QUIZ RESULTS - Sample results
    // ===========================
    console.log('📊 Creating Quiz Results');
    
    await QuizResult.create({
      userId: user1._id,
      quizId: placementTest._id,
      score: 65,
      totalQuestions: 6,
      correctAnswers: 4,
      passed: true,
      timeSpent: 450,
      answers: [
        { questionId: '1', userAnswer: 'is', isCorrect: true },
        { questionId: '2', userAnswer: 'am', isCorrect: true },
        { questionId: '3', userAnswer: 'goes', isCorrect: true },
        { questionId: '4', userAnswer: 'being', isCorrect: false },
        { questionId: '5', userAnswer: 'were', isCorrect: true },
        { questionId: '6', userAnswer: 'must finish', isCorrect: false }
      ]
    });

    await QuizResult.create({
      userId: user2._id,
      quizId: placementTest._id,
      score: 85,
      totalQuestions: 6,
      correctAnswers: 5,
      passed: true,
      timeSpent: 380,
      answers: [
        { questionId: '1', userAnswer: 'is', isCorrect: true },
        { questionId: '2', userAnswer: 'am', isCorrect: true },
        { questionId: '3', userAnswer: 'goes', isCorrect: true },
        { questionId: '4', userAnswer: 'been', isCorrect: true },
        { questionId: '5', userAnswer: 'were', isCorrect: true },
        { questionId: '6', userAnswer: 'must finish', isCorrect: false }
      ]
    });

    console.log(`✅ Created ${await QuizResult.countDocuments()} quiz results\n`);

    // ===========================
    // ACHIEVEMENTS - Define achievements
    // ===========================
    console.log('🏆 Creating Achievements');
    
    const achievements = await Achievement.insertMany([
      {
        code: 'streak_3',
        title: '🔥 Streak Starter',
        description: 'Học liên tục 3 ngày',
        icon: '🔥',
        type: 'streak',
        requirement: 3,
        xpReward: 50,
        gemsReward: 10,
        isActive: true
      },
      {
        code: 'streak_7',
        title: '⚡ Week Warrior',
        description: 'Học liên tục 7 ngày',
        icon: '⚡',
        type: 'streak',
        requirement: 7,
        xpReward: 100,
        gemsReward: 25,
        isActive: true
      },
      {
        code: 'streak_30',
        title: '🌟 Month Master',
        description: 'Học liên tục 30 ngày',
        icon: '🌟',
        type: 'streak',
        requirement: 30,
        xpReward: 500,
        gemsReward: 100,
        isActive: true
      },
      {
        code: 'xp_100',
        title: '🎯 First Hundred',
        description: 'Đạt 100 XP',
        icon: '🎯',
        type: 'xp',
        requirement: 100,
        xpReward: 25,
        gemsReward: 5,
        isActive: true
      },
      {
        code: 'xp_500',
        title: '💪 XP Champion',
        description: 'Đạt 500 XP',
        icon: '💪',
        type: 'xp',
        requirement: 500,
        xpReward: 100,
        gemsReward: 20,
        isActive: true
      },
      {
        code: 'xp_1000',
        title: '👑 XP Legend',
        description: 'Đạt 1000 XP',
        icon: '👑',
        type: 'xp',
        requirement: 1000,
        xpReward: 250,
        gemsReward: 50,
        isActive: true
      },
      {
        code: 'lessons_5',
        title: '📚 Getting Started',
        description: 'Hoàn thành 5 bài học',
        icon: '📚',
        type: 'lessons',
        requirement: 5,
        xpReward: 50,
        gemsReward: 10,
        isActive: true
      },
      {
        code: 'lessons_20',
        title: '🎓 Dedicated Learner',
        description: 'Hoàn thành 20 bài học',
        icon: '🎓',
        type: 'lessons',
        requirement: 20,
        xpReward: 150,
        gemsReward: 30,
        isActive: true
      },
      {
        code: 'perfect_5',
        title: '💯 Perfectionist',
        description: 'Đạt điểm tuyệt đối 5 lần',
        icon: '💯',
        type: 'perfect',
        requirement: 5,
        xpReward: 100,
        gemsReward: 25,
        isActive: true
      },
      {
        code: 'perfect_10',
        title: '🌈 Perfect Master',
        description: 'Đạt điểm tuyệt đối 10 lần',
        icon: '🌈',
        type: 'perfect',
        requirement: 10,
        xpReward: 200,
        gemsReward: 50,
        isActive: true
      }
    ]);

    console.log(`✅ Created ${achievements.length} achievements\n`);

    // ===========================
    // USER ACHIEVEMENTS - Unlocked achievements
    // ===========================
    console.log('🎖️ Creating User Achievements');
    
    const streak3 = achievements.find(a => a.code === 'streak_3');
    const xp100 = achievements.find(a => a.code === 'xp_100');
    const lessons5 = achievements.find(a => a.code === 'lessons_5');

    // User1 unlocked achievements
    await UserAchievement.create({
      userId: user1._id,
      achievementId: xp100._id,
      progress: 100,
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    await UserAchievement.create({
      userId: user1._id,
      achievementId: streak3._id,
      progress: 100,
      unlockedAt: new Date()
    });

    // User2 unlocked more achievements
    await UserAchievement.create({
      userId: user2._id,
      achievementId: xp100._id,
      progress: 100,
      unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });

    await UserAchievement.create({
      userId: user2._id,
      achievementId: streak3._id,
      progress: 100,
      unlockedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    });

    await UserAchievement.create({
      userId: user2._id,
      achievementId: lessons5._id,
      progress: 100,
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    // In progress achievements for user1
    const streak7 = achievements.find(a => a.code === 'streak_7');
    await UserAchievement.create({
      userId: user1._id,
      achievementId: streak7._id,
      progress: 71, // 5/7 days
      unlockedAt: null
    });

    console.log(`✅ Created ${await UserAchievement.countDocuments()} user achievements\n`);

    // ===========================
    // DAILY ACTIVITIES - Activity log
    // ===========================
    console.log('📅 Creating Daily Activities');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // User1 activity for last 5 days
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await DailyActivity.create({
        userId: user1._id,
        date: date,
        minutesLearned: 15 + Math.floor(Math.random() * 15),
        xpEarned: 20 + Math.floor(Math.random() * 30),
        lessonsCompleted: i === 0 ? 1 : (i === 1 ? 1 : 0),
        exercisesCompleted: 3 + Math.floor(Math.random() * 5),
        perfectScores: Math.floor(Math.random() * 2),
        heartsUsed: Math.floor(Math.random() * 2)
      });
    }

    // User2 activity for last 12 days
    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await DailyActivity.create({
        userId: user2._id,
        date: date,
        minutesLearned: 25 + Math.floor(Math.random() * 20),
        xpEarned: 40 + Math.floor(Math.random() * 40),
        lessonsCompleted: i < 5 ? 1 : 0,
        exercisesCompleted: 5 + Math.floor(Math.random() * 8),
        perfectScores: Math.floor(Math.random() * 3),
        heartsUsed: Math.floor(Math.random() * 3)
      });
    }

    console.log(`✅ Created ${await DailyActivity.countDocuments()} daily activities\n`);

    // Summary
    const totalCourses = await Course.countDocuments();
    const totalUnits = await Unit.countDocuments();
    const totalLessons = await Lesson.countDocuments();

    console.log('📊 Database Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Courses: ${totalCourses}`);
    console.log(`✅ Units: ${totalUnits}`);
    console.log(`✅ Lessons: ${totalLessons}`);
    console.log(`✅ Total Exercises: ${totalLessons * 3}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('💡 NEXT STEPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. 📊 Open MongoDB Compass to view all collections');
    console.log('   → Database: lingobros');
    console.log('   → Collections: 10 (courses, units, lessons, users, etc.)\n');
    console.log('2. 🚀 Start the app: npm run dev');
    console.log('   → http://localhost:3000\n');
    console.log('3. 👤 Demo Login Credentials:');
    console.log('   → Email: demo@lingobros.com');
    console.log('   → Email: student@lingobros.com');
    console.log('   → Email: admin@lingobros.com (Admin access)\n');
    console.log('4. 🎮 Test Features:');
    console.log('   → View courses in dashboard');
    console.log('   → Start learning lessons');
    console.log('   → Check user progress');
    console.log('   → View achievements');
    console.log('   → Take quizzes\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
