const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { 
    createElection, 
    closeElection, 
    getResults, 
    getAllElections, 
    getElectionById,
    changeElectionTime // Added missing import
} = require("../controllers/election.controller");

router.post("/create", authenticate, authorize("admin"), createElection);
router.post("/close/:electionId", authenticate, authorize("admin"), closeElection);
router.put("/:electionId/time", authenticate, authorize("admin"), changeElectionTime); // Added missing route
router.get("/results/:electionId", authenticate, authorize("admin"), getResults);
router.get("/", authenticate, getAllElections);
router.get("/:electionId", authenticate, getElectionById);

module.exports = router;