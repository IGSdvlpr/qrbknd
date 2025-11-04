import admin from "../lib/firebaseAdmin.js";
import QRCode from "qrcode";
import crypto from "crypto";

const db = admin.firestore();

const urlBase =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_URL_BASE
    : process.env.DEV_URL_BASE;

export default async function crearTarjeta(req, res) {
  try {
    // 🔹 1. Crear ID único para la tarjeta
    const idTarjeta = `TARJ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // 🔹 2. Guardar registro en Firestore
    await db.collection("tarjetas").doc(idTarjeta).set({
      idTarjeta,
      viajes: 0,
      creadaEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 🔹 3. Generar token de seguridad opcional
    const token = crypto
      .createHash("sha256")
      .update(idTarjeta + (process.env.SECRET_KEY || "default_secret"))
      .digest("hex");

    // 🔹 4. Construir la URL del QR
    const qrData = `${urlBase}/tarjeta/${idTarjeta}?token=${token}`;

    // 🔹 5. Generar QR en base64 (sin guardar archivo)
    const qrBase64 = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // 🔹 6. Enviar al cliente Android
    res.json({
      tarjetaId: idTarjeta,
      urlTarjeta: qrData,
      qrBase64, // imagen lista para guardar en el móvil
    });
  } catch (error) {
    console.error("❌ [crearTarjeta]", error);
    res.status(500).json({
      error: "Error interno del servidor al crear la tarjeta",
      detalles:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}
