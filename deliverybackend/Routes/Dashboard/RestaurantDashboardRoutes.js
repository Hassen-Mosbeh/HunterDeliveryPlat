const express = require("express");
const authMiddleware = require("../../Middleware/authMiddleware");
const {
  getDashboard,
} = require("../../Controllers/Restaurant/RestaurantDashboardController");

const router = express.Router();

router.get("/", authMiddleware, getDashboard);

module.exports = router;
