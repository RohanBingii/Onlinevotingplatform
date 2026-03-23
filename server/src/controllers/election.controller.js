
const Election = require("../models/election.model");
const { generateKeyPair, decryptVote } = require("../security/encryption.service");
const { addAuditEntry } = require("../security/hashChain.service");
const Vote = require("../models/vote.model");


exports.createElection = async (req, res) => {
    try {
        const { title, description, startTime, endTime } = req.body;

        const { publicKey, privateKey } = generateKeyPair();

        const election = await Election.create({
            title,
            description,
            startTime,
            endTime,
            publicKey,
            privateKey
        });

        res.json({ message: "Election created", election });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.closeElection = async (req, res) => {
    try {
        const { electionId } = req.params;

        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({ error: "Election not found" });
        }

        // Update status AND set endTime to right now
        election.status = "closed";
        election.endTime = new Date(); // <--- ADD THIS LINE
        
        await election.save();

        res.json({ message: "Election closed successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const { Candidate } = require("../models/associations"); // Make sure Candidate is imported at the top

exports.getResults = async (req, res) => {
    try {
        const { electionId } = req.params;

        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({ error: "Election not found" });
        }

        if (election.status !== "closed") {
            return res.status(400).json({ error: "Election is not closed yet" });
        }

        const votes = await Vote.findAll({
            where: { electionId }
        });

        // 1. Tally the decrypted Candidate IDs
        const rawResults = {};
        for (let vote of votes) {
            const decrypted = decryptVote(
                vote.encryptedVote,
                election.privateKey
            );
            rawResults[decrypted] = (rawResults[decrypted] || 0) + 1;
        }

        // 2. Fetch Candidates and map the results to their names
        const candidates = await Candidate.findAll({
            where: { electionId }
        });

        const formattedResults = candidates.map(candidate => {
            return {
                id: candidate.id,
                name: candidate.name,
                party: candidate.party,
                totalVotes: rawResults[candidate.id.toString()] || 0
            };
        });

        await addAuditEntry(
            "RESULTS_VIEWED",
            req.user.id,
            { electionId }
        );

        res.json({ results: formattedResults });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.changeElectionTime = async (req, res) => {
    try {
        const { electionId } = req.params;
        const { startTime, endTime } = req.body;

        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({ error: "Election not found" });
        }

        election.startTime = startTime;
        election.endTime = endTime;
        await election.save();

        res.json({ message: "Election time changed successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllElections = async (req, res) => {
    try {
        const elections = await Election.findAll({
            attributes: { exclude: ['privateKey'] }
        });
        res.json({ elections });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getElectionById = async (req, res) => {
    try {
        const { electionId } = req.params;
        const election = await Election.findOne({
            where: { id: electionId },
            attributes: { exclude: ['privateKey'] }
        });

        if (!election) {
            return res.status(404).json({ error: "Election not found" });
        }
        res.json({ election });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};