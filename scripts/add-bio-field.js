const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function addBioField() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Add bio field to all users that don't have it
    const result = await usersCollection.updateMany(
      { bio: { $exists: false } },
      { $set: { bio: '' } }
    );

    console.log(`Updated ${result.modifiedCount} users with bio field`);

    // Verify
    const usersWithBio = await usersCollection.countDocuments({ bio: { $exists: true } });
    console.log(`Total users with bio field: ${usersWithBio}`);

    await mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addBioField();
