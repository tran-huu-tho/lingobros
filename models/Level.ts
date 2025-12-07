import { Schema, model, models } from 'mongoose';

const LevelSchema = new Schema({
  name: { type: String, required: true, unique: true }, // 'beginner', 'intermediate'...
  displayName: { type: String, required: true }, // 'Cơ bản', 'Trung cấp'...
  description: { type: String },
  color: { type: String, default: '#3B82F6' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

LevelSchema.index({ name: 1 });

export default models.Level || model('Level', LevelSchema);
