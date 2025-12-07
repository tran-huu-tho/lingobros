const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingobros';

const LevelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  color: { type: String, default: '#3B82F6' },
  icon: { type: String, default: '📚' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Level = mongoose.models.Level || mongoose.model('Level', LevelSchema);

const levels = [
  {
    name: 'beginner',
    displayName: 'Cơ bản',
    description: 'Dành cho người mới bắt đầu',
    order: 1,
    color: '#10B981',
    icon: '🌱',
    isActive: true
  },
  {
    name: 'intermediate',
    displayName: 'Trung cấp',
    description: 'Nâng cao kỹ năng',
    order: 2,
    color: '#3B82F6',
    icon: '📚',
    isActive: true
  },
  {
    name: 'advanced',
    displayName: 'Nâng cao',
    description: 'Trình độ cao',
    order: 3,
    color: '#8B5CF6',
    icon: '🎓',
    isActive: true
  },
  {
    name: 'grammar',
    displayName: 'Ngữ pháp',
    description: 'Chuyên sâu ngữ pháp',
    order: 4,
    color: '#F59E0B',
    icon: '📖',
    isActive: true
  }
];

async function seedLevels() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa tất cả levels cũ
    await Level.deleteMany({});
    console.log('🗑️  Cleared existing levels');

    // Tạo levels mới
    const createdLevels = await Level.insertMany(levels);
    console.log(`✅ Created ${createdLevels.length} levels:`);
    createdLevels.forEach(level => {
      console.log(`   - ${level.displayName} (${level.name}) - ID: ${level._id}`);
    });

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding levels:', error);
    process.exit(1);
  }
}

seedLevels();
