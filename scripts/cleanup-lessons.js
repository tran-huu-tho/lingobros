const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lingobros';

async function cleanup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa lessons và exercises cũ
    await mongoose.connection.db.collection('lessons').drop().catch(() => {});
    console.log('🗑️  Dropped lessons collection');

    await mongoose.connection.db.collection('exercises').drop().catch(() => {});
    console.log('🗑️  Dropped exercises collection');

    await mongoose.connection.close();
    console.log('\n✅ Cleanup completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanup();
