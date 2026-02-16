const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { setupMFA } = require("../controllers/mfa.controller");
const { enableMFA } = require("../controllers/mfa.controller");
const { verifyLoginMFA } = require("../controllers/mfa.controller");

router.post("/setup", authenticate, setupMFA);
router.post("/enable", authenticate, enableMFA);
router.post("/verify", verifyLoginMFA);
module.exports = router;