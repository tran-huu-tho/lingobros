import { Schema, model, models } from 'mongoose';

const QuizQuestionSchema = new Schema({
  exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
  order: { type: Number, required: true },
  points: { type: Number, default: 10 }
});

const QuizSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  questions: [QuizQuestionSchema],
  duration: { type: Number }, // in minutes
  passingScore: { type: Number, default: 70 },
  shuffleQuestions: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Delete cached model to force reload
if (models.Quiz) {
  delete models.Quiz;
}

export default model('Quiz', QuizSchema);
