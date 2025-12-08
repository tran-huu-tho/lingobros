const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  hasCompletedOnboarding: { type: Boolean, default: false },
  preferences: {
    learningGoal: String,
    dailyGoalMinutes: Number
  }
}, {
  timestamps: true,
  strict: false
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkOnboarding() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users
    const users = await User.find({}).select('email displayName hasCompletedOnboarding preferences');
    
    console.log(`👥 Total users: ${users.length}\n`);
    
    users.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`   Name: ${user.displayName}`);
      console.log(`   Completed Onboarding: ${user.hasCompletedOnboarding ? '✅' : '❌'}`);
      console.log(`   Learning Goal: ${user.preferences?.learningGoal || 'Not set'}`);
      console.log(`   Daily Goal: ${user.preferences?.dailyGoalMinutes || 'Not set'} minutes`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOnboarding();
