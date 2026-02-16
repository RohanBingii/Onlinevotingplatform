const crypto = require("crypto");

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
