const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const {
  getMe,
  updateMe,
  changePassword,
  deleteMe,
} = require("../Controllers/UserController");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/change-password", changePassword);
router.delete("/me", deleteMe);

  module.exports = router;
