import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// PASTE YOUR CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyA-PDjYBMjJEptg67g1Ah87ElgA5Brq01o",
  authDomain: "liberate-me-55fd9.firebaseapp.com",
  projectId: "liberate-me-55fd9",
  storageBucket: "liberate-me-55fd9.firebasestorage.app",
  messagingSenderId: "635595452302",
  appId: "1:635595452302:web:706358907ee1c86cda3edf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;