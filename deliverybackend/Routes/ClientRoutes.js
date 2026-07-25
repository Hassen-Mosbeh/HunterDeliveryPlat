const express = require("express");
const {
  register,
  getRestaurants,
  getRestaurantProducts,
} = require("../Controllers/ClientController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.get("/restaurants", authMiddleware, getRestaurants);
router.get("/restaurants/:restaurantId/products", authMiddleware, getRestaurantProducts);

module.exports = router;
