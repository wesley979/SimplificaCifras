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
  updateDoc,
  deleteDoc,
  increment,
  setDoc // <-- para favoritos
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

// ====================
// FUNÇÕES DE FAVORITOS
// ====================

// Adiciona cifra aos favoritos do usuário
const addFavorite = async (userId, cifraId) => {
  const favDocRef = doc(db, 'usuarios', userId, 'favorites', cifraId); // alterado para 'usuarios'
  await setDoc(favDocRef, {
    cifraId,
    favoritedAt: new Date().toISOString()
  });
};

// Remove cifra dos favoritos do usuário
const removeFavorite = async (userId, cifraId) => {
  const favDocRef = doc(db, 'usuarios', userId, 'favorites', cifraId); // alterado para 'usuarios'
  await deleteDoc(favDocRef);
};

// Verifica se a cifra já está favoritada
const isFavorite = async (userId, cifraId) => {
  const favDocRef = doc(db, 'usuarios', userId, 'favorites', cifraId); // alterado para 'usuarios'
  const favSnap = await getDoc(favDocRef);
  return favSnap.exists();
};

// Pega todos os favoritos de um usuário
const getFavorites = async (userId) => {
  const favColRef = collection(db, 'usuarios', userId, 'favorites'); // alterado para 'usuarios'
  const favSnapshot = await getDocs(favColRef);
  return favSnapshot.docs.map(doc => doc.data());
};

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
  increment,
  setDoc,       // Para favoritos
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavorites
};
