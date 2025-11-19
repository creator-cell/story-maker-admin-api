const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

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


app.use(
  "/auth",
  createProxyMiddleware({
    target: `http://localhost:${AUTH_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);

app.use(
  "/user",
  createProxyMiddleware({
    target: `http://localhost:${USER_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/user": "" },
  })
);

app.use(
  "/dashboard",
  createProxyMiddleware({
    target: `http://localhost:${DASHBOARD_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/dashboard": "" },
  })
);

app.use(
  "/assets",
  createProxyMiddleware({
    target: `http://localhost:${ASSETS_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/assets": "" },
  })
);

app.use(
  "/billing-subscription",
  createProxyMiddleware({
    target: `http://localhost:${BILLING_SUBSCRIPTION_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/billing-subscription": "" },
  })
);

app.use(
  "/category",
  createProxyMiddleware({
    target: `http://localhost:${CATEGORY_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/category": "" },
  })
);

app.use(
  "/notification",
  createProxyMiddleware({
    target: `http://localhost:${NOTIFICATION_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/notification": "" },
  })
);

app.use(
  "/template",
  createProxyMiddleware({
    target: `http://localhost:${TEMPLATE_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/template": "" },
  })
);

app.use(
  "/ticket-support",
  createProxyMiddleware({
    target: `http://localhost:${TICKET_SUPPORT_SERVICE_PORT}`,
    changeOrigin: true,
    pathRewrite: { "^/ticket-support": "" },
  })
);

app.listen(APP_PORT, () => {
  console.log(`API Gateway running at http://localhost:${APP_PORT}`);
});
