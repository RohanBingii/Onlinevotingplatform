
const { User } = require("../models/associations");
const { generateMFASecret, verifyMFAToken } = require("../security/mfa.service");
const jwt = require("jsonwebtoken");
// Step 1: Generate Secret + QR
exports.setupMFA = async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });

        const { base32, qrCode } = await generateMFASecret(user.email);

        user.mfaSecret = base32;
        await user.save();

        res.json({
            message: "Scan QR code in Authenticator app",
            qrCode
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Step 2: Verify Token & Enable MFA
exports.enableMFA = async (req, res) => {
    try {
        const { token } = req.body;
        
        const user = await User.findByPk(req.user.id);

        const isValid = verifyMFAToken(token, user.mfaSecret);

        if (!isValid) {
            return res.status(400).json({ error: "Invalid MFA token" });
        }

        user.mfaEnabled = true;
        await user.save();

        res.json({ message: "MFA enabled successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyLoginMFA = async (req, res) => {
    const { tempToken, otp } = req.body;

    let decoded;

    try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired temp token" });
    }

    if (decoded.type !== "mfa_temp") {
        return res.status(403).json({ error: "Invalid token type" });
    }

    const user = await User.findByPk(decoded.id);

    const valid = verifyMFAToken(otp, user.mfaSecret);

    if (!valid) {
        return res.status(400).json({ error: "Invalid OTP" });
    }

    const finalToken = jwt.sign(
        {
            id: user.id,
            role: user.role,
            mfaVerified: true
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );

    res.json({ token: finalToken });
};
