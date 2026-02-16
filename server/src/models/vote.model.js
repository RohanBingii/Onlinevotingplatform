const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vote = sequelize.define("Vote", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_vote_per_user_election"
    },

    electionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_vote_per_user_election"
    },

    encryptedVote: {
        type: DataTypes.TEXT,
        allowNull: false
    }

}, {
    tableName: "votes",
    timestamps: true
});

module.exports = Vote;
