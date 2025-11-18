import express from "express";

// Import your individual route modules
import userRoutes from "./user/index.js";
import roleRoutes from "./role/index.js";
import ticketRoutes from "./ticket/index.js";
const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is healthy 🚀" });
});

// Prefix your routes here
router.use("/", ticketRoutes);

export default router;
