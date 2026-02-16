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
        order: [["createdAt", "DESC"]],
        transaction
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


exports.verifyIntegrity = async () => {
    const entries = await Audit.findAll({
        order: [["createdAt", "ASC"]]
    });

    if (entries.length === 0) return true;

    for (let i = 0; i < entries.length; i++) {

        const entry = entries[i];

        // Recalculate hash from stored data
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
            return false;
        }

        // Check chain linkage (except first entry)
        if (i > 0) {
            if (entry.previousHash !== entries[i - 1].currentHash) {
                return false;
            }
        }
        else {
            if (entry.previousHash !== "GENESIS") {
                return false;
            }
        }
    }

    return true;
};

