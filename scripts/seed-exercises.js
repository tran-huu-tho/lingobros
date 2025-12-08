const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lingobros';

const ExerciseSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  order: { type: Number, required: true },
  type: {
    type: String,
    enum: ['multiple-choice', 'fill-blank', 'word-order', 'translate', 'match'],
    required: true
  },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  sentence: { type: String },
  blanks: [{
    position: { type: Number },
    answer: { type: String }
  }],
  words: [{ type: String }],
  correctOrder: [{ type: String }],
  pairs: [{
    left: { type: String },
    right: { type: String }
  }],
  explanation: { type: String },
  points: { type: Number, default: 10 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { timestamps: true });

const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);
const Topic = mongoose.models.Topic || mongoose.model('Topic', new mongoose.Schema({}, { strict: false }));

async function seedExercises() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả topics
    const topics = await Topic.find({}).sort({ order: 1 });
    console.log(`📚 Found ${topics.length} topics`);

    // Xóa exercises cũ
    await Exercise.deleteMany({});
    console.log('🗑️  Cleared old exercises');

    const exercisesData = [];

    // Tạo 5 bài tập cho mỗi topic
    topics.forEach((topic, topicIndex) => {
      const topicTitle = topic.title;
      
      // Bài 1: Multiple Choice
      exercisesData.push({
        topicId: topic._id,
        order: 1,
        type: 'multiple-choice',
        question: `What is the correct greeting in "${topicTitle}"?`,
        options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
        correctAnswer: 'Hello',
        explanation: 'Hello is the most common greeting in English.',
        points: 10,
        difficulty: 'easy'
      });

      // Bài 2: Fill in the blank
      exercisesData.push({
        topicId: topic._id,
        order: 2,
        type: 'fill-blank',
        question: 'Complete the sentence',
        sentence: 'My name ___ John.',
        blanks: [{
          position: 8,
          answer: 'is'
        }],
        explanation: 'Use "is" for singular subjects.',
        points: 10,
        difficulty: 'easy'
      });

      // Bài 3: Word order
      exercisesData.push({
        topicId: topic._id,
        order: 3,
        type: 'word-order',
        question: 'Arrange the words to make a correct sentence',
        words: ['I', 'am', 'a', 'student'],
        correctOrder: ['I', 'am', 'a', 'student'],
        explanation: 'Subject + Verb + Object is the basic sentence structure.',
        points: 15,
        difficulty: 'medium'
      });

      // Bài 4: Translate
      exercisesData.push({
        topicId: topic._id,
        order: 4,
        type: 'translate',
        question: 'Translate to English: "Xin chào"',
        correctAnswer: 'Hello',
        explanation: '"Xin chào" means "Hello" in English.',
        points: 10,
        difficulty: 'easy'
      });

      // Bài 5: Match pairs
      exercisesData.push({
        topicId: topic._id,
        order: 5,
        type: 'match',
        question: 'Match the English words with Vietnamese meanings',
        pairs: [
          { left: 'Hello', right: 'Xin chào' },
          { left: 'Goodbye', right: 'Tạm biệt' },
          { left: 'Thank you', right: 'Cảm ơn' },
          { left: 'Sorry', right: 'Xin lỗi' }
        ],
        explanation: 'Basic greetings and polite expressions.',
        points: 20,
        difficulty: 'medium'
      });
    });

    // Insert vào database
    const inserted = await Exercise.insertMany(exercisesData);
    console.log(`✅ Created ${inserted.length} exercises`);

    // Thống kê
    const stats = await Exercise.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Exercise Statistics:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    process.exit(1);
  }
}

seedExercises();
