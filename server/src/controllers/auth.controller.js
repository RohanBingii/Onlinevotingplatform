const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");

// Configure nodemailer transporter
// For dev testing, we can just log the OTP or set up a generic transport. 
// Using a basic fallback setup (it will log if auth is missing)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "@iiita.ac.in";
        const domainSuffix = allowedDomain.startsWith('@') ? allowedDomain : `@${allowedDomain}`;
        
        if (!email.toLowerCase().endsWith(domainSuffix.toLowerCase())) {
            return res.status(400).json({ error: `Registration restricted. Only ${domainSuffix} emails are allowed.` });
        }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ error: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate 6-digit OTP
        const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

        const user = await User.create({
            email,
            password: hashedPassword,
            verificationOTP,
            otpExpiry
        });

        // Send Email (or log to console for dev)
        try {
            if (process.env.SMTP_USER) {
                await transporter.sendMail({
                    from: '"Secure Voting" <noreply@votingplatform.com>',
                    to: email,
                    subject: 'Verify your Academic Email',
                    text: `Your verification OTP is: ${verificationOTP}. It expires in 10 minutes.`
                });
            } else {
                console.log(`[DEV MODE] OTP for ${email} is: ${verificationOTP}`);
            }
        } catch (mailErr) {
            console.error("Failed to send email:", mailErr);
        }

        res.json({ message: "User registered successfully. Please verify your email.", userId: user.id });

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

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({ 
                error: "Email not verified", 
                unverified: true,
                email: user.email 
            });
        }

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

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email is already verified" });
        }

        if (user.verificationOTP !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ error: "OTP has expired. Please register again or request a new OTP." });
        }

        // Mark as verified
        user.isVerified = true;
        user.verificationOTP = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ message: "Email verified successfully! You can now log in." });

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
