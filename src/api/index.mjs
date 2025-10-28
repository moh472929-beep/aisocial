import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { logger } from "../utils/logger.mjs";

// Import all route modules
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import facebookRoutes from "./facebook-automation.js";
import aiRoutes from "./ai.js";
import analyticsRoutes from "./analytics.js";
import autoResponseRoutes from "./autoResponseController.js";
import paymentRoutes from "./payment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize routes with proper error handling and logging
async function initializeRoutes() {
  try {
    console.log("🔄 Initializing API routes...");

    // Verify routes are loaded correctly
    if (!authRoutes) throw new Error("Auth routes failed to load");
    if (!userRoutes) throw new Error("User routes failed to load");
    if (!facebookRoutes) throw new Error("Facebook routes failed to load");
    if (!aiRoutes) throw new Error("AI routes failed to load");
    if (!analyticsRoutes) throw new Error("Analytics routes failed to load");
    if (!autoResponseRoutes) throw new Error("AutoResponse routes failed to load");
    if (!paymentRoutes) throw new Error("Payment routes failed to load");

    // ربط الراوترات بالمسارات الخاصة بها
    router.use("/auth", authRoutes);
    router.use("/users", userRoutes);
    router.use("/facebook", facebookRoutes);
    router.use("/ai", aiRoutes);
    router.use("/analytics", analyticsRoutes);
    router.use("/autoresponse", autoResponseRoutes);
    router.use("/payment", paymentRoutes);

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
          "/payment (process, subscription)",
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
    console.log("📋 Available routes: /auth, /users, /facebook, /ai, /analytics, /autoresponse, /payment");
    
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
