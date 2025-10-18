import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { connectDB } from "./db/init.js";
import apiRoutes from "./api/index.js";
import { logger } from "./utils/logger.js";

dotenv.config();

// إعدادات المسارات للنظام (عشان نعرف مجلد المشروع الحالي)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// إنشاء تطبيق Express
const app = express();

// ميدل ويرز
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// الاتصال بقاعدة البيانات
connectDB()
  .then(() => logger.info("✅ Connected to MongoDB Atlas"))
  .catch((err) => logger.error("❌ MongoDB connection failed:", err));

// ربط مسارات الـ API
app.use("/api", apiRoutes);

// خدمة الملفات الثابتة (واجهة المستخدم)
app.use(express.static(path.join(__dirname, "../public")));

// أي طلب غير معرف → رجّع ملف index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// تحديد المنفذ
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;
