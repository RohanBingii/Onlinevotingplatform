const { verifyIntegrity} = require("../security/hashChain.service");

exports.checkIntegrity = async (req, res) => {
    try {
        const valid = await verifyIntegrity();

        if (!valid) {
            return res.status(500).json({
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
            return res.status(500).json({
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