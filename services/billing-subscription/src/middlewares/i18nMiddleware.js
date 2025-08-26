import i18next from '../i18n/index.js';
import middleware from 'i18next-http-middleware';

const i18nMiddleware = middleware.handle(i18next);

export default i18nMiddleware;
