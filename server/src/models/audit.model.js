const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Audit = sequelize.define("Audit", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },
    previousHash: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    currentHash: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: "audit_logs",
    timestamps: true
});

module.exports = Audit;
