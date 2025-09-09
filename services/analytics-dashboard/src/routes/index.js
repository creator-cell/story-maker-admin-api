import express from 'express';

// Import your individual route modules
import dashboardRoute from './dashboard.route.js';

const router = express.Router();

// Prefix your routes here
router.use('/dashboard', dashboardRoute);

// Health check route
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy 🚀' });
});

export default router;