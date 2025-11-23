import { Schema, model, models } from 'mongoose';

const TranslationHistorySchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  sourceText: {
    type: String,
    required: true,
  },
  translatedText: {
    type: String,
    required: true,
  },
  sourceLang: {
    type: String,
    required: true,
    default: 'vi',
    enum: ['vi', 'en', 'fr', 'es', 'de', 'ja', 'zh', 'ko', 'ru', 'ar'],
  },
  targetLang: {
    type: String,
    required: true,
    default: 'en',
    enum: ['vi', 'en', 'fr', 'es', 'de', 'ja', 'zh', 'ko', 'ru', 'ar'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Indexes for efficient querying
TranslationHistorySchema.index({ userId: 1, createdAt: -1 });
TranslationHistorySchema.index({ userId: 1, sourceLang: 1, targetLang: 1 });

export default models.TranslationHistory || model('TranslationHistory', TranslationHistorySchema);