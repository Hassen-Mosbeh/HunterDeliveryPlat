const express = require("express");
const { register, getRestaurantProfile, updateRestaurantProfile } = require("../Controllers/RestoController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.get("/profile", authMiddleware, getRestaurantProfile);
router.put("/profile", authMiddleware, updateRestaurantProfile);

module.exports = router;
