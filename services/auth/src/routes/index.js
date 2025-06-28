import express from 'express';

// Import your individual route modules
import userRoutes from './user/index.js';
import roleRoutes from './role/index.js';

const router = express.Router();

// Prefix your routes here
router.use('/users', userRoutes);      // /api/users
router.use('/role', roleRoutes)
// Health check route
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy 🚀' });
});

export default router;
