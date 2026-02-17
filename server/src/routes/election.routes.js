const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/auth.middleware");
const { createElection, closeElection, getResults, getAllElections, getElectionById } = require("../controllers/election.controller");

router.post("/create", authenticate, authorize("admin"), createElection);
router.post("/close/:electionId", authenticate, authorize("admin"), closeElection);
router.get("/results/:electionId", authenticate, authorize("admin"), getResults);
router.get("/", authenticate, getAllElections);
router.get("/:electionId", authenticate, getElectionById);
module.exports = router;