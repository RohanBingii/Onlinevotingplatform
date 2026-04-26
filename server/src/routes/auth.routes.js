const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfile, verifyEmail } = require("../controllers/auth.controller");

const { authenticate } = require("../middleware/auth.middleware");

// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.get("/me", authenticate, getProfile);
router.put("/profile/update", authenticate, updateProfile);

module.exports = router;
