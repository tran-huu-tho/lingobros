import { Schema, model, models } from 'mongoose';

const TopicSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String }, // Emoji icon
  color: { type: String, default: '#3B82F6' }, // Màu gradient
  order: { type: Number, required: true },
  totalLessons: { type: Number, default: 0 },
  xpReward: { type: Number, default: 50 },
  isLocked: { type: Boolean, default: false },
  unlockCondition: {
    requiredTopicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
    requiredScore: { type: Number }
  },
  thumbnail: { type: String },
  estimatedMinutes: { type: Number, default: 30 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

TopicSchema.index({ courseId: 1, order: 1 });
TopicSchema.index({ isPublished: 1 });

export default models.Topic || model('Topic', TopicSchema);
