import { Schema, model, models } from 'mongoose';

const AchievementSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  requirement: { type: Number, required: true },
  type: {
    type: String,
    enum: ['streak', 'xp', 'lessons', 'perfect-score'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

export default models.Achievement || model('Achievement', AchievementSchema);
