const User = require("./user.model");
const Election = require("./election.model");
const Vote = require("./vote.model");
const Candidate = require("./candidate.model");

// User → Vote (1:N)
User.hasMany(Vote, {
    foreignKey: "userId",
    onDelete: "CASCADE"
});
Vote.belongsTo(User, {
    foreignKey: "userId"
});

// Election → Vote (1:N)
Election.hasMany(Vote, {
    foreignKey: "electionId",
    onDelete: "CASCADE"
});
Vote.belongsTo(Election, {
    foreignKey: "electionId"
});

// Election → Candidate (1:N)
Election.hasMany(Candidate, {
    foreignKey: "electionId",
    onDelete: "CASCADE"
});
Candidate.belongsTo(Election, {
    foreignKey: "electionId"
});

module.exports = {
    User,
    Election,
    Vote,
    Candidate
};
