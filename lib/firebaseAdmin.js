// lib/firebaseAdmin.js
import admin from "firebase-admin";

let initialized = false;

export function getAdmin() {
  if (initialized) return admin;

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida");
  }

  const json = JSON.parse(
    Buffer.from(base64, "base64").toString("utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(json),
  });

  initialized = true;
  return admin;
}
