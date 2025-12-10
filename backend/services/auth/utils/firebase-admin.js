const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp;

function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase credentials not configured. Firebase features will be disabled.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('✅ Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return null;
  }
}

// Verify Firebase ID token
async function verifyIdToken(idToken) {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error.message);
    throw error;
  }
}

// Get user by email from Firebase
async function getFirebaseUserByEmail(email) {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

// Get user by UID from Firebase
async function getFirebaseUserByUid(uid) {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }

  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

// Check if email is verified in Firebase
async function isEmailVerified(uid) {
  const user = await getFirebaseUserByUid(uid);
  return user?.emailVerified ?? false;
}

// Delete Firebase user
async function deleteFirebaseUser(uid) {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }

  try {
    await admin.auth().deleteUser(uid);
    return true;
  } catch (error) {
    console.error('Error deleting Firebase user:', error.message);
    throw error;
  }
}

// Create custom token for user
async function createCustomToken(uid, claims = {}) {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }

  try {
    const customToken = await admin.auth().createCustomToken(uid, claims);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error.message);
    throw error;
  }
}

// Initialize on module load
initializeFirebase();

module.exports = {
  initializeFirebase,
  verifyIdToken,
  getFirebaseUserByEmail,
  getFirebaseUserByUid,
  isEmailVerified,
  deleteFirebaseUser,
  createCustomToken,
  admin,
};
