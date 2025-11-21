const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

// Basic CORS handling so browsers can call the gateway from the frontend origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

const APP_PORT = process.env.PORT || 2000;
const AUTH_SERVICE_PORT = process.env.AUTH_SERVICE_PORT || 3001;
const USER_SERVICE_PORT = process.env.USER_SERVICE_PORT || 3002;
const DASHBOARD_SERVICE_PORT = process.env.DASHBOARD_SERVICE_PORT || 3003;
const ASSETS_SERVICE_PORT = process.env.ASSETS_SERVICE_PORT || 3004;
const BILLING_SUBSCRIPTION_SERVICE_PORT = process.env.BILLING_SUBSCRIPTION_SERVICE_PORT || 3005;
const CATEGORY_SERVICE_PORT = process.env.CATEGORY_SERVICE_PORT || 3006;
const NOTIFICATION_SERVICE_PORT = process.env.NOTIFICATION_SERVICE_PORT || 3007;
const TEMPLATE_SERVICE_PORT = process.env.TEMPLATE_SERVICE_PORT || 3008;
const TICKET_SUPPORT_SERVICE_PORT = process.env.TICKET_SUPPORT_SERVICE_PORT || 3009;

const HOST_NAME = process.env.HOST || 'localhost';

app.use(
  "/auth",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${AUTH_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);

app.use(
  "/user",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${USER_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/user": "" },
  })
);

app.use(
  "/dashboard",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${DASHBOARD_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/dashboard": "" },
  })
);

app.use(
  "/assets",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${ASSETS_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/assets": "" },
  })
);

app.use(
  "/billing-subscription",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${BILLING_SUBSCRIPTION_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/billing-subscription": "" },
  })
);

app.use(
  "/category",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${CATEGORY_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/category": "" },
  })
);

app.use(
  "/notification",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${NOTIFICATION_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/notification": "" },
  })
);

app.use(
  "/template",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${TEMPLATE_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/template": "" },
  })
);

app.use(
  "/ticket-support",
  createProxyMiddleware({
    target: `http://${HOST_NAME}:${TICKET_SUPPORT_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/ticket-support": "" },
  })
);

app.listen(APP_PORT, () => {
  console.log(`API Gateway running at http://${HOST_NAME}:${APP_PORT}`);
});
