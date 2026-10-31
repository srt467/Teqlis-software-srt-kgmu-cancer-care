import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzzqemSU3tY-Gj0GtFhfNy3Oqa5ynpU14",
  authDomain: "kgmu-cancer-care.firebaseapp.com",
  projectId: "kgmu-cancer-care",
  storageBucket: "kgmu-cancer-care.firebasestorage.app",
  messagingSenderId: "889537685983",
  appId: "1:889537685983:web:35cfaa515ccf47db717c6a"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
