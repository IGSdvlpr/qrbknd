import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet"; // 🔒 Seguridad HTTP
import path from "path";
import { fileURLToPath } from "url";

// Endpoints
import crearTarjeta from "./api/crearTarjeta.js";
import consultarTarjeta from "./api/consultarTarjeta.js";
import registrarViaje from "./api/registrarViaje.js";
import verViajes from "./api/verViajes.js";

// Configuración base
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧩 Middleware de seguridad y CORS
app.use(helmet({
  crossOriginResourcePolicy: false, // permite servir imágenes QR sin bloqueo
}));

// 🔐 Configuración de CORS flexible según entorno
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"];
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
}));

// 📦 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🖼️ Servir imágenes y archivos estáticos
app.use("/qrs", express.static(path.join(__dirname, "qrs")));
app.use("/public", express.static(path.join(__dirname, "public")));

// 🧭 Endpoints privados (app del conductor)
app.post("/api/crearTarjeta", crearTarjeta);
app.get("/api/consultarTarjeta", consultarTarjeta);
app.post("/api/registrarViaje", registrarViaje);

// 🌍 Endpoint público (para escaneo QR)
app.get("/tarjeta/:id", verViajes);

// 🚨 Manejo global de errores (evita que el servidor caiga)
app.use((err, req, res, next) => {
  console.error("🔥 Error interno:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ⚙️ Puerto y entorno
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

// 🚀 Inicio del servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor (${ENV}) corriendo en http://localhost:${PORT}`);
  if (ENV === "production") {
    console.log("🔒 Modo producción: Helmet y CORS activos");
  } else {
    console.log("⚙️ Modo desarrollo: puedes probar desde Postman o Android app");
  }
});
