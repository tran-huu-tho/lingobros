// Script để xóa index trực tiếp từ MongoDB Atlas
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function dropIndexDirectly() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('🔌 Đang kết nối MongoDB Atlas...');
    await client.connect();
    console.log('✅ Đã kết nối');

    const db = client.db();
    const collection = db.collection('userprogresses');

    // Xem tất cả indexes
    console.log('\n📋 Danh sách indexes:');
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach(index => {
      console.log('  -', index.name, ':', JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    // Tìm và xóa index userId_1_lessonId_1
    const hasOldIndex = indexes.some(idx => idx.name === 'userId_1_lessonId_1');
    
    if (hasOldIndex) {
      console.log('\n🗑️  Tìm thấy index userId_1_lessonId_1, đang xóa...');
      await collection.dropIndex('userId_1_lessonId_1');
      console.log('✅ Đã xóa index userId_1_lessonId_1');

      // Xem lại
      console.log('\n📋 Danh sách indexes sau khi xóa:');
      const newIndexes = await collection.listIndexes().toArray();
      newIndexes.forEach(index => {
        console.log('  -', index.name, ':', JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
      });
    } else {
      console.log('\nℹ️  Không tìm thấy index userId_1_lessonId_1');
    }

    console.log('\n✅ Hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

dropIndexDirectly();
