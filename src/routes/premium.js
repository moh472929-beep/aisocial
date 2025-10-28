/**
 * Premium routes handler
 * Serves protected premium content through authentication
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve premium pages from public directory but through authentication
router.get('/ai-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/ai-dashboard.html'));
});

// Add other premium pages here
router.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/analytics.html'));
});

router.get('/integrations', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/integrations.html'));
});

// Catch-all for any other premium routes
router.get('*', (req, res) => {
  // If no specific premium page is found, redirect to main premium dashboard
  res.redirect('/premium/ai-dashboard');
});

export default router;