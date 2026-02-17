// lib/firebaseAdmin.js
import admin from "firebase-admin";

let initialized = false;

export function getAdmin() {
  if (initialized) return admin;

  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
  } = process.env;
  console.log("ENV CHECK:");
  console.log("PROJECT_ID:", FIREBASE_PROJECT_ID);
  console.log("CLIENT_EMAIL:", FIREBASE_CLIENT_EMAIL);
  console.log("PRIVATE_KEY EXISTS:", !!FIREBASE_PRIVATE_KEY);

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error("Faltan variables de entorno de Firebase");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  initialized = true;
  return admin;
}
