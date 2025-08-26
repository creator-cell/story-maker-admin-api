import express from 'express';

// Import your individual route modules
import planRoutes from './plan.route.js';

const router = express.Router();

// Prefix your routes here
router.use('/plan',planRoutes);
// Health check route
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy 🚀' });
});

export default router;