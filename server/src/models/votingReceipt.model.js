const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VotingReceipt = sequelize.define("VotingReceipt", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_receipt_per_user_election"
    },
    electionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_receipt_per_user_election"
    },
    transactionHash: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "voting_receipts",
    timestamps: true,
    indexes: [
        {
            unique: true, // This enforces the unique constraint at the database level!
            fields: ['userId', 'electionId'],
            name: 'unique_vote_per_user_election'
        }
    ]
});

module.exports = VotingReceipt;