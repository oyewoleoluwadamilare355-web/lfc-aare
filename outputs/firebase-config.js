// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase configuration for the LFC Aare Church website.
export const firebaseConfig = {
  apiKey: "AIzaSyD9pPgstjk61L591zdlcn2f7OaypP3mPgA",
  authDomain: "kingmegad-30f67.firebaseapp.com",
  projectId: "kingmegad-30f67",
  storageBucket: "kingmegad-30f67.firebasestorage.app",
  messagingSenderId: "81567062415",
  appId: "1:81567062415:web:8ba053c67b05cdfea5d3fa",
  measurementId: "G-BVX8SEWFD0"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Authorized admin emails for client-side UI checks
export const adminEmails = ["lfcaarestudiounits@gmail.com"];

/**
 * Helper function to check if a given email is an authorized admin
 * @param {string|null} email 
 * @returns {boolean}
 */
export const isAdmin = (email) => {
  if (!email) return false;
  return adminEmails.includes(email.toLowerCase());
};
