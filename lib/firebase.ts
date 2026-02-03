// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase (la misma que tenías en admin)
const firebaseConfig = {
  apiKey: "AIzaSyA3_RJB2_asrcB5TTfwA6p-OOp4FFkAk7A",
  authDomain: "crm-premia.firebaseapp.com",
  projectId: "crm-premia",
  storageBucket: "crm-premia.firebasestorage.app",
  messagingSenderId: "205991324523",
  appId: "1:205991324523:web:ca5d4b245931dccf7cba2e",
  measurementId: "G-004CT5PZBC"
};

// Evita inicializar varias veces (importante en Next.js dev mode)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);