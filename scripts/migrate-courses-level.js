const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingobros';

const LevelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  color: { type: String, default: '#3B82F6' },
  icon: { type: String, default: '📚' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  level: { type: mongoose.Schema.Types.Mixed }, // Mixed để có thể đọc cả string và ObjectId
  icon: { type: String },
  color: { type: String, default: '#3B82F6' },
  gradientFrom: { type: String },
  gradientTo: { type: String },
  order: { type: Number, required: true },
  totalTopics: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 10 },
  isPublished: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false }); // strict: false để đọc được tất cả fields

const Level = mongoose.models.Level || mongoose.model('Level', LevelSchema);
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function migrateCourses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả levels
    const levels = await Level.find({});
    console.log(`📚 Found ${levels.length} levels`);

    // Tạo mapping từ level name sang ObjectId
    const levelMap = {};
    levels.forEach(level => {
      levelMap[level.name] = level._id;
      console.log(`   - ${level.name} → ${level._id}`);
    });

    // Lấy tất cả courses có level là string
    const courses = await Course.find({});
    console.log(`\n📖 Found ${courses.length} courses to migrate`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const course of courses) {
      try {
        // Lấy giá trị level hiện tại
        const currentLevel = course.level;
        
        console.log(`\n🔍 Checking "${course.title}":`, {
          currentLevel,
          type: typeof currentLevel,
          isObjectId: mongoose.Types.ObjectId.isValid(currentLevel)
        });
        
        // Kiểm tra nếu level đã là ObjectId
        if (mongoose.Types.ObjectId.isValid(currentLevel) && String(currentLevel).length === 24) {
          // Kiểm tra xem ObjectId này có tồn tại trong levels không
          const levelExists = await Level.findById(currentLevel);
          if (levelExists) {
            console.log(`⏭️  Skipped: "${course.title}" - already migrated to valid ObjectId`);
            skipped++;
            continue;
          }
        }

        // Nếu level là string hoặc ObjectId không hợp lệ
        const levelName = String(currentLevel).toLowerCase();
        const newLevelId = levelMap[levelName];

        if (!newLevelId) {
          console.log(`⚠️  Warning: "${course.title}" has unknown level "${currentLevel}" (as string: "${levelName}")`);
          errors++;
          continue;
        }

        // Cập nhật course với ObjectId mới
        await Course.updateOne(
          { _id: course._id },
          { $set: { level: newLevelId } }
        );

        console.log(`✅ Updated: "${course.title}" - ${levelName} → ${newLevelId}`);
        updated++;
      } catch (err) {
        console.error(`❌ Error updating "${course.title}":`, err.message);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error migrating courses:', error);
    process.exit(1);
  }
}

migrateCourses();
