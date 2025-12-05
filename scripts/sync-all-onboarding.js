const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lingobros';

async function syncAllOnboardingData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all users
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`Found ${allUsers.length} total users`);

    let fixedCount = 0;

    for (const user of allUsers) {
      const updates = {};
      let needsUpdate = false;

      // 1. Fix learningGoal if it contains purpose values
      const purposeValues = ['communication', 'study-abroad', 'exam', 'improvement', 'other'];
      if (purposeValues.includes(user.preferences?.learningGoal)) {
        updates['preferences.learningPurpose'] = user.preferences.learningGoal;
        updates['preferences.learningGoal'] = 'regular';
        needsUpdate = true;
        console.log(`  - Moving learningGoal to learningPurpose: ${user.preferences.learningGoal}`);
      }

      // 2. Ensure preferences object exists with defaults
      if (!user.preferences) {
        updates['preferences'] = {
          learningGoal: 'regular',
          learningPurpose: null,
          dailyGoalMinutes: 15,
          notificationsEnabled: true,
          soundEnabled: true,
          interests: []
        };
        needsUpdate = true;
        console.log(`  - Creating preferences object`);
      }

      // 3. Ensure hasCompletedOnboarding is boolean
      if (typeof user.hasCompletedOnboarding !== 'boolean') {
        updates['hasCompletedOnboarding'] = false;
        needsUpdate = true;
        console.log(`  - Setting hasCompletedOnboarding to false`);
      }

      // 4. Ensure learningPurpose is valid or null
      if (user.preferences?.learningPurpose && 
          !purposeValues.includes(user.preferences.learningPurpose) &&
          user.preferences.learningPurpose !== null) {
        updates['preferences.learningPurpose'] = null;
        needsUpdate = true;
        console.log(`  - Resetting invalid learningPurpose: ${user.preferences.learningPurpose}`);
      }

      // 5. Ensure learningGoal is valid
      const goalValues = ['casual', 'regular', 'serious', 'intense'];
      if (user.preferences?.learningGoal && !goalValues.includes(user.preferences.learningGoal)) {
        updates['preferences.learningGoal'] = 'regular';
        needsUpdate = true;
        console.log(`  - Resetting invalid learningGoal: ${user.preferences.learningGoal}`);
      }

      // 6. Ensure dailyGoalMinutes is a number
      if (typeof user.preferences?.dailyGoalMinutes !== 'number') {
        updates['preferences.dailyGoalMinutes'] = 15;
        needsUpdate = true;
        console.log(`  - Setting default dailyGoalMinutes`);
      }

      // Apply updates if needed
      if (needsUpdate) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updates }
        );
        fixedCount++;
        console.log(`✓ Fixed user: ${user.displayName} (${user.email})`);
      }
    }

    console.log(`\n=== Sync Complete ===`);
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Fixed users: ${fixedCount}`);
    console.log(`No changes needed: ${allUsers.length - fixedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Sync error:', error);
    process.exit(1);
  }
}

syncAllOnboardingData();
