// Test PATCH API để update bio
// Chạy: node scripts/test-update-bio.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testUpdateBio() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Lấy user đầu tiên để test
    const user = await usersCollection.findOne({});
    console.log('Testing with user:', user.email);
    console.log('Current bio:', user.bio);

    // Update bio trực tiếp
    const testBio = 'This is a test bio - ' + new Date().toISOString();
    const result = await usersCollection.findOneAndUpdate(
      { _id: user._id },
      { $set: { bio: testBio } },
      { returnDocument: 'after' }
    );

    console.log('Update result - bio:', result.bio);
    console.log('Success! Bio updated to:', testBio);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUpdateBio();
