const Election = require("../models/election.model");
const { generateKeyPair } = require("../security/encryption.service");
const { decryptVote } = require("../security/encryption.service");
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
        
        election.status = "closed";
        await election.save();

        res.json({ message: "Election closed successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getResults = async (req, res) => {
    try {
        const { electionId } = req.params;

        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({ error: "Election not found" });
        }

        if (election.status !== "closed") {
            return res.status(400).json({
                error: "Election is not closed yet"
            });
        }

        // if (new Date() < election.endTime) {
        //     return res.status(400).json({
        //         error: "Election time not completed"
        //     });
        // }

        const votes = await Vote.findAll({
            where: { electionId }
        });

        const results = {};

        for (let vote of votes) {
            const decrypted = decryptVote(
                vote.encryptedVote,
                election.privateKey
            );

            results[decrypted] = (results[decrypted] || 0) + 1;
        }

        await addAuditEntry(
            "RESULTS_VIEWED",
            req.user.id,
            { electionId }
        );

        res.json({ results });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
