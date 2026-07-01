const express = require('express');
const router = express.Router();
const jwtaccess = require('../middleware/jwtverification');
const ExamAttempt = require('../model/ExamAttempt');
const User = require('../model/user');

// Initialize or resume an exam attempt
router.post('/start', jwtaccess, async (req, res) => {
    try {
        const studentId = req.userid;
        const user = await User.findById(studentId);
        if (!user) {
            return res.status(404).json({ status: -1, message: "Student not found" });
        }

        let attempt = await ExamAttempt.findOne({ student: studentId });
        if (!attempt) {
            attempt = await ExamAttempt.create({
                student: studentId,
                exam: `${user.program || "MTech"} - ${user.stream || "General"}`,
                warningCount: 0,
                violations: [],
                status: 'in_progress'
            });
        }

        res.json({ status: 0, attempt });
    } catch (error) {
        console.error("Error starting exam attempt:", error);
        res.status(500).json({ status: -2, error: error.message });
    }
});

// Get current attempt status/warnings
router.get('/status', jwtaccess, async (req, res) => {
    try {
        const studentId = req.userid;
        const attempt = await ExamAttempt.findOne({ student: studentId });
        res.json({ status: 0, attempt });
    } catch (error) {
        console.error("Error fetching attempt status:", error);
        res.status(500).json({ status: -2, error: error.message });
    }
});

// Record a full-screen or focus violation
router.post('/violate', jwtaccess, async (req, res) => {
    try {
        const studentId = req.userid;
        const { type } = req.body; // e.g., 'exit_fullscreen', 'tab_switch', 'window_blur'

        let attempt = await ExamAttempt.findOne({ student: studentId });
        if (!attempt) {
            return res.status(400).json({ status: -1, message: "No active exam attempt found" });
        }

        // If already submitted, ignore new violations
        if (attempt.status !== 'in_progress') {
            return res.json({ status: 0, attempt });
        }

        attempt.warningCount += 1;
        attempt.violations.push({
            type: type || 'generic_violation',
            timestamp: new Date()
        });

        // Trigger auto-submit if warning count reaches 3 or more
        if (attempt.warningCount >= 3) {
            attempt.status = 'auto_submitted';
            attempt.submittedAt = new Date();

            // Mark student as attempted in the main User collection
            await User.findByIdAndUpdate(studentId, { attempted: true });
        }

        await attempt.save();
        res.json({ status: 0, attempt });
    } catch (error) {
        console.error("Error recording violation:", error);
        res.status(500).json({ status: -2, error: error.message });
    }
});

module.exports = router;
