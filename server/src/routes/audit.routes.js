const express = require("express");
const router = express.Router();
const { checkIntegrity } = require("../controllers/audit.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/auth.middleware");

router.get(
    "/verify",
    authenticate,
    authorize("admin"),
    checkIntegrity
);

module.exports = router;
