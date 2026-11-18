import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDummyKeyForMockOrTesting123456",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "hidroponik-ebbflow.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    process.env.VITE_FIREBASE_DATABASE_URL ||
    "https://hidroponik-ebbflow-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    "hidroponik-ebbflow",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "hidroponik-ebbflow.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "123456789012",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.VITE_FIREBASE_APP_ID ||
    "1:123456789012:web:abcdef1234567890abcdef",
};

// Inisialisasi Firebase App secara modular (singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);

export const DEFAULT_DEVICE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_DEVICE_ID ||
  process.env.VITE_DEFAULT_DEVICE_ID ||
  "esp32_hidroponik_01";

export const isFirebaseConfigured = () => {
  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY;
  return Boolean(apiKey && !apiKey.includes("DummyKey"));
};

export default { app, auth, db, DEFAULT_DEVICE_ID, isFirebaseConfigured };
