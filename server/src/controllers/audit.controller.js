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