const { verifyIntegrity } = require("../security/hashChain.service");
const Audit = require("../models/audit.model");

exports.checkIntegrity = async (req, res) => {
    try {
        const valid = await verifyIntegrity();

        if (!valid) {
            return res.status(200).json({
                integrity: false,
                message: "Audit log tampering detected"
            });
        }

        res.json({
            integrity: true,
            message: "Audit log integrity verified"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyElection = async (req, res) => {
    try {
        const { id } = req.params;
        const valid = await verifyIntegrity(id);

        if (!valid) {
            return res.status(200).json({
                integrity: false,
                message: "Blockchain tampering detected for this election."
            });
        }

        res.json({
            integrity: true,
            message: `Election #${id} records are cryptographically secured and verified intact.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = await Audit.findAll({
            order: [["createdAt", "DESC"], ["id", "DESC"]],
            limit
        });
        res.json({ logs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};