// Script để xóa index cũ không còn dùng trong UserProgress collection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function dropOldIndex() {
  try {
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('userprogresses');

    // Xem tất cả indexes hiện có
    console.log('\n📋 Danh sách indexes hiện tại:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('  -', index.name, JSON.stringify(index.key));
    });

    // Xóa index userId_1_lessonId_1
    console.log('\n🗑️  Đang xóa index userId_1_lessonId_1...');
    try {
      await collection.dropIndex('userId_1_lessonId_1');
      console.log('✅ Đã xóa index userId_1_lessonId_1');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️  Index không tồn tại, có thể đã xóa rồi');
      } else {
        throw error;
      }
    }

    // Xem lại indexes sau khi xóa
    console.log('\n📋 Danh sách indexes sau khi xóa:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log('  -', index.name, JSON.stringify(index.key));
    });

    console.log('\n✅ Hoàn thành!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

dropOldIndex();
