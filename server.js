import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import crearTarjeta from "./api/crearTarjeta.js";
import consultarTarjeta from "./api/consultarTarjeta.js";
import registrarViaje from "./api/registrarViaje.js";
import verViajes from "./api/verViajes.js";

// Configuración de variables de entorno
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: false, // necesario si sirves archivos
  })
);

// Configuración dinámica de CORS
const allowedOrigins =
  process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://192.168.1.19:3000",
  ];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de archivos estáticos (no persistentes en Vercel)
app.use("/qrs", express.static(path.join(__dirname, "qrs")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Endpoints principales
app.post("/api/crearTarjeta", crearTarjeta);
app.get("/api/consultarTarjeta", consultarTarjeta);
app.post("/api/registrarViaje", registrarViaje);
//app.get("/tarjeta/:id", verViajes);
app.get("/t/:id", verViajes)

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("🔥 Error interno:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// --------------------
// 🚀 Modo desarrollo
// --------------------
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log(`✅ Servidor local corriendo en http://localhost:${PORT}`)
  );
}

// Exportar para Vercel
export default app;
