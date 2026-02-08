// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCB3WbP-Uy5C7nyfBc_GT_ovZ-Sl6w5b_Y",
  authDomain: "lebwpolish.firebaseapp.com",
  projectId: "lebwpolish",
  storageBucket: "lebwpolish.firebasestorage.app",
  messagingSenderId: "1070474378349",
  appId: "1:1070474378349:web:f1d44f2289989399585364",
  measurementId: "G-8B019LVVT8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


