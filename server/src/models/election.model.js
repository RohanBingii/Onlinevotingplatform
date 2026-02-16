const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Election = sequelize.define("Election", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    publicKey: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    privateKey: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("upcoming", "active", "closed"),
        defaultValue: "upcoming"
    }
}, {
    tableName: "elections",
    timestamps: true
});

module.exports = Election;
