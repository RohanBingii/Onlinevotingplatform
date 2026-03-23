const cron = require("node-cron");
const { Op } = require("sequelize");
const Election = require("../models/election.model");

// Run every minute
cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();

        // Update upcoming to active
        await Election.update(
            { status: "active" },
            {
                where: {
                    status: "upcoming",
                    startTime: { [Op.lte]: now }
                }
            }
        );

        // Update active to closed
        await Election.update(
            { status: "closed" },
            {
                where: {
                    status: "active",
                    endTime: { [Op.lte]: now }
                }
            }
        );
        
    } catch (error) {
        console.error("Error running election status cron job:", error);
    }
});