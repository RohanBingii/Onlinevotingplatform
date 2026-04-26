const { verifyIntegrity } = require("./src/security/hashChain.service");
const db = require("./src/config/database");

async function test() {
    await db.authenticate();
    const result = await verifyIntegrity();
    console.log("Global Integrity:", result);
    const result2 = await verifyIntegrity(1); // Assuming 1 is the new election
    console.log("Election 1 Integrity:", result2);
    process.exit(0);
}

test().catch(console.error);
