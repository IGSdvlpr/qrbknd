import admin from "../lib/firebaseAdmin.js";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = admin.firestore();

const urlBase =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_URL_BASE
    : process.env.DEV_URL_BASE;

export default async function crearTarjeta(req, res) {
  try {
    const idTarjeta = `TARJ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    await db.collection("tarjetas").doc(idTarjeta).set({
      idTarjeta,
      viajes: 0,
      creadaEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Token de seguridad opcional
    const token = crypto.createHash("sha256")
      .update(idTarjeta + (process.env.SECRET_KEY || "default_secret"))
      .digest("hex");

    const qrData = `${urlBase}/tarjeta/${idTarjeta}?token=${token}`;

    // Crear carpeta si no existe
    const outputDir = path.resolve(__dirname, "../qrs");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const qrFilePath = path.join(outputDir, `${idTarjeta}.png`);

    await QRCode.toFile(qrFilePath, qrData, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const qrBase64 = fs.readFileSync(qrFilePath, { encoding: "base64" });
    res.json({
      tarjetaId: idTarjeta,
      qr: `data:image/png;base64,${qrBase64}`,
    });

    // Borrar archivo temporal
    fs.unlink(qrFilePath, () => {});
  } catch (error) {
    console.error(`[crearTarjeta] ${error.name}: ${error.message}`);
    res.status(500).json({
      error: "Error interno del servidor al crear la tarjeta",
      detalles: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
