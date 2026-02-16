const User = require("./user.model");
const Election = require("./election.model");
const Vote = require("./vote.model");

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

module.exports = {
    User,
    Election,
    Vote
};
