import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBkMh0QojYD4AlWvHQz4XBUScnuEh6CQ6k",
  authDomain: "arise-firebase-database.firebaseapp.com",
  databaseURL: "https://arise-firebase-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "arise-firebase-database",
  storageBucket: "arise-firebase-database.firebasestorage.app",
  messagingSenderId: "403922724835",
  appId: "1:403922724835:web:1f836add1c93ffc05722d6"
};

const app = initializeApp(firebaseConfig);

// Firestore — stores your 211 navigation nodes
export const db = getFirestore(app);

// Realtime Database — used as a live "settings tunnel" (line color, y-offset)
export const rtdb = getDatabase(app);