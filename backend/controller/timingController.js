const Timing = require('../model/timing');
require('dotenv').config();

exports.getTiming = async (req, res) => {
    try {
        let timing = await Timing.findOne();
        if (!timing) {
            const defaultStart = new Date(Date.now() - 60 * 60 * 1000);
            const defaultEnd = new Date(Date.now() + 2 * 60 * 60 * 1000);
            timing = await Timing.create({
                startTime: defaultStart,
                endTime: defaultEnd
            });
        }
        res.json({
            SDate: timing.startTime.toString(),
            EDate: timing.endTime.toString(),
            presentDate: new Date().toString()
        });
    } catch (error) {
        console.error("Error fetching timing:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.setTiming = async (req, res) => {
    try {
        const id = req.userid;
        if (id !== process.env.ADMINNO) {
            return res.json({ status: -1, message: "Unauthorized" });
        }
        const { startTime, endTime } = req.body;
        let timing = await Timing.findOne();
        if (timing) {
            timing.startTime = new Date(startTime);
            timing.endTime = new Date(endTime);
            await timing.save();
        } else {
            timing = await Timing.create({
                startTime: new Date(startTime),
                endTime: new Date(endTime)
            });
        }
        res.json({ status: 0, message: "Timing updated successfully" });
    } catch (error) {
        console.error("Error setting timing:", error);
        res.status(500).json({ status: -2, error: error.message });
    }
};
