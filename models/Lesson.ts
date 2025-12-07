import { Schema, model, models } from 'mongoose';

const LessonSchema = new Schema({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['vocabulary', 'grammar', 'listening', 'speaking', 'practice', 'story'],
    required: true
  },
  order: { type: Number, required: true },
  xpReward: { type: Number, default: 10 },
  
  // Nội dung bài học
  content: {
    introduction: { type: String },
    vocabulary: [{
      word: { type: String },
      pronunciation: { type: String },
      meaning: { type: String },
      example: { type: String },
      audioUrl: { type: String }
    }],
    grammarPoints: [{
      rule: { type: String },
      examples: [{ type: String }],
      notes: { type: String }
    }],
    tips: [{ type: String }]
  },
  
  // Media
  thumbnailUrl: { type: String },
  videoUrl: { type: String },
  audioUrl: { type: String },
  
  // Điều kiện mở khóa
  isLocked: { type: Boolean, default: false },
  unlockCondition: {
    requiredLessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    minimumScore: { type: Number }
  },
  
  // Metadata
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedMinutes: { type: Number, default: 15 },
  
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

LessonSchema.index({ topicId: 1, order: 1 });

export default models.Lesson || model('Lesson', LessonSchema);
