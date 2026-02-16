const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");

router.get("/secure-test", authenticate, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});

module.exports = router;
