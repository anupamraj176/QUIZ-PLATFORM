const express = require("express");
const xlsx = require("xlsx");
const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });
const { getQuestionModel } = require("../model/questionHelper");
const User = require("../model/user");
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/imgUpd");
const router = express.Router();
var jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtaccess = require("../middleware/jwtverification");
const {CSEvalue, ECEvalue, MEAvalue, Mathvalue} = require('../config/config')
// const value = require('../config/config')

router.post("/addquestion", jwtaccess, upload.single('img'), (req, res) => {
  const id = req.userid;
  // console.log(id);
  if (id !== process.env.ADMINNO) {
    // console.log(id);
    return res.json({ status: -1 });
  }
  var stream = req.body.stream;
  var program = req.body.program || "MTech";
  var arr = new Array();
  arr.push(req.body.option1);
  arr.push(req.body.option2);
  arr.push(req.body.option3);
  arr.push(req.body.option4);
  var answer = req.body[req.body.answer];
  var data = {
    ques: req.body.ques,
    choice: arr,
    answer: answer,
    program: program
  }
  if (req.file !== undefined) {
    data['img'] = {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image/png'
    }
    fs.unlinkSync(path.join(__dirname + "/uploads/" + req.file.filename));
  }

  try {
    // console.log(stream);
    if (stream === CSEvalue) {
      CSE.create(data)
        .then(() => {
          res.json({ status: 0 });
        })
        .catch(() => {
          res.json({ status: -1 });
        });
    } else if (stream === MEAvalue) {
      MEA.create(data)
        .then(() => {
          res.json({ status: 0 });
        })
        .catch(() => {
          res.json({ status: -1 });
        });
    } else if (stream === ECEvalue) {
      ECE.create(data)
        .then(() => {
          res.json({ status: 0 });
        })
        .catch(() => {
          res.json({ status: -1 });
        });
    } else if (stream === Mathvalue) {
      Math.create(data)
        .then(() => {
          res.json({ status: 0 });
        })
        .catch(() => {
          res.json({ status: -1 });
        });
    } else {
      res.json({ status: -1 });
    }
  } catch (err) {
    res.json({ status: -1 });
  }
});

router.post("/updatequestionImage", jwtaccess, upload.single('img'), async (req, res) => {
  const id = req.userid;
  if (id !== process.env.ADMINNO) {
    return res.json({ status: -1 });
  }
  var stream = req.headers.stream;
  var program = req.headers.program || "MTech";
  var data = {}
  if (req.file !== undefined) {
    data['img'] = {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image/png'
    }
    fs.unlinkSync(path.join(__dirname + "/uploads/" + req.file.filename));
  }

  try {
    const model = getQuestionModel(program, stream);
    if (!model) {
      return res.json({ status: -1 });
    }
    await model.findByIdAndUpdate({ _id: req.headers.id || req.body.id }, data);
    res.json({ status: 0 });
  } catch (err) {
    console.error("Error updating question image:", err);
    res.json({ status: -2 });
  }
});

router.post("/updatequestion", jwtaccess, async (req, res) => {
  const id = req.userid;
  if (id !== process.env.ADMINNO) {
    return res.json({ status: -1 });
  }
  var stream = req.body.stream;
  var program = req.body.program || "MTech";
  var arr = new Array();
  arr.push(req.body.option1);
  arr.push(req.body.option2);
  arr.push(req.body.option3);
  arr.push(req.body.option4);
  var answer = req.body[req.body.answer];
  var data = {
    ques: req.body.ques,
    choice: arr,
    answer: answer
  }

  try {
    const model = getQuestionModel(program, stream);
    if (!model) {
      return res.json({ status: -1 });
    }
    await model.findByIdAndUpdate({ _id: req.body.id }, data);
    res.json({ status: 0 });
  } catch (err) {
    console.error("Error updating question text:", err);
    res.json({ status: -1 });
  }
});


router.post("/sendAdminquestion", jwtaccess, async (req, res) => {
  try {
    const id = req.userid;
    if (id !== process.env.ADMINNO) {
      return res.json({ status: -1 });
    }
    var stream = req.body.stream;
    var program = req.body.program || "MTech";

    const model = getQuestionModel(program, stream);
    if (!model) {
      return res.json({ status: -1 });
    }

    const ques = await model.find({});
    const data = ques.map(q => ({
      question: q.ques,
      choice: q.choice,
      id: q._id,
      image: q.img,
      answer: q.answer
    }));

    res.json({ status: 0, data });
  } catch (error) {
    console.error("Error fetching admin questions:", error);
    res.json({ status: -1 });
  }
});

router.post("/deleteAdminquetion", jwtaccess, async (req, res) => {
  try {
    const id = req.userid;
    if (id !== process.env.ADMINNO) {
      return res.json({ status: -1 });
    }
    var stream = req.body.stream;
    var program = req.body.program || "MTech";
    const model = getQuestionModel(program, stream);
    if (!model) {
      return res.json({ status: -1 });
    }
    await model.findByIdAndDelete(req.body.id);
    res.json({ status: 0 });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.json({ status: -1 });
  }
});



router.post("/sendquestion", jwtaccess, async (req, res) => {
  try {
    const user = await User.findById(req.userid);
    if (!user) {
      return res.json({ status: -1, message: "User not found" });
    }

    var stream = user.stream;
    var program = user.program || "MTech";
    const model = getQuestionModel(program, stream);
    if (!model) {
      return res.json({ status: -1, message: "Invalid stream or program" });
    }

    const ques = await model.find({});
    const data = ques.map(q => ({
      question: q.ques,
      choice: q.choice,
      id: q._id,
      image: q.img
    }));

    res.json({ status: 0, data });
  } catch (error) {
    console.error("Error sending candidate questions:", error);
    res.json({ status: -1 });
  }
});

router.post("/uploadexcel", jwtaccess, excelUpload.single('excelFile'), async (req, res) => {
  try {
    const id = req.userid;
    if (id !== process.env.ADMINNO) {
      return res.json({ status: -1, message: "Unauthorized" });
    }

    const stream = req.body.stream;
    const program = req.body.program || "MTech";
    if (!req.file) {
      return res.json({ status: -2, message: "No file uploaded" });
    }

    // Read the workbook from buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const questionsToInsert = [];

    for (const row of rows) {
      // Look for question text columns
      const questionText = row['Question'] || row['Question Text'] || row['ques'] || row['Ques'];
      if (!questionText) continue;

      // Extract options (support A-E or 1-5)
      const choices = [];
      const opt1 = row['Option 1'] || row['Option A'] || row['A'] || row['Opt 1'];
      const opt2 = row['Option 2'] || row['Option B'] || row['B'] || row['Opt 2'];
      const opt3 = row['Option 3'] || row['Option C'] || row['C'] || row['Opt 3'];
      const opt4 = row['Option 4'] || row['Option D'] || row['D'] || row['Opt 4'];
      const opt5 = row['Option 5'] || row['Option E'] || row['E'] || row['Opt 5'];

      if (opt1 !== undefined) choices.push(String(opt1).trim());
      if (opt2 !== undefined) choices.push(String(opt2).trim());
      if (opt3 !== undefined) choices.push(String(opt3).trim());
      if (opt4 !== undefined) choices.push(String(opt4).trim());
      if (opt5 !== undefined) choices.push(String(opt5).trim());

      // Parse answer format
      let answerValue = row['Answer'] || row['Correct Answer'] || row['ans'] || row['Ans'];
      let correctAnswerText = '';

      if (answerValue !== undefined) {
        answerValue = String(answerValue).trim();
        // A-E letters mapping
        if (/^[A-E]$/i.test(answerValue)) {
          const idx = answerValue.toUpperCase().charCodeAt(0) - 65;
          if (idx >= 0 && idx < choices.length) correctAnswerText = choices[idx];
        }
        // 1-5 numbers mapping
        else if (/^[1-5]$/.test(answerValue)) {
          const idx = parseInt(answerValue, 10) - 1;
          if (idx >= 0 && idx < choices.length) correctAnswerText = choices[idx];
        }
        // Direct text match mapping
        else {
          const match = choices.find(c => c.toLowerCase() === answerValue.toLowerCase());
          correctAnswerText = match ? match : answerValue;
        }
      }

      questionsToInsert.push({
        ques: questionText,
        choice: choices,
        answer: correctAnswerText,
        program: program,
        img: { data: Buffer.alloc(0), contentType: '' } // default empty image
      });
    }

    if (questionsToInsert.length === 0) {
      return res.json({ status: -3, message: "No valid questions found in sheet" });
    }

    // Insert questions into database
    const collectionModel = getQuestionModel(program, stream);

    if (!collectionModel) {
      return res.json({ status: -4, message: "Invalid stream selected" });
    }

    await collectionModel.insertMany(questionsToInsert);
    res.json({ status: 0, count: questionsToInsert.length });

  } catch (error) {
    console.error("Excel import error:", error);
    res.status(500).json({ status: -5, error: error.message });
  }
});

module.exports = router;

