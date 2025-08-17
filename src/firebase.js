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
  deleteDoc     // <-- ADICIONADO
} from 'firebase/firestore';

// Configuração real do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBd5JxwMOKaiLmqp2uskD6tq3_2CNB_NMU",
  authDomain: "simplificacifras-13a59.firebaseapp.com",
  projectId: "simplificacifras-13a59",
  storageBucket: "simplificacifras-13a59.appspot.com",
  messagingSenderId: "667304019744",
  appId: "1:667304019744:web:0e1d23e1c8837c63d9b945",
  measurementId: "G-30FPREH956"
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
  updateDoc,     // <-- exportado para editar cifras
  deleteDoc      // <-- exportado para deletar cifras
};
