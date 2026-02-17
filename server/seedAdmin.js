const fs = require("fs");
const path = require("path");

// Load .env from correct path
require("dotenv").config({ path: path.join(__dirname, ".env") });

const sequelize = require("./src/config/database");
const User = require("./src/models/user.model");
const bcrypt = require("bcrypt");

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        const adminEmail = "admin@votechain.com";
        const adminPassword = "admin123";

        // Check if admin exists
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log("Admin user already exists.");
            await sequelize.close();
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
            name: "System Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            mfaEnabled: false
        });

        console.log(`Admin user created.\nEmail: ${adminEmail}\nPassword: ${adminPassword}`);
    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

seedAdmin();
