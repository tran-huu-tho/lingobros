import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app: App;
let adminAuth: any;

if (!getApps().length) {
  try {
    // Try to initialize with real service account if available
    const hasValidServiceAccount = 
      process.env.FIREBASE_ADMIN_PROJECT_ID && 
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL && 
      process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (hasValidServiceAccount) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
      adminAuth = getAuth(app);
    } else {
      throw new Error('Firebase service account not configured - using mock mode');
    }
  } catch (error) {
    console.warn('Firebase Admin initialization failed, using mock auth:', error);
    // Create a mock auth that allows guest access
    adminAuth = {
      verifyIdToken: async (token: string) => {
        // Mock implementation - just verify token exists
        if (token) {
          return { uid: `mock-user-${Date.now()}` };
        }
        throw new Error('No token provided');
      }
    };
    
    // Still try to initialize app for other services
    if (!getApps().length) {
      try {
        app = initializeApp({
          projectId: 'lingobros-4f457',
        } as any);
      } catch (e) {
        // Ignore if can't initialize
      }
    }
  }
} else {
  app = getApps()[0];
  try {
    adminAuth = getAuth(app);
  } catch (e) {
    // Fallback to mock
    adminAuth = {
      verifyIdToken: async (token: string) => {
        if (token) {
          return { uid: `mock-user-${Date.now()}` };
        }
        throw new Error('No token provided');
      }
    };
  }
}

export { adminAuth };
export default app;
