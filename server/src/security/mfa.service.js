const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

exports.generateMFASecret = async (email) => {
    const secret = speakeasy.generateSecret({
        name: `SecureVoting (${email})`
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
        base32: secret.base32,
        qrCode
    };
};

exports.verifyMFAToken = (token, secret) => {
    return speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 1
    });
};
