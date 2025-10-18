import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { initDB } from "./db/init.js";
import apiRoutes from "./api/index.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// الاتصال بقاعدة البيانات
initDB()
  .then(() => logger.info("✅ DB initialized and ready"))
  .catch((err) => logger.error("❌ DB init failed:", err));

// ربط API
app.use("/api", apiRoutes);

// ربط واجهة المستخدم من مجلد public
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// المنفذ
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;

