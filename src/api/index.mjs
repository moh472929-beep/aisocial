import express from "express";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const router = express.Router();

// دالة لتحميل الراوترات من المسار الصحيح ديناميكياً
async function loadRoute(relativePath) {
  try {
    const fullPath = path.join(__dirname, relativePath);
    const moduleURL = pathToFileURL(fullPath).href;
    const module = await import(moduleURL);
    return module.default || module;
  } catch (error) {
    console.error(`❌ Error loading route ${relativePath}:`, error);
    throw error;
  }
}

// Initialize routes with proper error handling and logging
async function initializeRoutes() {
  try {
    console.log("🔄 Initializing API routes...");

    // Load CommonJS modules using createRequire
    const authRoutes = require("./auth.js");
    const userRoutes = require("./users.js");
    const facebookRoutes = require("./facebook-automation.js");
    const aiRoutes = require("./ai.js");
    const analyticsRoutes = require("./analytics.js");
    const autoResponseRoutes = require("./autoResponseController.js");

    // Verify routes are loaded correctly
    if (!authRoutes) throw new Error("Auth routes failed to load");
    if (!userRoutes) throw new Error("User routes failed to load");
    if (!facebookRoutes) throw new Error("Facebook routes failed to load");
    if (!aiRoutes) throw new Error("AI routes failed to load");
    if (!analyticsRoutes) throw new Error("Analytics routes failed to load");
    if (!autoResponseRoutes) throw new Error("AutoResponse routes failed to load");

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
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        routes: [
          "/auth (login, register, profile)",
          "/users",
          "/facebook",
          "/ai",
          "/analytics",
          "/autoresponse",
        ],
      });
    });

    // Add health check endpoint
    router.get("/health", (req, res) => {
      res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    console.log("✅ All API routes initialized successfully");
    console.log("📋 Available routes: /auth, /users, /facebook, /ai, /analytics, /autoresponse");
    
  } catch (error) {
    console.error("❌ Critical error initializing API routes:", error);
    throw error; // Re-throw to prevent silent failures
  }
}

// استدعاء التهيئة مع معالجة الأخطاء
try {
  await initializeRoutes();
} catch (error) {
  console.error("💥 Failed to initialize API routes:", error);
  process.exit(1); // Exit if routes can't be loaded
}

export default router;
