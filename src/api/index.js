import express from "express";

// استيراد جميع المسارات الفرعية
import authRoutes from "./auth/index.js";
import userRoutes from "./users/index.js";
import facebookRoutes from "./facebook/index.js";
import aiRoutes from "./ai/index.js";
import analyticsRoutes from "./analytics/index.js";
import autoResponseRoutes from "./autoresponse/index.js";

const router = express.Router();

// ربط كل مجموعة راوتر بمسارها الأساسي
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/facebook", facebookRoutes);
router.use("/ai", aiRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/autoresponse", autoResponseRoutes);

// مسار تجريبي للتأكد من عمل الـ API
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Facebook AI Manager API is running 🚀",
    routes: ["/auth", "/users", "/facebook", "/ai", "/analytics", "/autoresponse"]
  });
});

export default router;
