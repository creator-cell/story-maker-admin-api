// src/docs/swaggerconfig.js
export const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Story-maker',
        version: '1.0.0',
        description: 'Auto-generated Swagger documentation',
      },
      servers: [
        {
          url: 'http://localhost:3000/api',
        },
      ],
    },
    apis: ['./src/routes/**/*.js', './src/controllers/**/*.js'], // paths for JSDoc annotations
  };
  