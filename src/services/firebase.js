import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBr__DYzDRNk3rBqZ1RD-IxE6A4til9hWo",
  authDomain: "loy-krathong-festival-f4841.firebaseapp.com",
  projectId: "loy-krathong-festival-f4841",
  storageBucket: "loy-krathong-festival-f4841.firebasestorage.app",
  messagingSenderId: "28978916681",
  appId: "1:28978916681:web:772f21f2df49dae2ebbe98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
};
