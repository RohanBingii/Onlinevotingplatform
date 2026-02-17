const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword
        });

        res.json({ message: "User registered successfully", user });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Invalid credentials" });

        // If MFA enabled → DO NOT issue JWT yet
        if (user.mfaEnabled) {
            const tempToken = jwt.sign(
                { id: user.id, type: "mfa_temp" },
                process.env.JWT_SECRET,
                { expiresIn: "5m" }
            );
            return res.json({
                mfaRequired: true,
                userId: user.id,
                tempToken
            });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        // Only issue JWT if MFA not enabled
        

        return res.json({
            token
        });


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
