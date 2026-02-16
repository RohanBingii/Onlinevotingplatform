const sequelize = require("../config/database");
const Vote = require("../models/vote.model");
const Election = require("../models/election.model");
const { encryptVote } = require("../security/encryption.service");
const { addAuditEntry } = require("../security/hashChain.service");
const { decryptVote } = require("../security/encryption.service");



exports.castVote = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { electionId, voteChoice } = req.body;

        const election = await Election.findByPk(electionId);
        if (!election) {
            await transaction.rollback();
            return res.status(404).json({ error: "Election not found" });
        }
        if(election.status !== "active"){
            await transaction.rollback();
            return res.status(400).json({ error: "Election is not active" });
        }
        const encryptedVote = encryptVote(
            voteChoice,
            election.publicKey
        );

        // Create vote
        const vote = await Vote.create(
            {
                userId: req.user.id,
                electionId,
                encryptedVote
            },
            { transaction }
        );

        // Add audit entry inside same transaction
        await addAuditEntry(
            "VOTE_CAST",
            req.user.id,
            { electionId },
            transaction
        );

        await transaction.commit();

        res.json({ message: "Vote cast securely" });

    } catch (err) {
        await transaction.rollback();

        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ error: "You already voted" });
        }

        res.status(500).json({ error: err.message });
    }
};
