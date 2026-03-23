const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ error: "User already exists" });
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

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            mfaEnabled: user.mfaEnabled
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (username !== undefined) {
            // Check if username is already taken by someone else
            if (username) {
                const existing = await User.findOne({ where: { username } });
                if (existing && existing.id !== user.id) {
                    return res.status(400).json({ error: "Username already taken" });
                }
            }
            user.username = username;
        }

        if (password && password.trim() !== '') {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.json({ 
            message: "Profile updated successfully", 
            user: { 
                id: user.id, 
                email: user.email, 
                username: user.username, 
                role: user.role,
                mfaEnabled: user.mfaEnabled
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
