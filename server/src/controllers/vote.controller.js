const sequelize = require("../config/database");
const { Vote, Election, Candidate, VotingReceipt } = require("../models/associations");
const { encryptVote } = require("../security/encryption.service");
const { addAuditEntry } = require("../security/hashChain.service");

exports.castVote = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { electionId, voteChoice } = req.body; // voteChoice should be candidateId
        const now = new Date();
        const userId = req.user.id;

        // 1. Validate Election
        const election = await Election.findByPk(electionId);
        if (!election) {
            await transaction.rollback();
            return res.status(404).json({ error: "Election not found" });
        }
        if (now < election.startTime) {
            await transaction.rollback();
            return res.status(400).json({ error: "Election has not started yet" });
        }
        if (now > election.endTime) {
            await transaction.rollback();
            return res.status(400).json({ error: "Election is closed" });
        }

        // 2. Validate Candidate
        const candidate = await Candidate.findOne({
            where: { id: voteChoice, electionId: electionId }
        });
        if (!candidate) {
            await transaction.rollback();
            return res.status(400).json({ error: "Invalid candidate for this election" });
        }

        // 3. Check if user already voted (via Receipt)
        const existingReceipt = await VotingReceipt.findOne({
            where: { userId, electionId }
        });
        if (existingReceipt) {
            await transaction.rollback();
            return res.status(400).json({ error: "You have already voted in this election" });
        }

        // 4. Encrypt Vote and Save (Anonymous)
        const encryptedVote = encryptVote(
            voteChoice.toString(), 
            election.publicKey
        );

        await Vote.create(
            { electionId, encryptedVote },
            { transaction }
        );

        // 5. Create Audit Log
        const auditEntry = await addAuditEntry(
            "VOTE_CAST",
            userId,
            { electionId: parseInt(electionId) },
            transaction
        );

        // 6. Create Voting Receipt
        await VotingReceipt.create(
            {
                userId,
                electionId,
                transactionHash: auditEntry.currentHash
            },
            { transaction }
        );

        await transaction.commit();

        res.json({ 
            message: "Vote cast securely",
            receipt: auditEntry.currentHash // Give user a way to verify their vote was recorded
        });

    } catch (err) {
        await transaction.rollback();
        console.log(err);
        res.status(500).json({ error: err.message });
        
    }
};