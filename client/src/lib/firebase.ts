import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Firebase Configuration - Provided by user
const firebaseConfig = {
  apiKey: "AIzaSyDhVHhDEaCli9h1Upr7AmPrSaYCu2QmghU",
  authDomain: "earning-testing-2afdb.firebaseapp.com",
  databaseURL: "https://earning-testing-2afdb-default-rtdb.firebaseio.com",
  projectId: "earning-testing-2afdb",
  storageBucket: "earning-testing-2afdb.firebasestorage.app",
  messagingSenderId: "41463233251",
  appId: "1:41463233251:web:4676a61c214dd1c3f723d6",
  measurementId: "G-F8XG0W6N3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
