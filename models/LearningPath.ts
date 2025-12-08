import { Schema, model, models } from 'mongoose';

const LearningPathTopicSchema = new Schema({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  order: { type: Number, required: true },
  isRequired: { type: Boolean, default: true }
});

const LearningPathSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  purpose: {
    type: String,
    enum: ['travel', 'study-abroad', 'improvement', 'exam'],
    required: true
  },
  icon: { type: String },
  color: { type: String, default: '#3B82F6' },
  topics: [LearningPathTopicSchema],
  estimatedWeeks: { type: Number, default: 12 },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isActive: { type: Boolean, default: true },
  isRecommended: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Delete cached model to force reload
if (models.LearningPath) {
  delete models.LearningPath;
}

export default model('LearningPath', LearningPathSchema);
