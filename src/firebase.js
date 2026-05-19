import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace this with your own Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCa6y0fY55otUDTTMrhxTZmaVlnjCq6itA",
  authDomain: "nfc-biz-card-9cb6c.firebaseapp.com",
  projectId: "nfc-biz-card-9cb6c",
  storageBucket: "nfc-biz-card-9cb6c.firebasestorage.app",
  messagingSenderId: "159524115324",
  appId: "1:159524115324:web:3ff53c51d0d37e075f8af9",
  measurementId: "G-XP5XSKN9WM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
