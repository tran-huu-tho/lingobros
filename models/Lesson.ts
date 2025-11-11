import { Schema, model, models } from 'mongoose';

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

LessonSchema.index({ unitId: 1, order: 1 });

export default models.Lesson || model('Lesson', LessonSchema);
