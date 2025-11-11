// Quick MongoDB Connection Test
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/lingobros';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('✅ MongoDB connected successfully!');
    
    const db = client.db('lingobros');
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📊 Database: lingobros`);
    console.log(`📚 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('\nCollections:');
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
      }
    } else {
      console.log('\n⚠️  No collections yet (database is empty)');
      console.log('💡 This is normal for a new project!');
    }
    
    await client.close();
    console.log('\n✅ Connection test completed!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
