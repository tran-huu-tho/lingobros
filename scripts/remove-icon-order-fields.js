/**
 * Migration Script: Remove icon and order fields from Levels and Courses
 * This script removes the deprecated icon and order fields from the database
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Remove icon and order from Levels collection
    console.log('📋 Removing icon and order fields from Levels...');
    const levelsResult = await db.collection('levels').updateMany(
      {},
      { 
        $unset: { 
          icon: "",
          order: ""
        } 
      }
    );
    console.log(`✅ Updated ${levelsResult.modifiedCount} levels`);

    // Remove icon and order from Courses collection
    console.log('\n📚 Removing icon and order fields from Courses...');
    const coursesResult = await db.collection('courses').updateMany(
      {},
      { 
        $unset: { 
          icon: "",
          order: ""
        } 
      }
    );
    console.log(`✅ Updated ${coursesResult.modifiedCount} courses`);

    // Remove order index from Levels
    console.log('\n🔍 Removing order index from Levels...');
    try {
      await db.collection('levels').dropIndex('order_1');
      console.log('✅ Dropped order_1 index from levels');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  Index order_1 does not exist on levels (already removed)');
      } else {
        throw error;
      }
    }

    console.log('\n✨ Migration completed successfully!');
    
    // Show summary
    console.log('\n📊 Summary:');
    console.log(`   - Levels updated: ${levelsResult.modifiedCount}`);
    console.log(`   - Courses updated: ${coursesResult.modifiedCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
console.log('🚀 Starting migration: Remove icon and order fields\n');
migrate();
