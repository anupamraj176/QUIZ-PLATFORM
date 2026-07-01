const ExamAttempt = require('../model/ExamAttempt');
const User = require('../model/user');

exports.startAttempt = async (req, res) => {
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
};

exports.getAttemptStatus = async (req, res) => {
    try {
        const studentId = req.userid;
        const attempt = await ExamAttempt.findOne({ student: studentId });
        res.json({ status: 0, attempt });
    } catch (error) {
        console.error("Error fetching attempt status:", error);
        res.status(500).json({ status: -2, error: error.message });
    }
};

exports.recordViolation = async (req, res) => {
    try {
        const studentId = req.userid;
        const { type } = req.body;

        let attempt = await ExamAttempt.findOne({ student: studentId });
        if (!attempt) {
            return res.status(400).json({ status: -1, message: "No active exam attempt found" });
        }

        if (attempt.status !== 'in_progress') {
            return res.json({ status: 0, attempt });
        }

        attempt.warningCount += 1;
        attempt.violations.push({
            type: type || 'generic_violation',
            timestamp: new Date()
        });

        if (attempt.warningCount >= 3) {
            attempt.status = 'auto_submitted';
            attempt.submittedAt = new Date();
            await User.findByIdAndUpdate(studentId, { attempted: true });
        }

        await attempt.save();
        res.json({ status: 0, attempt });
    } catch (error) {
        console.error("Error recording violation:", error);
        res.status(500).json({ status: -2, error: error.message });
    }
};
