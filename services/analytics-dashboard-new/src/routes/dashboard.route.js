import express from "express";

import {
  awsStorages,
  dashboardData,
  topTemplateAssets,
  userGrowthData,
  templateCreated,
  templateUsed,
  assetsCreated,
} from "../controller/dashboard.controller.js";

const dashboardRoute = express.Router();

dashboardRoute.get("/", dashboardData);

dashboardRoute.get("/templateCount", templateCreated);

dashboardRoute.get("/templateUsed", templateUsed);

dashboardRoute.get("/user-growth", userGrowthData);

dashboardRoute.get("/storage", awsStorages);

dashboardRoute.get("/top", topTemplateAssets);

dashboardRoute.get("/assets", assetsCreated);

export default dashboardRoute;
