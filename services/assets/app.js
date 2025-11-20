import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import i18nMiddleware from './src/middlewares/i18nMiddleware.js';
import authMiddleware from './src/middlewares/auth.js';
import routes from './src/routes/index.js';
import { connectDB } from './src/lib/db.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const app = express();

// i18n middleware
app.use(i18nMiddleware);

// Static Files

// Middlewares
// Middlewares
app.use(helmet());

app.use(
  cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*"
  })
);

console.log(path.join(__dirname, 'uploads','assets'));
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);


app.get('/me', authMiddleware, (req, res) => {
  const { userId, role, rolePermissions } = req.user;
  res.json({ userId, role, rolePermissions });
});

// DB Connection
connectDB();

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

export default app;
