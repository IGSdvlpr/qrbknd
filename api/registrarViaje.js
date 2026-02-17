import { getAdmin } from "../lib/firebaseAdmin.js";

const admin = getAdmin();
const db = admin.firestore();

export default async function registrarViaje(req, res) {
  try {
    const { tarjetaId } = req.body;
    if (!tarjetaId) return res.status(400).json({ error: "Falta tarjetaId" });

    const docRef = db.collection("tarjetas").doc(tarjetaId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Tarjeta no encontrada" });

    const data = doc.data();
    const nuevosViajes = data.viajes + 1;
    const viajeGratis = nuevosViajes % 8 === 0;

    // 🔹 Si llega a 8 viajes, marcamos el tiempo de expiración del contador
    if (viajeGratis) {
      const reinicioEn = Date.now() + 7 * 60 * 1000; // 7 minutos desde ahora

      await docRef.update({
        viajes: nuevosViajes,
        reinicioProgramado: reinicioEn, // Guardamos cuándo debe reiniciarse
      });
    } else {
      await docRef.update({ viajes: nuevosViajes });
    }

    // 🔹 Respuesta final (sin alterar tu estructura)
    res.json({
      tarjetaId,
      viajes: nuevosViajes,
      viajeGratis,
    });
  } catch (error) {
    console.error("Error registrarViaje:", error);
    res.status(500).json({ error: error.message });
  }
}
