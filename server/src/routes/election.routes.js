const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/auth.middleware");
const { createElection , closeElection , getResults} = require("../controllers/election.controller");

router.post("/create", authenticate, authorize("admin"), createElection);
router.post("/close/:electionId", authenticate, authorize("admin"), closeElection);
router.get("/results/:electionId", authenticate, authorize("admin"), getResults);
module.exports = router;    