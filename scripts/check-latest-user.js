const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lingobros';

async function checkLatestUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get the most recently created user
    const latestUser = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (latestUser.length === 0) {
      console.log('No users found in database');
      process.exit(0);
    }

    const user = latestUser[0];
    
    console.log('\n=== Latest User ===');
    console.log('Display Name:', user.displayName);
    console.log('Email:', user.email);
    console.log('Firebase UID:', user.firebaseUid);
    console.log('Created At:', user.createdAt);
    console.log('\n--- Onboarding Status ---');
    console.log('hasCompletedOnboarding:', user.hasCompletedOnboarding);
    console.log('Type:', typeof user.hasCompletedOnboarding);
    console.log('\n--- Preferences ---');
    console.log('learningPurpose:', user.preferences?.learningPurpose);
    console.log('learningGoal:', user.preferences?.learningGoal);
    console.log('dailyGoalMinutes:', user.preferences?.dailyGoalMinutes);
    
    console.log('\n--- Should Show Modal? ---');
    const shouldShow = user.hasCompletedOnboarding === false;
    console.log('Result:', shouldShow ? 'YES ✓' : 'NO ✗');
    console.log('Reason:', shouldShow ? 'hasCompletedOnboarding is false' : `hasCompletedOnboarding is ${user.hasCompletedOnboarding}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLatestUser();
