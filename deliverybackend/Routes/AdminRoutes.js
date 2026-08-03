const express = require('express');
const { getDrivers, getOrders, assignDriver, getDriverById, getOrderById, getDashboard } = require('../Controllers/AdminController');
const authMiddleware = require('../Middleware/authMiddleware');
const { authorizeRoles } = require('../Middleware/Authorize');
const { Roles } = require('../utils/enums');

const router = express.Router();

router.use(authMiddleware, authorizeRoles(Roles.ADMIN));

router.get('/drivers', getDrivers);
router.get('/drivers/:driverId', getDriverById);
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderById);
router.patch('/orders/:orderId/assign-driver', assignDriver);
router.get('/dashboard', getDashboard);

module.exports = router;
