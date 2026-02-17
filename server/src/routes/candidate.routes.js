const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidate.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Public (Authenticated) Routes
router.get("/election/:electionId", authenticate, candidateController.getCandidatesByElection);
router.get("/", authenticate, candidateController.getAllCandidates);

// Admin Routes
router.post("/", authenticate, authorize("admin"), candidateController.createCandidate);
router.put("/:candidateId", authenticate, authorize("admin"), candidateController.updateCandidate);
router.delete("/:candidateId", authenticate, authorize("admin"), candidateController.deleteCandidate);

module.exports = router;
