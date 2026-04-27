const crypto = require("crypto");
const secrets = require("secrets.js-grempe");
// Generate RSA key pair
exports.generateKeyPair = () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem"
        }
    });

    return { publicKey, privateKey };
};

// Encrypt vote using public key
exports.encryptVote = (voteData, publicKey) => {
    const encrypted = crypto.publicEncrypt(
        publicKey,
        Buffer.from(voteData)
    );

    return encrypted.toString("base64");
};

// Decrypt vote using private key
exports.decryptVote = (encryptedVote, privateKey) => {
    const decrypted = crypto.privateDecrypt(
        privateKey,
        Buffer.from(encryptedVote, "base64")
    );

    return decrypted.toString();
};

// Split private key into shares
exports.splitPrivateKey = (privateKeyPem, numShares = 5, threshold = 3) => {
    // Convert PEM string to hex
    const privateKeyHex = secrets.str2hex(privateKeyPem);
    // Generate shares
    const shares = secrets.share(privateKeyHex, numShares, threshold);
    return shares;
};

// Reconstruct private key from shares
exports.reconstructPrivateKey = (shares) => {
    try {
        // Combine shares to get hex
        const combinedHex = secrets.combine(shares);
        // Convert hex back to PEM string
        const privateKeyPem = secrets.hex2str(combinedHex);
        return privateKeyPem;
    } catch (err) {
        throw new Error("Invalid or insufficient shares provided to reconstruct private key.");
    }
};
