// Firebase configuration for Ryden app
// Works across Web, iOS, and Android via Expo

import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
    ActionCodeSettings,
    Auth,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    signOut as firebaseSignOut,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    User
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcwxlXmhFRvkBy4XHONJY6hNhKIkbMFZI",
  authDomain: "ryden-df752.firebaseapp.com",
  projectId: "ryden-df752",
  storageBucket: "ryden-df752.firebasestorage.app",
  messagingSenderId: "320415376754",
  appId: "1:320415376754:web:ef767ca79814b13c2429eb",
  measurementId: "G-L8Z3EKP018"
};

// Initialize Firebase (only once)
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);

// Action code settings for email verification
const actionCodeSettings: ActionCodeSettings = {
  url: 'https://ryden-df752.firebaseapp.com/__/auth/action', // Redirect URL after verification
  handleCodeInApp: false, // Handle in web browser
};

// Firebase Auth helper functions
export const firebaseAuth = {
  // Create user with email and password
  createUser: async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  },

  // Send email verification
  sendVerificationEmail: async (user?: User) => {
    const currentUser = user || auth.currentUser;
    if (!currentUser) {
      throw new Error('No user signed in');
    }
    return sendEmailVerification(currentUser, actionCodeSettings);
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string) => {
    if (!email) throw new Error('Email is required');
    return firebaseSendPasswordResetEmail(auth, email);
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // Sign out
  signOut: async () => {
    return firebaseSignOut(auth);
  },

  // Get current user
  getCurrentUser: () => auth.currentUser,

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Check if email is verified
  isEmailVerified: () => auth.currentUser?.emailVerified ?? false,

  // Reload user to get updated emailVerified status
  reloadUser: async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser;
    }
    return null;
  },

  // Get ID token for backend verification
  getIdToken: async (forceRefresh: boolean = false) => {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken(forceRefresh);
    }
    return null;
  },

  // Get auth instance
  getAuth: () => auth,
};

export { app, auth, firebaseConfig };
export default app;
