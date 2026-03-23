const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfile } = require("../controllers/auth.controller");

const { authenticate } = require("../middleware/auth.middleware");
router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getProfile);
router.put("/profile/update", authenticate, updateProfile);

module.exports = router;
