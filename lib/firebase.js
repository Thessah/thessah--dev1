// lib/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";

// COMPAT IMPORT for OTP + Recaptcha
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// ------------------------------
// Correct Firebase Config - thessah-8ca25
// ------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAXLHYHafu3-qWPU8B7VQfjFwguSpAQKcs",
  authDomain: "thessah-8ca25.firebaseapp.com",
  projectId: "thessah-8ca25",
  storageBucket: "thessah-8ca25.firebasestorage.app",
  messagingSenderId: "406456380138",
  appId: "1:406456380138:web:b3e0c4d5c0e3ebedce8593",
  measurementId: "G-QQ7G0LZLPP"
};

// ------------------------------
// Initialize modular app
// ------------------------------
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Modular Auth
export const auth = getAuth(app);

// Ensure user stays logged in until sign out
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// ------------------------------
// Initialize COMPAT Firebase (required for RecaptchaVerifier + OTP)
// ------------------------------
if (typeof window !== "undefined") {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.firebase = firebase;
}

// ------------------------------
// Recaptcha Verifier Helper
// ------------------------------
export const getRecaptchaVerifier = () => {
  if (typeof window === "undefined") return null;

  const compat = window.firebase?.auth;
  if (!compat) return null;

  return new compat.RecaptchaVerifier(
    "recaptcha-container",
    { size: "invisible" },
    auth
  );
};

export default app;
