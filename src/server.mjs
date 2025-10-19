import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

import dbInit from "./db/init.js";
import { logger } from "./utils/logger.mjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

import(apiPathURL("src/api/index.mjs"))
  .then(({ default: apiRoutes }) => app.use("/api", apiRoutes))
  .catch((err) => logger.error("❌ Failed to load API routes:", err));

function apiPathURL(relPath) {
  const fullPath = path.join(process.cwd(), relPath);
  return pathToFileURL(fullPath).href;
}

dbInit.initDB()
  .then(() => logger.info("✅ DB initialized and ready"))
  .catch((err) => logger.error("❌ DB init failed:", err));

app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;
