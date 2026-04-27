const User = require("./user.model");
const Election = require("./election.model");
const Vote = require("./vote.model");
const Candidate = require("./candidate.model");
const VotingReceipt = require("./votingReceipt.model");
const AuditLog = require("./audit.model");

// Election → Vote (1:N)
Election.hasMany(Vote, { foreignKey: "electionId", onDelete: "CASCADE" });
Vote.belongsTo(Election, { foreignKey: "electionId" });

// Election → Candidate (1:N)
Election.hasMany(Candidate, { foreignKey: "electionId", onDelete: "CASCADE" });
Candidate.belongsTo(Election, { foreignKey: "electionId" });

// User → VotingReceipt (1:N)
User.hasMany(VotingReceipt, { foreignKey: "userId", onDelete: "CASCADE" });
VotingReceipt.belongsTo(User, { foreignKey: "userId" });

// Election → VotingReceipt (1:N)
Election.hasMany(VotingReceipt, { foreignKey: "electionId", onDelete: "CASCADE" });
VotingReceipt.belongsTo(Election, { foreignKey: "electionId" });

module.exports = { User, Election, Vote, Candidate, VotingReceipt, AuditLog };