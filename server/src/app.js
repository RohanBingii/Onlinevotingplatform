const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const voteRoutes = require("./routes/vote.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Security Headers
app.use(helmet());

// CORS
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vote", voteRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "Secure Voting API Running" });
});

module.exports = app;
