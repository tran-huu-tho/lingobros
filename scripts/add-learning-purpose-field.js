const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lingobros';

async function addLearningPurposeToAll() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Update ALL users to have learningPurpose field
    const result = await usersCollection.updateMany(
      {},
      {
        $set: {
          'preferences.learningPurpose': null
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users`);
    
    // Verify
    const allUsers = await usersCollection.find({}).toArray();
    console.log('\n=== Verification ===');
    for (const user of allUsers) {
      console.log(`${user.displayName}: learningPurpose = ${user.preferences?.learningPurpose}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addLearningPurposeToAll();
