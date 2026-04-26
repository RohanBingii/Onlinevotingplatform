const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vote = sequelize.define("Vote", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    timestamps: false
});

module.exports = Vote;