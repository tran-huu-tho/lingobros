import { Schema, model, models } from 'mongoose';

const UserProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  
  // Điểm số
  score: { type: Number, default: 0 },
  maxScore: { type: Number },
  accuracy: { type: Number }, // % chính xác
  
  // Thống kê
  attemptsCount: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // seconds
  exercisesCompleted: { type: Number, default: 0 },
  totalExercises: { type: Number, default: 0 },
  
  // Kết quả từng exercise
  exerciseResults: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    isCorrect: { type: Boolean },
    score: { type: Number },
    timeSpent: { type: Number },
    attempts: { type: Number, default: 1 }
  }],
  
  // Thời gian
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
UserProgressSchema.index({ userId: 1, topicId: 1 });
UserProgressSchema.index({ userId: 1, status: 1 });
UserProgressSchema.index({ userId: 1, courseId: 1 });

export default models.UserProgress || model('UserProgress', UserProgressSchema);
