const crypto = require("crypto");
const Audit = require("../models/audit.model");

function calculateHash(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

exports.addAuditEntry = async (
    action,
    userId = null,
    metadata = {},
    transaction = null
) => {

    const lastEntry = await Audit.findOne({
        order: [["createdAt", "DESC"], ["id", "DESC"]], // Ensure absolute latest
        transaction,
        lock: transaction ? transaction.LOCK.UPDATE : undefined
    });

    const previousHash = lastEntry ? lastEntry.currentHash : "GENESIS";

    const dataToHash = JSON.stringify({
        action,
        userId,
        metadata,
        previousHash
    });

    const currentHash = calculateHash(dataToHash);

    return await Audit.create(
        {
            action,
            userId,
            metadata,
            previousHash,
            currentHash
        },
        { transaction }
    );
};


exports.verifyIntegrity = async (targetElectionId = null) => {
    const entries = await Audit.findAll({
        order: [["createdAt", "ASC"]]
    });

    if (entries.length === 0) {
        // If there are no audit entries, there should be no votes globally.
        // If we are checking a specific election, it should have 0 votes.
        const { Vote } = require("../models/associations");
        if (targetElectionId) {
            const c = await Vote.count({ where: { electionId: parseInt(targetElectionId) }});
            if (c > 0) {
                console.log(`[VERIFY] Failure: Target ${targetElectionId} has votes but Audit table is completely empty!`);
                return false;
            }
        }
        return true;
    }

    for (let i = 0; i < entries.length; i++) {

        const entry = entries[i];

        const recalculatedHash = calculateHash(
            JSON.stringify({
                action: entry.action,
                userId: entry.userId,
                metadata: entry.metadata,
                previousHash: entry.previousHash
            })
        );

        // Check if stored hash matches recalculated
        if (recalculatedHash !== entry.currentHash) {
            console.log(`[VERIFY] Failure: Hash mismatch at entry ID ${entry.id}. Expected: ${entry.currentHash}, Got: ${recalculatedHash}`);
            return false;
        }

        // Check chain linkage (except first entry)
        if (i > 0) {
            if (entry.previousHash !== entries[i - 1].currentHash) {
                console.log(`[VERIFY] Failure: Broken chain linkage at entry ID ${entry.id}. Previous: ${entry.previousHash}, Actual Prev: ${entries[i - 1].currentHash}`);
                return false; 
            }
        }
        else {
            if (entry.previousHash !== "GENESIS") {
                console.log(`[VERIFY] Failure: Genesis block not found. First entry has previousHash: ${entry.previousHash}`);
                return false;
            }
        }
    }

    // NEW SECURITY MEASURE: Check literal vote counts against Audit immutable logs!
    const { Vote } = require("../models/associations"); // dynamically loaded to avoid circular deps
    
    // Tally expected votes from immutable ledger
    const expectedVotesPerElection = {};
    for (const entry of entries) {
        if (entry.action === "VOTE_CAST" && entry.metadata && entry.metadata.electionId) {
            // Force strict integer string normalization
            const eId = String(entry.metadata.electionId);
            expectedVotesPerElection[eId] = (expectedVotesPerElection[eId] || 0) + 1;
        }
    }

    // Verify against physical database
    if (targetElectionId) {
        const strictTargetId = String(targetElectionId);
        // Isolated election check
        const expectedCount = expectedVotesPerElection[strictTargetId] || 0;
        const actualCount = await Vote.count({ where: { electionId: parseInt(strictTargetId) } });
        if (actualCount !== expectedCount) {
            console.error(`[VERIFY] INTEGRITY BREACH: Election ${strictTargetId} expects ${expectedCount} votes but physical DB has ${actualCount}!`);
            return false;
        }
    } else {
        // Global check
        for (const [electionId, expectedCount] of Object.entries(expectedVotesPerElection)) {
            const actualCount = await Vote.count({ where: { electionId: parseInt(electionId) } });
            if (actualCount !== expectedCount) {
                console.error(`[VERIFY] INTEGRITY BREACH: Election ${electionId} expects ${expectedCount} votes but physical DB has ${actualCount}!`);
                return false;
            }
        }
        
        // Ensure no votes were inserted out-of-band entirely
        const totalPhysicalVotes = await Vote.count();
        const totalExpectedVotes = Object.values(expectedVotesPerElection).reduce((a,b) => a+b, 0);
        if (totalPhysicalVotes !== totalExpectedVotes) {
             console.error(`[VERIFY] INTEGRITY BREACH: Expected ${totalExpectedVotes} total votes but DB has ${totalPhysicalVotes}`);
             return false;
        }
    }

    return true;
};

