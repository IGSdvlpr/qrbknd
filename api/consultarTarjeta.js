import admin from "../lib/firebaseAdmin.js";
const db = admin.firestore();

export default async function consultarTarjeta(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Falta id de la tarjeta" });

    const doc = await db.collection("tarjetas").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Tarjeta no encontrada" });

    const data = doc.data();
    const viajeGratisProximo = (data.viajes + 1) % 8 === 0;

    res.json({
      tarjetaId: id,
      viajes: data.viajes,
      viajeGratisProximo,
    });
  
  } catch (error) {
    console.error("Error consultarTarjeta:", error);
    res.status(500).json({ error: error.message });
  }
}
