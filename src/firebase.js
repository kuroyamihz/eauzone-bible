// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- 1. FIREBASE KEYS ---
const firebaseConfig = {
  apiKey: "AIzaSyD1VqyKFQzZLk5rJip7uOWp_njZqLXdqaw",
  authDomain: "eauzone-bible.firebaseapp.com",
  projectId: "eauzone-bible",
  storageBucket: "eauzone-bible.firebasestorage.app",
  messagingSenderId: "211992247802",
  appId: "1:211992247802:web:7c6e0b5188d295772c3843"
};

// --- 2. CLOUDINARY KEYS ---
// CHECK THIS LINE CAREFULLY: Is it 'mcbse' or 'mobse'?
export const CLOUD_NAME = "dez7mobse"; 
export const UPLOAD_PRESET = "dypkyxtz"; 

// Initialize
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);