import { Schema, model, models } from 'mongoose';

const UserPreferencesSchema = new Schema({
  learningGoal: {
    type: String,
    enum: ['communication', 'study-abroad', 'exam', 'improvement', 'other', 'casual', 'regular', 'serious', 'intense'],
    default: 'regular'
  },
  dailyGoalMinutes: { type: Number, default: 15 },
  notificationsEnabled: { type: Boolean, default: true },
  soundEnabled: { type: Boolean, default: true },
  interests: [{ type: String }]
});

const UserSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: { type: String },
  bio: { type: String, default: '' },
  level: { type: String, default: 'beginner' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  hearts: { type: Number, default: 5 },
  lastHeartUpdate: { type: Date, default: Date.now },
  studyTime: { type: Number, default: 0 }, // Total study time in minutes
  learningGoal: { type: String, default: 'Chưa đặt mục tiêu' }, // Learning goal text
  preferences: { type: UserPreferencesSchema, default: () => ({}) },
  hasCompletedOnboarding: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  strict: false  // Allow fields not in schema temporarily
});

// Indexes
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ xp: -1 });

// Delete cached model to force reload
delete (global as any).mongoose?.models?.User;

export default models.User || model('User', UserSchema);
