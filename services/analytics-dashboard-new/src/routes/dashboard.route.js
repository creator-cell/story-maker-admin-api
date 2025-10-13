import express from "express";

import {
    awsStorages,
    dashboardData,
    topTemplateAssets,
    userGrowthData     
} from "../controller/dashboard.controller.js";

const dashboardRoute = express.Router();

dashboardRoute.get('/', dashboardData);

dashboardRoute.get('/user-growth', userGrowthData);

dashboardRoute.get('/storage', awsStorages);

dashboardRoute.get('/top', topTemplateAssets);

export default dashboardRoute;