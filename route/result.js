const express = require('express');
const xlsx = require('xlsx');
const CSE = require('../model/CSE');
const ECE = require('../model/ECE');
const Math = require('../model/Math');
const MEA = require('../model/MEA');
const User = require('../model/user');
const jwtaccess = require('../middleware/jwtverification');
const router = express.Router();
const {CSEvalue, ECEvalue, MEAvalue, Mathvalue} = require('../config/config')

router.get('/Generateresult', async (req, res) => {

    try {
        let user = await User.find({});
        // console.log(user)
        for (i in user) {
            if(user[i].answer==undefined){
                continue;
            }
            var marks = 0;
            // console.log(user[i].stream)
            if (user[i].stream === CSEvalue) {
                for (var j = 0; j < user[i].answer.length; j++) {
                    var q = await CSE.findById(user[i].answer[j].key);
                    if (user[i].answer[j].value === q.answer) {
                        marks++;
                    }
                }
            }else if (user[i].stream === ECEvalue) {
                // console.log('ECE');
                // console.log(user[i]._id);
                for (var j = 0; j < user[i].answer.length; j++) {
                    // console.log(user[i].answer[j].key);
                    var q = await ECE.findById(user[i].answer[j].key);
                    if (user[i].answer[j].value === q.answer) {
                        marks++;
                    }
                }
            }else if (user[i].stream == MEAvalue) {
                // console.log("HERE")
                for (var j = 0; j < user[i].answer.length; j++) {
                    var q = await MEA.findById(user[i].answer[j].key);
                    if (user[i].answer[j].value === q.answer) {
                        marks++;
                    }
                }
            }else if (user[i].stream === Mathvalue) {
                for (var j = 0; j < user[i].answer.length; j++) {
                    var q = await Math.findById(user[i].answer[j].key);
                    if (user[i].answer[j].value === q.answer) {
                        marks++;
                    }
                }
            }
            // console.log(marks)
            await User.findByIdAndUpdate( user[i]._id, { marks: marks });
        }
        res.json({status:0});
    } catch (err) {
        res.json({status:-1});
    }
})

router.get('/downloadResponse/:userId', jwtaccess, async (req, res) => {
    try {
        const adminId = req.userid;
        if (!adminId || !process.env.ADMINNO || adminId.toString().trim() !== process.env.ADMINNO.toString().trim()) {
            console.error("Download response unauthorized: Admin ID mismatch", { tokenAdminId: adminId, envAdminNo: process.env.ADMINNO });
            return res.status(403).json({ status: -1, message: "Unauthorized" });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            console.error("Download response failed: User not found", req.params.userId);
            return res.status(444).json({ status: -2, message: "User not found" });
        }

        let questions = [];
        if (user.stream === CSEvalue) {
            questions = await CSE.find({});
        } else if (user.stream === ECEvalue) {
            questions = await ECE.find({});
        } else if (user.stream === MEAvalue) {
            questions = await MEA.find({});
        } else if (user.stream === Mathvalue) {
            questions = await Math.find({});
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
});

module.exports = router;
