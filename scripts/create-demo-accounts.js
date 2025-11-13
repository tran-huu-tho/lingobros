/**
 * Script to create demo Firebase accounts with email/password
 * These accounts will link to the seeded MongoDB users
 * 
 * Run: node scripts/create-demo-accounts.js
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

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

const demoAccounts = [
  {
    email: 'demo@lingobros.com',
    password: 'password123',
    displayName: 'Demo User',
    photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=10b981&color=fff',
  },
  {
    email: 'student@lingobros.com',
    password: 'password123',
    displayName: 'Active Student',
    photoURL: 'https://ui-avatars.com/api/?name=Active+Student&background=3b82f6&color=fff',
  },
  {
    email: 'admin@lingobros.com',
    password: 'password123',
    displayName: 'Admin User',
    photoURL: 'https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff',
  },
];

async function createDemoAccounts() {
  console.log('🔥 Creating Firebase demo accounts...\n');

  for (const account of demoAccounts) {
    try {
      // Check if user already exists
      let user;
      try {
        user = await admin.auth().getUserByEmail(account.email);
        console.log(`✅ User ${account.email} already exists (UID: ${user.uid})`);
      } catch (error) {
        // User doesn't exist, create new one
        user = await admin.auth().createUser({
          email: account.email,
          password: account.password,
          displayName: account.displayName,
          photoURL: account.photoURL,
          emailVerified: true, // Auto-verify for demo accounts
        });
        console.log(`✨ Created ${account.email} (UID: ${user.uid})`);
      }

      // Update display name and photo if needed
      if (user.displayName !== account.displayName || user.photoURL !== account.photoURL) {
        await admin.auth().updateUser(user.uid, {
          displayName: account.displayName,
          photoURL: account.photoURL,
        });
        console.log(`   Updated profile for ${account.email}`);
      }

    } catch (error) {
      console.error(`❌ Error creating ${account.email}:`, error.message);
    }
  }

  console.log('\n✅ Demo accounts setup complete!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: demo@lingobros.com | Password: password123');
  console.log('   Email: student@lingobros.com | Password: password123');
  console.log('   Email: admin@lingobros.com | Password: password123');
  
  process.exit(0);
}

createDemoAccounts().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
