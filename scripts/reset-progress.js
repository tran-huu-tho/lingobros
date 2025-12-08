// Script để reset lại UserProgress collection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function resetProgress() {
  try {
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('userprogresses');

    // Xem tất cả indexes
    console.log('\n📋 Danh sách indexes hiện tại:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('  -', index.name, ':', JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    // Xóa index userId_1_lessonId_1 nếu tồn tại
    console.log('\n🗑️  Đang thử xóa index userId_1_lessonId_1...');
    try {
      await collection.dropIndex('userId_1_lessonId_1');
      console.log('✅ Đã xóa index userId_1_lessonId_1');
    } catch (error) {
      console.log('ℹ️  Index userId_1_lessonId_1 không tồn tại hoặc đã bị xóa');
    }

    // Đếm số documents hiện tại
    const count = await collection.countDocuments();
    console.log(`\n📊 Hiện có ${count} documents trong collection`);

    // Xóa tất cả documents để reset
    console.log('\n🗑️  Đang xóa tất cả documents...');
    const result = await collection.deleteMany({});
    console.log(`✅ Đã xóa ${result.deletedCount} documents`);

    // Xem lại indexes
    console.log('\n📋 Danh sách indexes sau khi reset:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log('  -', index.name, ':', JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    console.log('\n✅ Reset hoàn tất! Bây giờ có thể thử lại.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

resetProgress();
