/**
 * One-time script to clear old audit_logs that may have been hashed
 * with wrong types (string electionId instead of integer).
 * Run with: node src/clearAuditLogs.js
 * 
 * WARNING: This will also clear VotingReceipts as they reference audit hash values.
 * Users will be able to vote again after running this.
 */
require("dotenv").config();
const sequelize = require("./config/database");
const Audit = require("./models/audit.model");

// Load associations so foreign keys are set up
require("./models/associations");
const VotingReceipt = require("./models/votingReceipt.model");

async function clearAuditLogs() {
    await sequelize.authenticate();
    console.log("Connected to database.");

    const receiptCount = await VotingReceipt.count();
    const auditCount = await Audit.count();

    console.log(`Found ${auditCount} audit log entries and ${receiptCount} voting receipts.`);
    console.log("Clearing VotingReceipts first (to avoid FK constraint)...");
    await VotingReceipt.destroy({ where: {}, truncate: true });
    console.log("Clearing Audit logs...");
    await Audit.destroy({ where: {}, truncate: true });

    console.log("Done! Audit chain reset. Please also truncate the votes table manually if you want a full reset.");
    console.log("SQL: TRUNCATE votes, voting_receipts, audit_logs RESTART IDENTITY CASCADE;");
    await sequelize.close();
}

clearAuditLogs().catch(err => {
    console.error("Error:", err.message);
    process.exit(1);
});
