import { Schema, model, models } from 'mongoose';

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
UserProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, status: 1 });

export default models.UserProgress || model('UserProgress', UserProgressSchema);
