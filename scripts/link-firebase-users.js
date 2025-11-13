/**
 * Script to link MongoDB users with Firebase UIDs
 * Run after creating Firebase demo accounts
 * 
 * Run: node scripts/link-firebase-users.js
 */

const mongoose = require('mongoose');
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingobros';

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// User Schema
const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: String,
  xp: { type: Number, default: 0 },
  hearts: { type: Number, default: 5 },
  streak: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function linkFirebaseUsers() {
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users from MongoDB
    const mongoUsers = await User.find({});
    console.log(`Found ${mongoUsers.length} users in MongoDB\n`);

    for (const mongoUser of mongoUsers) {
      try {
        // Get Firebase user by email
        const firebaseUser = await admin.auth().getUserByEmail(mongoUser.email);
        
        // Update MongoDB user with Firebase UID
        await User.updateOne(
          { _id: mongoUser._id },
          { 
            $set: { 
              firebaseUid: firebaseUser.uid,
              photoURL: firebaseUser.photoURL || mongoUser.photoURL,
            } 
          }
        );

        console.log(`✅ Linked ${mongoUser.email}`);
        console.log(`   MongoDB ID: ${mongoUser._id}`);
        console.log(`   Firebase UID: ${firebaseUser.uid}`);
        console.log(`   Display Name: ${mongoUser.displayName}`);
        console.log('');

      } catch (error) {
        console.log(`⚠️  No Firebase account for ${mongoUser.email}`);
        console.log(`   (This is OK if you haven't created Firebase auth for this user)`);
        console.log('');
      }
    }

    console.log('✅ Linking complete!');
    
    // Verify results
    const linkedUsers = await User.find({ firebaseUid: { $ne: null } });
    console.log(`\n📊 Summary: ${linkedUsers.length}/${mongoUsers.length} users linked to Firebase`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

linkFirebaseUsers();
