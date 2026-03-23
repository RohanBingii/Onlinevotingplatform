const express = require("express");
const router = express.Router();
const { checkIntegrity, verifyElection } = require("../controllers/audit.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.get("/verify", authenticate, authorize("admin"), checkIntegrity);
router.get("/election/:id/verify", authenticate, authorize("admin"), verifyElection);

module.exports = router;
