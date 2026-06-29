const express = require("express");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtaccess = require("../middleware/jwtverification");
const User = require("../model/user");
const CSE = require("../model/CSE");
const ECE = require("../model/ECE");
const Math = require("../model/Math");
const MEA = require("../model/MEA");
const {CSEvalue, ECEvalue, MEAvalue, Mathvalue} = require('../config/config');
const router = express.Router();


router.post(
    "/register",
    async (req, res) => {
        try {
            let user = await User.findOne({ applicationNo: req.body.applicationNo });
            if (user) {
                return res.status(400).json({ status: 1 });
            }
            // bcrypt.hash(req.body.password, 10, async function (err, hash) {
            var arr = new Array();
            user = await User.create({
                applicationNo: req.body.applicationNo,
                password: req.body.password,
                name: req.body.name || "",
                program: req.body.program || "",
                stream: req.body.stream || "",
                answer: arr
            })
                .then((user) => {
                    res.status(200).json({ status: 0 })
                })
                .catch((error) => res.status(400).json({ status: -1 }));
            // });
        } catch (error) {
            console.error("Register Error:", error);
            res.status(500).json({ status: -2, error: error.message });
        }
    }
);



router.post(
    "/login",
    async (req, res) => {
        const { applicationNo, password } = req.body;
        // console.log(req.body)
        try {
            let user = await User.findOne({ applicationNo: applicationNo });
            if (!user) {
                return res.json({ status: -1 })
            }
            // const match = await bcrypt.compare(password, user.password);
            if (password == user.password) {
                if (user.attempted == true) {
                    return res.json({ status: 2 })
                }
                data = {
                    id: user._id
                }
                await User.findOneAndUpdate({ applicationNo: applicationNo },{attempted : true})
                var authtoken = jwt.sign(data, process.env.JWT_TOKEN);
                res.status(200).json({ status: 0, authtoken, stream: user.stream });
            } else {
                return res.status(400).json({ status: -1 });
            }

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ status: -2, error: error.message });
        }
    }
);

router.post('/access', jwtaccess, async (req, res) => {
    try {
        var user = await User.findById(req.userid);
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        var data = {
            name: user.name,
            stream: user.stream,
            applicationNo: user.applicationNo,
            program: user.program,
            answer: user.answer,
            visited: user.visited,
            review: user.review
        }
        res.json({ status: 0, data });
    } catch (error) {
        res.status(500).json({ status: -2 });
    }
})


router.post('/sendDatatoAdmin', jwtaccess, async (req, res) => {
    try {
        const id = req.userid;
        // console.log(id);
        if (id !== process.env.ADMINNO) {
            // console.log(id);
            return res.json({ status: -1 });
        }
        // console.log(req.body.stream)
        let data = await User.find({stream : req.body.stream});
        res.json({ status: 0, data });
    } catch (error) {
        res.status(500).json({ status: -2 });
    }
})

router.post('/userDatatoAdmin', jwtaccess, async (req, res) => {
    try {
        const id = req.userid;
        // console.log(id);
        if (id !== process.env.ADMINNO) {
            // console.log(id);
            return res.json({ status: -1 });
        }
        // console.log(req.body);
        let data = await User.findOne({_id:req.body.id});
        // console.log(data)
        res.json({ status: 0, data });
    } catch (error) {
        res.status(500).json({ status: -2 });
    }
})



router.post('/adddata', jwtaccess, async (req, res) => {
    try {
        var user = await User.findByIdAndUpdate(req.userid, {
            name: req.body.name,
            stream: req.body.stream,
            program: req.body.program
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.status(500).json({ status: -2 });
    }
})


router.post('/uploadAnswer', jwtaccess, async (req, res) => {
    try {
        const answers = req.body.answer || [];
        const currentUser = await User.findById(req.userid);
        if (!currentUser) {
            return res.status(400).json({ status: -1, message: "User not found" });
        }

        // Calculate marks dynamically (+2 per correct answer)
        let marks = 0;
        const stream = currentUser.stream;

        if (stream === CSEvalue) {
            for (let j = 0; j < answers.length; j++) {
                const q = await CSE.findById(answers[j].key);
                if (q && answers[j].value === q.answer) {
                    marks += 2;
                }
            }
        } else if (stream === ECEvalue) {
            for (let j = 0; j < answers.length; j++) {
                const q = await ECE.findById(answers[j].key);
                if (q && answers[j].value === q.answer) {
                    marks += 2;
                }
            }
        } else if (stream === MEAvalue) {
            for (let j = 0; j < answers.length; j++) {
                const q = await MEA.findById(answers[j].key);
                if (q && answers[j].value === q.answer) {
                    marks += 2;
                }
            }
        } else if (stream === Mathvalue) {
            for (let j = 0; j < answers.length; j++) {
                const q = await Math.findById(answers[j].key);
                if (q && answers[j].value === q.answer) {
                    marks += 2;
                }
            }
        }

        // Save attempted flag, answers, and calculated marks
        const updatedUser = await User.findByIdAndUpdate(req.userid, {
            attempted: true,
            answer: answers,
            marks: marks
        }, { new: true });

        if (!updatedUser) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0, marks: marks });
    } catch (error) {
        console.error("Error during answer submission:", error);
        res.json({ status: -1 });
    }
})

router.post('/uploadAnswermiddle', jwtaccess, async (req, res) => {
    try {
        // console.log(req.body.answer)
        var user = await User.findByIdAndUpdate(req.userid, {
            answer: req.body.answer
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.json({ status: -1 })
    }
})


router.post('/uploadvisited', jwtaccess, async (req, res) => {
    try {
        // console.log(req.body.answer)
        var user = await User.findByIdAndUpdate(req.userid, {
            visited: req.body.answer
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.json({ status: -1 })
    }
})


router.post('/uploadmarkasreview', jwtaccess, async (req, res) => {
    try {
        // console.log(req.body.answer);
        var user = await User.findByIdAndUpdate(req.userid, {
            review: req.body.answer
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.json({ status: -1 })
    }
})

// Pre-login bulk registration (accepts JSON array)
router.post('/bulk-register', jwtaccess, async (req, res) => {
    try {
        const id = req.userid;
        if (!id || !process.env.ADMINNO || id.toString().trim() !== process.env.ADMINNO.toString().trim()) {
            return res.status(403).json({ status: -1, message: "Unauthorized" });
        }

        const candidates = req.body.candidates;
        if (!Array.isArray(candidates)) {
            return res.status(400).json({ status: -1, message: "Invalid format. Expected candidates array." });
        }

        let createdCount = 0;
        let skippedCount = 0;

        for (let cand of candidates) {
            let appNo = cand.applicationNo;
            let password = cand.password;
            if (!appNo || !password) {
                skippedCount++;
                continue;
            }

            appNo = appNo.toString().trim();
            password = password.toString().trim();
            let name = cand.name ? cand.name.toString().trim() : "";
            let program = cand.program ? cand.program.toString().trim() : "";
            let stream = cand.stream ? cand.stream.toString().trim() : "";

            const existingUser = await User.findOne({ applicationNo: appNo });
            if (existingUser) {
                skippedCount++;
                continue;
            }

            await User.create({
                applicationNo: appNo,
                password: password,
                name: name,
                program: program,
                stream: stream,
                answer: []
            });
            createdCount++;
        }

        res.json({ status: 0, message: `Registered ${createdCount} candidates. Skipped ${skippedCount} duplicates.` });
    } catch (error) {
        console.error("Error during bulk registration:", error);
        res.status(500).json({ status: -1, error: error.message });
    }
});

// Pre-login bulk Excel upload
const multer = require("multer");
const xlsx = require("xlsx");
const excelUpload = multer({ storage: multer.memoryStorage() });

router.post('/uploadCandidates', jwtaccess, excelUpload.single('candidatesFile'), async (req, res) => {
    try {
        const id = req.userid;
        if (!id || !process.env.ADMINNO || id.toString().trim() !== process.env.ADMINNO.toString().trim()) {
            return res.status(403).json({ status: -1, message: "Unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({ status: -1, message: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);

        let createdCount = 0;
        let skippedCount = 0;

        for (let row of rows) {
            let appNo = row["Application No"] || row["Application No."] || row["applicationNo"] || row["ApplicationNo"];
            let password = row["Password"] || row["password"] || row["PasswordValue"];
            let name = row["Name"] || row["name"] || row["Candidate Name"] || "";
            let program = row["Category"] || row["program"] || row["Program"] || "";
            let stream = row["Post Applied For"] || row["stream"] || row["Stream"] || "";

            if (!appNo || !password) {
                skippedCount++;
                continue;
            }

            appNo = appNo.toString().trim();
            password = password.toString().trim();
            name = name.toString().trim();
            program = program.toString().trim();
            stream = stream.toString().trim();

            const existingUser = await User.findOne({ applicationNo: appNo });
            if (existingUser) {
                skippedCount++;
                continue;
            }

            await User.create({
                applicationNo: appNo,
                password: password,
                name: name,
                program: program,
                stream: stream,
                answer: []
            });
            createdCount++;
        }

        res.json({ status: 0, message: `Imported ${createdCount} candidates. Skipped ${skippedCount} duplicate/invalid rows.` });
    } catch (error) {
        console.error("Error uploading candidates spreadsheet:", error);
        res.status(500).json({ status: -1, message: error.message });
    }
});

module.exports = router;