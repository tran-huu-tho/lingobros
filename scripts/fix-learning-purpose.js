const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lingobros';

async function fixLearningPurpose() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users where learningGoal is one of the purpose values
    const purposeValues = ['communication', 'study-abroad', 'exam', 'improvement', 'other'];
    
    const usersToFix = await usersCollection.find({
      'preferences.learningGoal': { $in: purposeValues }
    }).toArray();

    console.log(`Found ${usersToFix.length} users to fix`);

    for (const user of usersToFix) {
      const wrongValue = user.preferences.learningGoal;
      
      // Move the value from learningGoal to learningPurpose
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            'preferences.learningPurpose': wrongValue,
            'preferences.learningGoal': 'regular' // Reset to default
          }
        }
      );

      console.log(`Fixed user ${user.displayName}: ${wrongValue} moved to learningPurpose`);
    }

    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

fixLearningPurpose();
