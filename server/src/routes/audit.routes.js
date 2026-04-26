const express = require("express");
const router = express.Router();
const { checkIntegrity, verifyElection, getLogs } = require("../controllers/audit.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.get("/logs", authenticate, authorize("admin"), getLogs);
router.get("/verify", authenticate, authorize("admin"), checkIntegrity);
router.get("/election/:id/verify", authenticate, verifyElection);

module.exports = router;
