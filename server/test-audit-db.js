const db = require("./src/config/database");
const Audit = require("./src/models/audit.model");

async function test() {
    await db.authenticate();
    const entries = await Audit.findAll({
        order: [["createdAt", "ASC"], ["id", "ASC"]]
    });
    console.log("Total entries:", entries.length);
    for (let i = 0; i < entries.length; i++) {
        console.log(`Index: ${i}, ID: ${entries[i].id}, Action: ${entries[i].action}, PrevHash: ${entries[i].previousHash.substring(0, 8)}..., CurHash: ${entries[i].currentHash.substring(0, 8)}...`);
    }
    process.exit(0);
}

test().catch(console.error);
