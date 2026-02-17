const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Candidate = sequelize.define("Candidate", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    party: {
        type: DataTypes.STRING,
        allowNull: true
    },
    manifesto: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    electionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "candidates",
    timestamps: true
});

module.exports = Candidate;
