const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const sequelize = require("./config/database");
const User = require("./models/user.model");
const Election = require("./models/election.model");
const Candidate = require("./models/candidate.model");
const Vote = require("./models/vote.model");
const bcrypt = require("bcrypt");
const { generateKeyPair } = require("./security/encryption.service");

async function seed() {
    try {
        await sequelize.sync({ force: true }); // Wipe and recreate tables

        // 1. Create Users
        const adminPass = await bcrypt.hash("admin123", 10);
        const voterPass = await bcrypt.hash("voter123", 10);

        const admin = await User.create({
            email: "admin@securevote.com",
            password: adminPass,
            role: "admin"
        });

        const voter = await User.create({
            email: "voter@securevote.com",
            password: voterPass,
            role: "voter"
        });

        console.log("Users created.");

        // 2. Create Elections
        const keyPair1 = generateKeyPair();
        const keyPair2 = generateKeyPair();
        const keyPair3 = generateKeyPair();

        const activeElection = await Election.create({
            title: "Student Council Election 2026",
            description: "Cast your vote for the next student council president. Your voice matters in shaping our campus future.",
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
            status: "active",
            publicKey: keyPair1.publicKey,
            privateKey: keyPair1.privateKey
        });

        const upcomingElection = await Election.create({
            title: "Annual Board Meeting Vote",
            description: "Upcoming vote for new board members. Review candidates before the election starts.",
            startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Starts in 3 days
            endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Ends in 10 days
            status: "upcoming",
            publicKey: keyPair2.publicKey,
            privateKey: keyPair2.privateKey
        });

        const closedElection = await Election.create({
            title: "Q1 Strategy Referendum",
            description: "Vote results for the Q1 strategy proposal.",
            startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Started 10 days ago
            endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Ended 3 days ago
            status: "closed",
            publicKey: keyPair3.publicKey,
            privateKey: keyPair3.privateKey
        });

        console.log("Elections created.");

        // 3. Create Candidates
        await Candidate.bulkCreate([
            {
                name: "Alice Johnson",
                party: "Progressive Alliance",
                manifesto: "Focusing on sustainability and student welfare improvements.",
                electionId: activeElection.id,
                photoUrl: "https://randomuser.me/api/portraits/women/44.jpg"
            },
            {
                name: "Bob Smith",
                party: "Unity Party",
                manifesto: "Improving campus infrastructure and digital resources.",
                electionId: activeElection.id,
                photoUrl: "https://randomuser.me/api/portraits/men/32.jpg"
            },
            {
                name: "Charlie Brown",
                party: "Independent",
                manifesto: "Transparent governance and regular town halls.",
                electionId: activeElection.id,
                photoUrl: "https://randomuser.me/api/portraits/men/86.jpg"
            }
        ]);

        console.log("Database seeded successfully!");
        process.exit(0);

    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
