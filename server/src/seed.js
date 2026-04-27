const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const sequelize = require("./config/database");
const bcrypt = require("bcrypt");
const { generateKeyPair, splitPrivateKey } = require("./security/encryption.service");

// Require associations so all models (including VotingReceipt) sync properly
const { User, Election, Candidate } = require("./models/associations");

async function seed() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // Wipe and recreate tables

        console.log("Database wiped and synced.");

        // 1. Create Users
        const adminPass = await bcrypt.hash("admin123", 10);

        const admin = await User.create({
            email: "admin@iiita.ac.in",
            password: adminPass,
            role: "admin",
            mfaEnabled: false,
            isVerified: true
        });

        console.log("✅ User created: admin@iiita.ac.in (Verified)");

        // 2. Create Elections
        const keyPair1 = generateKeyPair();
        const shares = splitPrivateKey(keyPair1.privateKey, 5, 3);

        const activeElection = await Election.create({
            title: "Global Tech Board Election 2026",
            description: "Voting for the new board of directors.",
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
            status: "active",
            publicKey: keyPair1.publicKey
        });

        console.log(`✅ Active Election created: ${activeElection.title} (ID: ${activeElection.id})`);
        console.log("🔐 IMPORTANT: Key Shares for this election (save these!):");
        shares.forEach((share, idx) => console.log(`   Share ${idx + 1}: ${share}`));

        // 3. Create Candidates
        await Candidate.bulkCreate([
            {
                name: "Alice Johnson",
                party: "Innovators",
                manifesto: "Focusing on AI safety.",
                electionId: activeElection.id
            },
            {
                name: "Bob Smith",
                party: "Open Source Coalition",
                manifesto: "Free software for all.",
                electionId: activeElection.id
            }
        ]);

        console.log("✅ Candidates created for the active election.");
        console.log("\n🎉 Database seeded successfully! You can now start the server.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();