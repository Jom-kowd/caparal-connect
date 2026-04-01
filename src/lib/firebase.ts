import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_I6jHoqDI7DqdQQxXGR7rbAv5f45TWfY",
  authDomain: "caparal-connect.firebaseapp.com",
  projectId: "caparal-connect",
  storageBucket: "caparal-connect.firebasestorage.app",
  messagingSenderId: "862674245002",
  appId: "1:862674245002:web:8a631680ce8169ba9d6473"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database with Offline Caching (Para bumilis ang loading)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Initialize Authentication
export const auth = getAuth(app);