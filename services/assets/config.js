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
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  database: {
    mongoUri: process.env.MONGO_URI,
  }
};

export default config;
