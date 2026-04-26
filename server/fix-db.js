const sequelize = require("./src/config/database");

async function fix() {
    await sequelize.authenticate();
    await sequelize.query('TRUNCATE TABLE votes, voting_receipts, audit_logs RESTART IDENTITY CASCADE;');
    console.log("Database reset successfully.");
    process.exit(0);
}

fix().catch(console.error);
