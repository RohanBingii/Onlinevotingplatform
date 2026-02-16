require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 8000;

// Load models
require("./models/user.model");
require("./models/election.model");
require("./models/vote.model");

// Load associations AFTER models
require("./models/associations");

async function startServer() {
    try {
        // 1️⃣ Test DB connection
        await sequelize.authenticate();
        console.log("Database connected successfully");

        // 2️⃣ Sync models (DEV only)
        await sequelize.sync({ alter: true });
        console.log("Database synced successfully");

        // 3️⃣ Start server
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error("Startup error:", err);
    }
}

startServer();
