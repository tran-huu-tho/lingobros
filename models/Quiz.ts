import { Schema, model, models } from 'mongoose';

const QuizQuestionSchema = new Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank'],
    required: true
  },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 1 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

const QuizSchema = new Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['placement', 'unit', 'final'],
    required: true
  },
  questions: [QuizQuestionSchema],
  passingScore: { type: Number, default: 70 },
  timeLimit: { type: Number }, // in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default models.Quiz || model('Quiz', QuizSchema);
