// Test script for Shamir sharing

async function runTest() {
    console.log("Starting Shamir Test...");
    // Need to login to get a token to create election
    // Instead of doing full API auth, maybe I can just test the encryption.service.js first to ensure split/reconstruct works with PEM.
    const { generateKeyPair, splitPrivateKey, reconstructPrivateKey } = require("./src/security/encryption.service");
    
    console.log("1. Generating Key Pair...");
    const { privateKey } = generateKeyPair();
    
    console.log("2. Splitting Private Key...");
    const shares = splitPrivateKey(privateKey, 5, 3);
    console.log("Generated 5 shares. First share:", shares[0].substring(0, 50) + "...");

    console.log("3. Reconstructing Private Key with 3 shares...");
    const subsetShares = [shares[0], shares[2], shares[4]];
    const reconstructed = reconstructPrivateKey(subsetShares);

    if (privateKey === reconstructed) {
        console.log("SUCCESS! Reconstructed key matches the original private key.");
    } else {
        console.log("FAILED! Reconstructed key does not match.");
    }
}

runTest().catch(console.error);
