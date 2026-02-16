const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { castVote } = require("../controllers/vote.controller");

router.post("/cast", authenticate, authorize("voter"), castVote);
module.exports = router;
