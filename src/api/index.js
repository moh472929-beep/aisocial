import express from "express";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const router = express.Router();

// دالة لتحميل الراوترات من المسار الصحيح ديناميكياً
async function loadRoute(relativePath) {
  const fullPath = path.join(__dirname, relativePath);
  const moduleURL = pathToFileURL(fullPath).href;
  const module = await import(moduleURL);
  return module.default || module;
}

async function initializeRoutes() {
  try {
    const authRoutes = await loadRoute("./auth.js");
    const userRoutes = await loadRoute("./users.js");
    const facebookRoutes = await loadRoute("./facebook-automation.js");
    const aiRoutes = await loadRoute("./ai.js");
    const analyticsRoutes = await loadRoute("./analytics.js");
    const autoResponseRoutes = await loadRoute("./autoResponseController.js");

    // ربط الراوترات بالمسارات الخاصة بها
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
        message: "✅ Facebook AI Manager API is running 🚀",
        routes: [
          "/auth",
          "/users",
          "/facebook",
          "/ai",
          "/analytics",
          "/autoresponse",
        ],
      });
    });

    console.log("✅ All API routes initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing API routes:", error);
  }
}

// استدعاء التهيئة
await initializeRoutes();

export default router;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
