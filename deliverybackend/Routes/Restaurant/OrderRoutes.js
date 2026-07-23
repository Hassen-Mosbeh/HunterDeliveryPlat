const express = require("express");
const authMiddleware = require("../../Middleware/authMiddleware");
const {
  getRestaurantOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
} = require("../../Controllers/Restaurant/OrderController");

const router = express.Router();

router.get("/", authMiddleware, getRestaurantOrders);
router.get("/:id", authMiddleware, getOrderById);
router.patch("/:id/accept", authMiddleware, acceptOrder);
router.patch("/:id/reject", authMiddleware, rejectOrder);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;
