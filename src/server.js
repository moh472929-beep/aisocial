import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

import dbInit from "./db/init.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// ✅ تحميل المسارات الديناميكية (تعمل على Render وبيئتك المحلية)
import(apiPathURL("src/api/index.js"))
  .then(({ default: apiRoutes }) => app.use("/api", apiRoutes))
  .catch((err) => logger.error("❌ Failed to load API routes:", err));

// دالة لتوليد المسار الديناميكي
function apiPathURL(relPath) {
  const fullPath = path.join(process.cwd(), relPath);
  return pathToFileURL(fullPath).href;
}

// ✅ قاعدة البيانات
dbInit.initDB()
  .then(() => logger.info("✅ DB initialized and ready"))
  .catch((err) => logger.error("❌ DB init failed:", err));

// ✅ الواجهة الرسومية
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;
