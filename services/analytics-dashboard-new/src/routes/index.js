import express from 'express';

// Import your individual route modules
import dashboardRoute from './dashboard.route.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy 🚀' });
});

// Prefix your routes here
router.use('/', dashboardRoute);

export default router;