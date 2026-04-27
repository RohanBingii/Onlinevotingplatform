const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const sequelize = require("./config/database");

// Require associations so all models sync properly
const { User, Election, Candidate, Vote, AuditLog } = require("./models/associations");

async function wipe() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
        
        // Wipe and recreate tables, leaving them empty
        await sequelize.sync({ force: true }); 
        
        console.log("Database wiped completely. All tables are now empty.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Wiping failed:", err);
        process.exit(1);
    }
}

wipe();
