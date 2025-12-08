import { Schema, model, models } from 'mongoose';

const learningPathSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  purpose: {
    type: String,
    enum: ['travel', 'study-abroad', 'improvement', 'exam', 'other'],
    required: true
  },
  icon: { type: String },
  color: { type: String, default: '#3B82F6' },
  topics: [{
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    order: { type: Number, required: true },
    isRequired: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

if (models.LearningPath) {
  delete models.LearningPath;
}

export default model('LearningPath', learningPathSchema);