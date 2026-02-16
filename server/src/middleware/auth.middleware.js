const jwt = require("jsonwebtoken");
const { User } = require("../models/associations");
exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

exports.requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

exports.authorize = (...allowedRoles) => {
    return async (req, res, next) => {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        if(!allowedRoles.includes(user.role)){
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
};

