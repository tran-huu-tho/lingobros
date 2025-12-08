const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lingobros';

async function seedLessons() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Topic = mongoose.models.Topic || mongoose.model('Topic', new mongoose.Schema({}, { strict: false }));
    const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({
      topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
      title: { type: String, required: true },
      description: String,
      order: Number,
      content: String,
      estimatedMinutes: Number,
      xpReward: Number,
      isLocked: Boolean,
      isPublished: Boolean
    }, { timestamps: true }));

    // Lấy tất cả topics
    const topics = await Topic.find({}).sort({ order: 1 });
    console.log(`📚 Found ${topics.length} topics`);

    if (topics.length === 0) {
      console.log('❌ No topics found. Please seed topics first.');
      await mongoose.connection.close();
      return;
    }

    // Xóa lessons cũ
    await Lesson.deleteMany({});
    console.log('🗑️  Cleared old lessons');

    const lessonsData = [];
    let lessonOrder = 1;

    // Tạo lessons cho mỗi topic
    topics.forEach((topic, topicIndex) => {
      const lessonsPerTopic = 3; // 3 bài học mỗi chủ đề
      
      for (let i = 0; i < lessonsPerTopic; i++) {
        lessonsData.push({
          topicId: topic._id,
          title: `${topic.title} - Bài ${i + 1}`,
          description: `Học các kiến thức cơ bản về ${topic.title.toLowerCase()}`,
          order: lessonOrder++,
          content: `Nội dung bài học về ${topic.title}`,
          estimatedMinutes: 15 + (i * 5),
          xpReward: 30 + (i * 10),
          isLocked: false,
          isPublished: true
        });
      }
    });

    const inserted = await Lesson.insertMany(lessonsData);
    console.log(`✅ Created ${inserted.length} lessons`);

    // Cập nhật totalLessons cho topics
    for (const topic of topics) {
      const lessonCount = await Lesson.countDocuments({ topicId: topic._id });
      await Topic.findByIdAndUpdate(topic._id, { totalLessons: lessonCount });
    }
    console.log('✅ Updated topic lesson counts');

    await mongoose.connection.close();
    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding lessons:', error);
    process.exit(1);
  }
}

seedLessons();
