import express from 'express';

// Import your individual route modules
import assetsRoutes from './assets.route.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy 🚀' });
});

// Prefix your routes here
router.use('/',assetsRoutes);

export default router;