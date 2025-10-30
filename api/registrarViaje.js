import admin from "../lib/firebaseAdmin.js";
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

    await docRef.update({ viajes: nuevosViajes });

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
