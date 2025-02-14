// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration using env variables
const firebaseConfig = {
  apiKey: "AIzaSyBjUJfKBCujD888RoP_AR2F7Xxl2HQVwHM",
  authDomain: "oktest-27f3c.firebaseapp.com",
  projectId: "oktest-27f3c",
  storageBucket: "oktest-27f3c.firebasestorage.app",
  messagingSenderId: "464361861878",
  appId: "1:464361861878:web:02e5d4dc921fc22221b2d7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set Auth Persistence to localStorage so that the session persists across refreshes.
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Firebase Auth Persistence Set to Local"))
  .catch((error) => console.error("Firebase Auth Persistence Error:", error));

export { auth, db };
export default app;
