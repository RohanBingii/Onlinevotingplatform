
const Election = require("../models/election.model");
const { generateKeyPair, decryptVote, splitPrivateKey, reconstructPrivateKey } = require("../security/encryption.service");
const { addAuditEntry } = require("../security/hashChain.service");
const Vote = require("../models/vote.model");


exports.createElection = async (req, res) => {
    try {
        const { title, description, startTime, endTime } = req.body;

        const { publicKey, privateKey } = generateKeyPair();
        const keyShares = splitPrivateKey(privateKey, 5, 3);

        const election = await Election.create({
            title,
            description,
            startTime,
            endTime,
            publicKey
        });

        res.json({ message: "Election created", election, keyShares });

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
        const { shares } = req.body;

        if (!shares || !Array.isArray(shares) || shares.length < 3) {
            return res.status(400).json({ error: "Please provide at least 3 valid key shares to decrypt results." });
        }

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

        let privateKey;
        try {
            privateKey = reconstructPrivateKey(shares);
        } catch (err) {
            return res.status(400).json({ error: "Failed to reconstruct private key. Invalid shares." });
        }

        // 1. Tally the decrypted Candidate IDs
        const rawResults = {};
        for (let vote of votes) {
            try {
                const decrypted = decryptVote(
                    vote.encryptedVote,
                    privateKey
                );
                rawResults[decrypted] = (rawResults[decrypted] || 0) + 1;
            } catch (decErr) {
                console.error("Decryption error for a vote:", decErr.message);
                return res.status(400).json({ error: "Failed to decrypt votes. The key shares provided reconstructed a valid key, but it is the WRONG key for this election." });
            }
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
            "RESULTS_PUBLISHED",
            req.user.id,
            { electionId }
        );

        // Save the decrypted results to the DB so voters can view them
        election.publishedResults = formattedResults;
        await election.save();

        res.json({ results: formattedResults });

    } catch (err) {
        console.log(err)
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

exports.getPublishedResults = async (req, res) => {
    try {
        const { electionId } = req.params;
        const election = await Election.findByPk(electionId, {
            attributes: ['id', 'title', 'status', 'publishedResults']
        });
        if (!election) return res.status(404).json({ error: "Election not found" });
        if (!election.publishedResults) return res.status(404).json({ error: "Results have not been published yet" });
        res.json({ results: election.publishedResults });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};