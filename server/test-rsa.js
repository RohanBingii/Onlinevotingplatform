const crypto = require("crypto");
const secrets = require("secrets.js-grempe");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
});

const data = "hello world";
const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(data)).toString("base64");

try {
    const wrongData = encrypted.substring(0, encrypted.length - 2) + "==";
    console.log("Trying wrong data...");
    crypto.privateDecrypt(privateKey, Buffer.from(wrongData, "base64"));
} catch(e) {
    console.error("Wrong data error:", e.message);
}

try {
    const { privateKey: wrongKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });
    console.log("Trying wrong key...");
    crypto.privateDecrypt(wrongKey, Buffer.from(encrypted, "base64"));
} catch(e) {
    console.error("Wrong key error:", e.message);
}

// What happens if we combine garbage shares?
const shares = secrets.share(secrets.str2hex("this is a test"), 5, 3);
// change a character
shares[0] = shares[0].substring(0, 10) + "0" + shares[0].substring(11);
try {
    const combined = secrets.hex2str(secrets.combine([shares[0], shares[1], shares[2]]));
    console.log("Reconstructed garbage key:", combined.substring(0, 50));
    console.log("Trying garbage key...");
    crypto.privateDecrypt(combined, Buffer.from(encrypted, "base64"));
} catch(e) {
    console.error("Garbage key error:", e.message);
}
