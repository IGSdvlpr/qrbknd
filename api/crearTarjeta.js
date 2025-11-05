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
    const idTarjeta = `TARJ-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    // 🔐 Generar token seguro (solo se guarda en Firestore)
    const token = crypto
      .createHash("sha256")
      .update(idTarjeta + (process.env.SECRET_KEY || "default_secret"))
      .digest("hex");

    // 📦 Guardar datos en Firestore
    await db.collection("tarjetas").doc(idTarjeta).set({
      idTarjeta,
      token, // ⚠️ solo se guarda, no se expone
      viajes: 0,
      creadaEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    // ✅ Generar QR con solo el ID (sin token)
    const qrData = `${urlBase}/t/${idTarjeta}`;

    const qrBase64 = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // 🔁 Devolver respuesta limpia
    res.json({
      tarjetaId: idTarjeta,
      qr: qrBase64,
    });

  } catch (error) {
    console.error(`[crearTarjeta] ${error.name}: ${error.message}`);
    res.status(500).json({
      error: "Error interno del servidor al crear la tarjeta",
      detalles:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
