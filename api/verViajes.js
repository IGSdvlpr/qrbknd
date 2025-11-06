import fs from "fs";
import path from "path";
import admin from "../lib/firebaseAdmin.js";

export default async function verViajes(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("Falta el parámetro ID de la tarjeta.");
  }

  // 🔹 Determinar URL base según entorno
  const urlBase =
    process.env.NODE_ENV === "production"
      ? process.env.PROD_URL_BASE
      : process.env.DEV_URL_BASE;

  try {
    const docRef = admin.firestore().collection("tarjetas").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).send("Tarjeta no encontrada.");
    }

    const data = docSnap.data();
    let viajes = data.viajes || 0;
    let viajesGratis = data.viajesGratis || 0;
    let ultimoGratis = data.ultimoGratis || null;
    const ahora = Date.now();

    // ✅ Verificación automática del reinicio de viajes
    // Si ya pasó el tiempo programado, reiniciamos el contador
    if (data.reinicioProgramado && ahora >= data.reinicioProgramado) {
      await docRef.update({
        viajes: 0,
        reinicioProgramado: admin.firestore.FieldValue.delete(), // eliminar el campo
      });
      viajes = 0; // actualizamos la variable local para reflejar el cambio
      console.log(`🔄 Contador reiniciado automáticamente para tarjeta ${id}`);
    }

    // 🔹 Lógica de mensajes de viaje gratis (la mantenemos igual)
    let mensaje = "";

    if (viajes % 8 === 0 && viajes !== 0) {
      if (ultimoGratis && ahora - ultimoGratis < 15 * 60 * 1000) {
        mensaje = `<div class="mensaje gratis">🎉 ¡Este viaje tiene un descuento de $2000! 🎉</div>`;
      } else {
        await docRef.update({
          ultimoGratis: ahora,
          viajesGratis: viajesGratis + 1,
        });

        mensaje = `<div class="mensaje gratis">🎉 ¡Este viaje tiene un descuento de $2000! 🎉</div>`;
      }
    } else if (viajes % 8 === 7) {
      mensaje = `<div class="mensaje proximo">✨ ¡Tu próximo viaje tendrá un descuento de $2000! ✨</div>`;
    }

    // 🔹 Cargar plantilla HTML
    const templatePath = path.resolve("api/templates/tarjeta.html");
    let html = fs.readFileSync(templatePath, "utf8");

    // 🔹 Reemplazar variables en la plantilla
    html = html
      .replace("{{viajes}}", viajes)
      .replace("{{mensaje}}", mensaje)
      .replace("{{viajesGratis}}", viajesGratis)
      .replace("{{logo}}", `${urlBase}/public/logo1.png`); // ruta absoluta del logo

    res.send(html);
  } catch (error) {
    console.error("Error en verViajes:", error);
    res.status(500).send("Error interno del servidor.");
  }
}
