import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

import dbInit from "./db/init.js";
import { logger } from "./utils/logger.mjs";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(helmet());
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
function apiPathURL(relPath) {
  const fullPath = path.join(process.cwd(), relPath);
  return pathToFileURL(fullPath).href;
}

import(apiPathURL("src/api/index.mjs"))
  .then(({ default: apiRoutes }) => {
    app.use("/api", apiRoutes);
    // 404 handler for API routes must come AFTER apiRoutes
    app.use('/api', notFoundHandler);
    // Move catch-all after API routes to avoid intercepting /api
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../public", "index.html"));
    });
  })
  .catch((err) => logger.error("❌ Failed to load API routes:", err));

// Log DB readiness
dbReady
  .then(() => {
    logger.info("✅ DB initialized and ready");
  })
  .catch((err) => logger.error("❌ DB init failed:", err));

app.use(express.static(path.join(__dirname, "../public")));

// Error handling middleware
app.use(errorHandler);

// catch-all moved after apiRoutes to prevent intercepting /api

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;
