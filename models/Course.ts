import { Schema, model, models } from 'mongoose';

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

CourseSchema.index({ level: 1, isPublished: 1 });

export default models.Course || model('Course', CourseSchema);
