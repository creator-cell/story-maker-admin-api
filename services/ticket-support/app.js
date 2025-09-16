import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import i18nMiddleware from "./src/middlewares/i18nMiddleware.js";
import authMiddleware from "./src/middlewares/auth.js";
import routes from "./src/routes/index.js";
import { connectDB } from "./src/lib/db.js";

dotenv.config({ path: ".env.local" });

const app = express();

// i18n middleware
app.use(i18nMiddleware);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "services/ticket-support/uploads"))
);

// Routes
app.use("/", routes);

app.get("/me", authMiddleware, (req, res) => {
  const { userId, role, rolePermissions } = req.user;
  res.json({ userId, role, rolePermissions });
});

// DB Connection
connectDB();

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

export default app;
