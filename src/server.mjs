import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import dbInit from "./db/init.js";
import { logger } from "./utils/logger.mjs";
import errorModule from "./middleware/errorHandler.js";
const { errorHandler, notFoundHandler } = errorModule;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.render.com"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rewrite Netlify Functions path to standard /api
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }
  next();
});

// Initialize DB once and create a readiness promise
const dbReady = dbInit.initDB();

// Guard /api requests until DB and models are ready
app.use('/api', async (req, res, next) => {
  try {
    await dbReady;
    return next();
  } catch (err) {
    logger.error("❌ DB init failed; responding 503", err);
    return res.status(503).json({
      success: false,
      message: 'Service Unavailable',
      error: 'Database initialization failed',
    });
  }
});

// Mount API routes eagerly; guarded by the middleware above
// apiPathURL removed (unused)

import apiRoutes from "./api/index.mjs";

app.use("/api", apiRoutes);

// Serve static files BEFORE catch-all route
app.use(express.static(path.join(__dirname, "../public")));

// 404 handler for API routes must come AFTER apiRoutes
app.use('/api', notFoundHandler);

// Move catch-all after API routes to avoid intercepting /api (should be LAST)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Log DB readiness
dbReady
  .then(() => {
    logger.info("✅ DB initialized and ready");
  })
  .catch((err) => logger.error("❌ DB init failed:", err));

// Error handling middleware
app.use(errorHandler);

// catch-all moved after apiRoutes to prevent intercepting /api

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;

// Removed unused apiPathURL helper
