import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'ar'],
    backend: {
      loadPath: path.join(process.cwd(), 'src', 'i18n', 'locales', '{{lng}}.json'),
    },
    detection: {
      order: ['querystring', 'cookie'],
      caches: ['cookie'],
    },
    debug: false,
  });

export default i18next;
