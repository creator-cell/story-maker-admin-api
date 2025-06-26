const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

const AUTH_SERVICE_PORT = process.env.auth_service_port || 3001;
const USER_SERVICE_PORT = process.env.user_service_port || 3002;
const APP_PORT = process.env.gateway_default_port || 8080

app.use('/auth', createProxyMiddleware({
  target: `http://auth:${AUTH_SERVICE_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/auth': '' },
}));

app.use('/user', createProxyMiddleware({
  target: `http://user:${USER_SERVICE_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/user': '' },
}));

app.listen(APP_PORT, () => {
  console.log(`API Gateway running at http://localhost:${APP_PORT}`);
});
