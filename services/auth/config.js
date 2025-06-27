import dotenv from 'dotenv';
dotenv.config();

const config = {
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port:  process.env.SMTP_PORT,
     
      auth: {
        user:  process.env.SMTP_USERNAME,
        pass:  process.env.SMTP_PASSWORD,
      },
    },
    from:  process.env.EMAIL_FROM,
  },
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  database: {
    mongoUri: process.env.MONGO_URI,
  }
};

export default config;
