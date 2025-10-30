import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { initDB, getModel } from "./db/init.js";
import { logger } from "./utils/logger.mjs";
import { errorHandler, notFoundHandler, logger as errorLogger } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enhanced CORS configuration for production and development
const parseOrigins = () => {
  const envList = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Get the current deployment URL from Render environment variables
  const renderUrl = process.env.RENDER_EXTERNAL_URL || process.env.BASE_URL;
  
  const prodDefaults = [
    renderUrl,
    "https://aisocial-aahn.onrender.com", // Fallback for the known Render URL
  ].filter(Boolean);

  const devDefaults = [
    "http://localhost:3000",
    "http://localhost:10000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:10000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
  ];

  const base = process.env.NODE_ENV === "production" ? prodDefaults : devDefaults;
  const origins = Array.from(new Set([...envList, ...base]));
  
  logger.info(`CORS: Configured allowed origins: ${JSON.stringify(origins)}`);
  return origins;
};

const allowedOrigins = parseOrigins();

const corsOptions = {
  origin(origin, callback) {
    // Log the incoming origin for debugging
    logger.info(`CORS: Request from origin: ${origin || 'no-origin'}`);
    
    // Allow requests with no origin (same-origin requests, mobile apps, curl, server-side)
    if (!origin) {
      logger.info('CORS: Allowing request with no origin (same-origin or server-side)');
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      logger.info(`CORS: Allowing origin ${origin} (found in allowed list)`);
      return callback(null, true);
    }

    // Additional check for Render deployment URL variations
    const renderUrl = process.env.RENDER_EXTERNAL_URL || process.env.BASE_URL;
    if (renderUrl && origin === renderUrl) {
      logger.info(`CORS: Allowing origin ${origin} (matches Render URL)`);
      return callback(null, true);
    }

    // Check for same-origin requests on production domain
    if (process.env.NODE_ENV === "production" && origin === "https://aisocial-aahn.onrender.com") {
      logger.info(`CORS: Allowing production domain ${origin}`);
      return callback(null, true);
    }

    logger.warn(`CORS: Blocked origin ${origin}. Allowed origins: ${JSON.stringify(allowedOrigins)}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  optionsSuccessStatus: 204, // Use 204 for preflight compatibility
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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

// Enhanced logging for debugging ERR_ABORTED issues
app.use((req, res, next) => {
  logger.info(`📥 ${req.method} ${req.url} - User-Agent: ${req.get('User-Agent')}`);
  
  // Log response completion
  res.on('finish', () => {
    logger.info(`📤 ${req.method} ${req.url} - Status: ${res.statusCode} - Size: ${res.get('Content-Length') || 'unknown'}`);
  });
  
  // Log response errors
  res.on('error', (err) => {
    logger.error(`❌ Response error for ${req.method} ${req.url}:`, err);
  });
  
  next();
});

// Rewrite Netlify Functions path to standard /api
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }
  next();
});

// Initialize DB once and create a readiness promise
const dbReady = initDB();

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

// Import our RBAC middleware
import { verifyAuthAndRole } from './middleware/verifyAuthAndRole.js';
import premiumRoutes from './routes/premium.js';

// Serve premium pages; frontend enforces session & role
app.use('/premium', premiumRoutes);
// Protect API routes with RBAC
app.use('/api/ai', verifyAuthAndRole);
app.use('/api/facebook', verifyAuthAndRole);
app.use('/api/analytics', verifyAuthAndRole);

// Serve static files BEFORE catch-all route, but AFTER protected routes
// This ensures public files are still accessible directly
app.use((req, res, next) => {
  // Block direct access to premium HTML pages
  const premiumPages = ['ai-dashboard.html', 'analytics.html', 'integrations.html'];
  const requestPath = req.path.split('/').pop();
  
  if (premiumPages.includes(requestPath)) {
    // Redirect to the protected route
    return res.redirect(`/premium/${requestPath.replace('.html', '')}`);
  }
  
  next();
});

app.use(express.static(path.join(__dirname, "../public"), {
  setHeaders: (res, filePath) => {
    // Set proper MIME types for HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    // Add cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

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
