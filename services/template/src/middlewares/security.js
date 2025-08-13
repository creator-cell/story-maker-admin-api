import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

export const securityMiddleware = (app) => {
  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
};
