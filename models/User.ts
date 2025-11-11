import { Schema, model, models } from 'mongoose';

const UserPreferencesSchema = new Schema({
  learningGoal: {
    type: String,
    enum: ['casual', 'regular', 'serious', 'intense'],
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
  level: { type: String, default: 'beginner' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  hearts: { type: Number, default: 5 },
  gems: { type: Number, default: 0 },
  preferences: { type: UserPreferencesSchema, default: () => ({}) },
  isAdmin: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ xp: -1 });

export default models.User || model('User', UserSchema);
