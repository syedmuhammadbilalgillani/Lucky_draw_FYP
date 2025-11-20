// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import drawRoutes from "./src/routes/drawRoutes.js";
import logger from "./src/lib/logger.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ------------------------
   Core Middlewares
------------------------ */

// Enable CORS
app.use(cors());

// JSON parser
app.use(express.json({ limit: "2mb" }));

// URL-encoded parser
app.use(express.urlencoded({ extended: true }));

// Request log
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
  logger.info(`${res.statusCode} ${res}`);
});

// Optional: JWT extractor middleware (safe, doesn't validate)
app.use((req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    req.token = header.split(" ")[1];
  }
  next();
});

/* ------------------------
   Routes
------------------------ */

app.use("/api/auth", authRoutes);
app.use("/api/draws", drawRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ------------------------
   Error Handler
------------------------ */

app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
});

/* ------------------------
   Start Server
------------------------ */

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
app.get("/", (req, res) => {
  res.send("Server is running");
});
