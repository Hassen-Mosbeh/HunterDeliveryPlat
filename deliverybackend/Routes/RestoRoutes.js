const express = require("express");
const { register, getRestaurantProfile, updateRestaurantProfile, toggleAvailability, getAvailabilityStatus } = require("../Controllers/Restaurant/RestoController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.get("/profile", authMiddleware, getRestaurantProfile);
router.put("/profile", authMiddleware, updateRestaurantProfile);

router.get("/availability", authMiddleware, getAvailabilityStatus);
router.patch("/availability", authMiddleware, toggleAvailability);

module.exports = router;
