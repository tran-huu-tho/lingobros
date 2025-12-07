import { Schema, model, models } from 'mongoose';

const CourseSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'grammar'],
    required: true
  },
  icon: { type: String }, // Emoji hoặc URL
  color: { type: String, default: '#3B82F6' },
  gradientFrom: { type: String }, // Màu gradient bắt đầu
  gradientTo: { type: String },   // Màu gradient kết thúc
  order: { type: Number, required: true },
  totalTopics: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 10 },
  isPublished: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

CourseSchema.index({ level: 1, isPublished: 1 });
CourseSchema.index({ slug: 1 });

export default models.Course || model('Course', CourseSchema);
