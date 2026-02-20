import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Zelo Firebase Configuration
// NOTE: NEXT_PUBLIC_* values are expected from environment variables in deployment.
// Fallbacks below match the project defaults so static builds don't fail when `.env.local`
// isn't present in CI (e.g., GitHub/Netlify previews).
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCrOc8NrzGf5zmJM0lOTyk1o2AoQ1vQk00",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "zelo-webapp.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "zelo-webapp",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zelo-webapp.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "941028200648",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:941028200648:web:cd225d541adc7feccdd5fd",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VJ768DDNGL"
};

// Initialize Firebase only once for Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
export { app, auth, db, storage };
