// src/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,    // <-- ADICIONADO
  deleteDoc,    // <-- ADICIONADO
  increment     // <-- ADICIONADO para contador de visualizações
} from 'firebase/firestore';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Autenticação e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Funções de autenticação
const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

const logoutUser = () => signOut(auth);

const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);

export {
  auth,
  db,
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment  // <-- exportado para contador de visualizações
};
