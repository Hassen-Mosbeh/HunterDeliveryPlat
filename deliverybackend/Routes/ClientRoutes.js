const express = require("express");
const {
  register,
  getRestaurants,
  getRestaurantProducts,
  getRestaurantById,
  createOrder,
} = require("../Controllers/ClientController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.get("/restaurants", authMiddleware, getRestaurants);
router.get("/restaurants/:id", authMiddleware, getRestaurantById);
router.get("/restaurants/:restaurantId/products", authMiddleware, getRestaurantProducts);
router.post("/orders", authMiddleware, createOrder);

module.exports = router;
  