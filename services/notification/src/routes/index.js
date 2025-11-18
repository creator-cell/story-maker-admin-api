import express from 'express';

// Import your individual route modules
import notificationRoute from './notification.route.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy 🚀' });
});

// Prefix your routes here
router.use('/', notificationRoute);

export default router;