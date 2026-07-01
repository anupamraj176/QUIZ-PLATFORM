const xlsx = require('xlsx');
const { getQuestionModel } = require('../model/questionHelper');
const User = require('../model/user');
require('dotenv').config();

exports.generateResult = async (req, res) => {
    try {
        const adminId = req.userid;
        if (!adminId || !process.env.ADMINNO || adminId.toString().trim() !== process.env.ADMINNO.toString().trim()) {
            return res.status(403).json({ status: -1, message: "Unauthorized" });
        }

        let user = await User.find({});
        for (let i in user) {
            if (user[i].answer == undefined) {
                continue;
            }
            let marks = 0;
            const model = getQuestionModel(user[i].program, user[i].stream);
            if (model) {
                for (let j = 0; j < user[i].answer.length; j++) {
                    let q = await model.findById(user[i].answer[j].key);
                    if (q && user[i].answer[j].value === q.answer) {
                        marks += 2;
                    }
                }
            }
            await User.findByIdAndUpdate(user[i]._id, { marks: marks });
        }

        let freshUsers = await User.find({});
        freshUsers.sort((a, b) => (b.marks || 0) - (a.marks || 0));

        let rows = [];
        rows.push(["INDIAN INSTITUTE OF INFORMATION TECHNOLOGY BHAGALPUR"]);
        rows.push(["CANDIDATE EXAM RESULTS SUMMARY"]);
        rows.push([]);
        rows.push(["S.No.", "Application No.", "Candidate Name", "Category", "Post Applied For (Stream)", "Marks Obtained", "Status"]);

        freshUsers.forEach((u, index) => {
            rows.push([
                index + 1,
                u.applicationNo || "",
                u.name || "",
                u.program || "",
                u.stream || "",
                u.marks !== undefined ? u.marks : 0,
                u.attempted ? "Submitted" : "Not Submitted"
            ]);
        });

        const worksheet = xlsx.utils.aoa_to_sheet(rows);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Results Summary");

        worksheet["!cols"] = [
            { wch: 8 },   // S.No.
            { wch: 20 },  // Application No.
            { wch: 25 },  // Candidate Name
            { wch: 15 },  // Category
            { wch: 35 },  // Stream
            { wch: 18 },  // Marks Obtained
            { wch: 15 }   // Status
        ];

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="Exam_Results_Summary.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error("Error generating bulk results:", err);
        res.status(500).json({ status: -1, error: err.message });
    }
};

exports.downloadResponse = async (req, res) => {
    try {
        const adminId = req.userid;
        if (!adminId || !process.env.ADMINNO || adminId.toString().trim() !== process.env.ADMINNO.toString().trim()) {
            return res.status(403).json({ status: -1, message: "Unauthorized" });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ status: -2, message: "User not found" });
        }

        let questions = [];
        const model = getQuestionModel(user.program, user.stream);
        if (model) {
            questions = await model.find({});
        }

        let answersMap = new Map();
        if (user.answer) {
            user.answer.forEach((ans) => {
                if (ans && ans.key) {
                    answersMap.set(ans.key.toString(), {
                        option: ans.option,
                        value: ans.value
                    });
                }
            });
        }

        let rows = [];
        rows.push(["CANDIDATE EXAM RESPONSE SHEET"]);
        rows.push([]);
        rows.push(["Application No:", user.applicationNo || ""]);
        rows.push(["Name:", user.name || ""]);
        rows.push(["Category of Post:", user.program || ""]);
        rows.push(["Post Applied for:", user.stream || ""]);
        rows.push(["Marks Obtained:", user.marks !== undefined ? user.marks : ""]);
        rows.push([]);
        rows.push(["S.No.", "Question Statement", "Correct Option", "Candidate Marked Option", "Status"]);

        questions.forEach((q, index) => {
            let ans = answersMap.get(q._id.toString());
            let candidateOption = "Not Attempted";
            let status = "Not Attempted";

            if (ans) {
                let optCode = "A";
                if (ans.option === "option1") optCode = "A";
                else if (ans.option === "option2") optCode = "B";
                else if (ans.option === "option3") optCode = "C";
                else if (ans.option === "option4") optCode = "D";
                else if (ans.option === "option5") optCode = "E";
                else optCode = ans.option;

                candidateOption = `${optCode}. ${ans.value || ""}`;

                if (ans.value === q.answer) {
                    status = "Correct";
                } else {
                    status = "Incorrect";
                }
            }

            let correctOptLabel = "";
            const choicesList = q.choice || [];
            for (let cIdx = 0; cIdx < choicesList.length; cIdx++) {
                if (choicesList[cIdx] === q.answer) {
                    correctOptLabel = String.fromCharCode(65 + cIdx);
                    break;
                }
            }
            let correctOptionText = correctOptLabel ? `${correctOptLabel}. ${q.answer}` : q.answer;

            rows.push([
                index + 1,
                q.question || "",
                correctOptionText || "",
                candidateOption,
                status
            ]);
        });

        const worksheet = xlsx.utils.aoa_to_sheet(rows);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Response Details");

        worksheet["!cols"] = [
            { wch: 8 },   // S.No.
            { wch: 70 },  // Question
            { wch: 30 },  // Correct Option
            { wch: 30 },  // Candidate Option
            { wch: 15 }   // Status
        ];

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="response_${user.applicationNo}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error("Error creating candidate response sheet:", error);
        res.status(500).json({ error: error.message });
    }
};
