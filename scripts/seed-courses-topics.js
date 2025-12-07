const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingobros';

// Models
const CourseSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  level: String,
  icon: String,
  color: String,
  gradientFrom: String,
  gradientTo: String,
  order: Number,
  totalTopics: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  estimatedHours: Number,
  isPublished: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const TopicSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title: String,
  description: String,
  icon: String,
  color: String,
  order: Number,
  totalLessons: { type: Number, default: 0 },
  xpReward: { type: Number, default: 50 },
  isLocked: { type: Boolean, default: false },
  estimatedMinutes: { type: Number, default: 30 },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

const Course = mongoose.model('Course', CourseSchema);
const Topic = mongoose.model('Topic', TopicSchema);

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    console.log('\n🗑️  Deleting old data...');
    await Course.deleteMany({});
    await Topic.deleteMany({});
    
    // Xóa các collection cũ nếu tồn tại
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (collectionNames.includes('units')) {
      await mongoose.connection.db.collection('units').drop();
      console.log('   ✓ Dropped old "units" collection');
    }
    
    console.log('   ✓ Deleted old courses and topics');

    // ===== 1. TẠO COURSES =====
    console.log('\n📚 Creating Courses...');
    
    const courses = [
      {
        title: 'Tiếng Anh Cơ Bản',
        slug: 'co-ban',
        description: 'Khóa học dành cho người mới bắt đầu',
        level: 'beginner',
        icon: '🌱',
        gradientFrom: '#EC4899',
        gradientTo: '#F97316',
        order: 1,
        estimatedHours: 40
      },
      {
        title: 'Tiếng Anh Trung Cấp',
        slug: 'trung-cap',
        description: 'Nâng cao kỹ năng giao tiếp và ngữ pháp',
        level: 'intermediate',
        icon: '📈',
        gradientFrom: '#3B82F6',
        gradientTo: '#8B5CF6',
        order: 2,
        estimatedHours: 60
      },
      {
        title: 'Tiếng Anh Nâng Cao',
        slug: 'nang-cao',
        description: 'Hoàn thiện kỹ năng tiếng Anh',
        level: 'advanced',
        icon: '🎓',
        gradientFrom: '#8B5CF6',
        gradientTo: '#EC4899',
        order: 3,
        estimatedHours: 80
      },
      {
        title: 'Ngữ Pháp Tiếng Anh',
        slug: 'ngu-phap',
        description: 'Hệ thống ngữ pháp từ cơ bản đến nâng cao',
        level: 'grammar',
        icon: '📝',
        gradientFrom: '#F59E0B',
        gradientTo: '#EF4444',
        order: 4,
        estimatedHours: 50
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`   ✓ Created ${createdCourses.length} courses`);

    // ===== 2. TẠO TOPICS CHO TỪNG COURSE =====
    console.log('\n📖 Creating Topics...');

    // Topics cho CƠ BẢN
    const beginnerTopics = [
      { title: 'Giới thiệu bản thân', icon: '👋', color: '#EC4899', description: 'Học cách tự giới thiệu bằng tiếng Anh' },
      { title: 'Sinh hoạt hằng ngày', icon: '🏠', color: '#06B6D4', description: 'Từ vựng và câu thường dùng hàng ngày' },
      { title: 'Gọi đồ ăn', icon: '🍔', color: '#3B82F6', description: 'Đặt món tại nhà hàng & quán ăn' },
      { title: 'Thời tiết', icon: '☀️', color: '#8B5CF6', description: 'Nói chuyện về thời tiết' },
      { title: 'Cảm xúc & Tính cách', icon: '😊', color: '#EC4899', description: 'Mô tả cảm xúc và tính cách' },
      { title: 'Mua bán online', icon: '🛒', color: '#8B5CF6', description: 'Giao dịch và mua sắm trực tuyến' },
      { title: 'Nhà hàng', icon: '🍽️', color: '#F59E0B', description: 'Nhà hàng và đặt bàn' },
      { title: 'Giải trí', icon: '🎬', color: '#06B6D4', description: 'Phim nhạc và sở thích' }
    ];

    // Topics cho TRUNG CẤP
    const intermediateTopics = [
      { title: 'Công nghệ', icon: '💻', color: '#3B82F6', description: 'Tiếng Anh trong thời đại số' },
      { title: 'Nơi ở thú cưng', icon: '🐕', color: '#F97316', description: 'Từ vựng về động vật và thú cưng' }
    ];

    // Topics cho NÂNG CAO
    const advancedTopics = [
      { title: 'Du lịch', icon: '✈️', color: '#10B981', description: 'Tiếng Anh cho chuyến du lịch' },
      { title: 'Nghề nghiệp', icon: '💼', color: '#EC4899', description: 'Tiếng Anh trong công việc' },
      { title: 'Đi lại', icon: '🚗', color: '#3B82F6', description: 'Phương tiện và chỉ đường' }
    ];

    // Topics cho NGỮ PHÁP
    const grammarTopics = [
      { title: 'Các thì', icon: '⏰', color: '#8B5CF6', description: '12 thì trong tiếng Anh' },
      { title: 'Mẫu câu', icon: '📄', color: '#10B981', description: 'Các mẫu câu thường dùng' },
      { title: 'Câu điều kiện', icon: '🔀', color: '#F59E0B', description: 'If clauses và cách dùng' },
      { title: 'Câu bị động', icon: '🔄', color: '#06B6D4', description: 'Passive voice và ứng dụng' }
    ];

    let topicCount = 0;

    // Insert topics cho từng course
    for (const course of createdCourses) {
      let topicsToInsert = [];
      
      if (course.level === 'beginner') {
        topicsToInsert = beginnerTopics;
      } else if (course.level === 'intermediate') {
        topicsToInsert = intermediateTopics;
      } else if (course.level === 'advanced') {
        topicsToInsert = advancedTopics;
      } else if (course.level === 'grammar') {
        topicsToInsert = grammarTopics;
      }

      const topics = topicsToInsert.map((topic, index) => ({
        courseId: course._id,
        title: topic.title,
        description: topic.description,
        icon: topic.icon,
        color: topic.color,
        order: index + 1,
        totalLessons: 0,
        xpReward: 50,
        isLocked: index > 0, // Chỉ topic đầu tiên mở khóa
        estimatedMinutes: 45,
        isPublished: true
      }));

      await Topic.insertMany(topics);
      
      // Update course totalTopics
      await Course.findByIdAndUpdate(course._id, {
        totalTopics: topics.length
      });

      topicCount += topics.length;
      console.log(`   ✓ Created ${topics.length} topics for "${course.title}"`);
    }

    console.log(`\n✅ DONE! Created ${createdCourses.length} courses and ${topicCount} topics`);
    
    // Display summary
    console.log('\n📊 SUMMARY:');
    for (const course of createdCourses) {
      const topics = await Topic.find({ courseId: course._id });
      console.log(`\n   ${course.icon} ${course.title} (${course.level})`);
      console.log(`      └─ ${topics.length} chuyên đề`);
      topics.forEach(topic => {
        console.log(`         • ${topic.icon} ${topic.title}`);
      });
    }

    console.log('\n🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
}

seedDatabase();
