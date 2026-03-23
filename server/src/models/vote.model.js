const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vote = sequelize.define("Vote", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // userId REMOVED to preserve ballot secrecy
    electionId: {
        type: DataTypes.INTEGER,
        allowNull: false
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