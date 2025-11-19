import express from "express";

// Import your individual route modules
import templateRoutes from "./template/index.js";
const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is healthy 🚀" });
});

router.use("/", templateRoutes);

export default router;
