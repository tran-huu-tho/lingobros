import { Schema, model, models } from 'mongoose';

const ExerciseSchema = new Schema({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  
  // Loại bài tập
  type: {
    type: String,
    enum: ['multiple-choice', 'fill-blank', 'word-order', 'listen-repeat', 'match', 'translate'],
    required: true
  },
  
  // Câu hỏi
  question: { type: String, required: true },
  questionAudio: { type: String },
  questionImage: { type: String },
  
  // Đáp án cho multiple-choice
  options: [{ type: String }],
  correctAnswer: { type: String },
  
  // Đáp án cho fill-blank
  sentence: { type: String },
  blanks: [{
    position: { type: Number },
    answer: { type: String },
    acceptableAnswers: [{ type: String }]
  }],
  
  // Đáp án cho word-order
  words: [{ type: String }],
  correctOrder: [{ type: String }],
  
  // Đáp án cho listen-repeat
  targetSentence: { type: String },
  targetAudio: { type: String },
  minAccuracy: { type: Number, default: 70 },
  
  // Đáp án cho match
  pairs: [{
    left: { type: String },
    right: { type: String }
  }],
  
  // Giải thích
  explanation: { type: String },
  hint: { type: String },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

ExerciseSchema.index({ topicId: 1 });

export default models.Exercise || model('Exercise', ExerciseSchema);
