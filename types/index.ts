export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  level: string;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
  createdAt: Date;
  lastActiveAt: Date;
  preferences: UserPreferences;
  hasCompletedOnboarding?: boolean;
  isAdmin: boolean;
}

export interface UserPreferences {
  learningGoal: 'casual' | 'regular' | 'serious' | 'intense';
  learningPurpose?: 'communication' | 'study-abroad' | 'exam' | 'improvement' | 'other';
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  interests: string[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  categories?: string[];
  tags?: string[];
  imageUrl?: string;
  units: Unit[];
  totalLessons: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  isLocked: boolean;
}

export interface Lesson {
  _id: string;
  unitId: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'quiz' | 'story';
  order: number;
  xpReward: number;
  content: LessonContent;
  isLocked: boolean;
}

export interface LessonContent {
  introduction?: string;
  exercises: Exercise[];
  tips?: string[];
}

export interface Exercise {
  _id: string;
  type: 'multiple-choice' | 'fill-blank' | 'match' | 'speak' | 'listen' | 'translate';
  question: string;
  questionAudio?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  type: 'placement' | 'unit' | 'final';
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserProgress {
  _id: string;
  userId: string;
  courseId: string;
  unitId: string;
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  attemptsCount: number;
  completedAt?: Date;
  updatedAt: Date;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'xp' | 'lessons' | 'perfect-score';
}

export interface Leaderboard {
  userId: string;
  displayName: string;
  photoURL?: string;
  xp: number;
  rank: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
