const express = require("express");
const { register, getAvailableDeliveries, getCurrentDeliveries, updateDeliveryStatus, getDeliveryHistory } = require("../Controllers/DriverController");
const authMiddleware = require("../Middleware/authMiddleware");
const { authorizeRoles } = require("../Middleware/Authorize");
const { Roles } = require("../utils/enums");

const router = express.Router();

router.post("/register", register);

router.get("/available-deliveries", authMiddleware, authorizeRoles(Roles.DRIVER), getAvailableDeliveries);
router.get("/current-deliveries", authMiddleware, authorizeRoles(Roles.DRIVER), getCurrentDeliveries);
router.patch("/orders/:orderId/status", authMiddleware, authorizeRoles(Roles.DRIVER), updateDeliveryStatus);
router.get("/delivery-history", authMiddleware, authorizeRoles(Roles.DRIVER), getDeliveryHistory);

module.exports = router;
