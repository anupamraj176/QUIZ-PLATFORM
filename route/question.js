const express = require("express");
const xlsx = require("xlsx");
const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });
const CSE = require("../model/CSE");
const ECE = require("../model/ECE");
const Math = require("../model/Math");
const MEA = require("../model/MEA");
// const question = require("../model/question");
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
  // console.log(id);
  if (id !== process.env.ADMINNO) {
    // console.log(id);
    return res.json({ status: -1 });
  }
  var stream = req.headers.stream;
  var data = {}
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
      await CSE.findByIdAndUpdate({ _id: req.headers.id }, data)
      res.json({ status: 0 });
    } else if (stream === MEAvalue) {
      await MEA.findByIdAndUpdate({ _id: req.body.id }, data)
      res.json({ status: 0 });
    } else if (stream === ECEvalue) {
      await ECE.findByIdAndUpdate({ _id: req.body.id }, data)
      res.json({ status: 0 });
    } else if (stream === Mathvalue) {
      await Math.findByIdAndUpdate({ _id: req.body.id }, data)
      res.json({ status: 0 });
    } else {
      res.json({ status: -1 });
    }
    // res.json({ status: 0 });
  } catch (err) {
    res.json({ status: -2 });
  }
});

router.post("/updatequestion", jwtaccess, async (req, res) => {
  const id = req.userid;
  // console.log(id);
  if (id !== process.env.ADMINNO) {
    // console.log(id);
    return res.json({ status: -1 });
  }
  var stream = req.body.stream;
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
  // if (req.file !== undefined) {
  //   data['img'] = {
  //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
  //     contentType: 'image/png'
  //   }
  //   fs.unlinkSync(path.join(__dirname + "/uploads/" + req.file.filename));
  // }

  try {
    console.log(stream);
    if (stream === CSEvalue) {
      // console.log(data);
      await CSE.findByIdAndUpdate({ _id: req.body.id }, data)
      res.json({ status: 0 });
    } else if (stream === MEAvalue) {
      await MEA.findByIdAndUpdate({ _id: req.body.id }, data)
      res.json({ status: 0 });
    } else if (stream === ECEvalue) {
      await ECE.findByIdAndUpdate({ _id: req.body.id }, data)
      res.json({ status: 0 });
    } else if (stream === Mathvalue) {
      await Math.findByIdAndUpdate({ _id: req.body.id }, data)
      res.json({ status: 0 });
    } else {
      res.json({ status: -1 });
    }
  } catch (err) {
    res.json({ status: -1 });
  }
});


router.post("/sendAdminquestion", jwtaccess, async (req, res) => {
  try {
    const id = req.userid;
    // console.log(id);
    if (id !== process.env.ADMINNO) {
      // console.log(id);
      return res.json({ status: -1 });
    }
    var stream = req.body.stream;
    var data = new Array();
    if (stream === CSEvalue) {
      var ques = await CSE.find({});
      for (i in ques) {
        data.push({
          question: ques[i].ques,
          choice: ques[i].choice,
          id: ques[i]._id,
          image: ques[i].img,
          answer: ques[i].answer
        });

      }
    } else if (stream === MEAvalue) {
      var ques = await MEA.find({});
      for (i in ques) {
        data.push({
          question: ques[i].ques,
          choice: ques[i].choice,
          id: ques[i]._id,
          image: ques[i].img,
          answer: ques[i].answer
        });

      }
    } else if (stream === ECEvalue) {
      var ques = await ECE.find({});
      for (i in ques) {
        data.push({
          question: ques[i].ques,
          choice: ques[i].choice,
          id: ques[i]._id,
          image: ques[i].img,
          answer: ques[i].answer
        });
      }
    } else if (stream === Mathvalue) {
      var ques = await Math.find({});
      for (i in ques) {
        data.push({
          question: ques[i].ques,
          choice: ques[i].choice,
          id: ques[i]._id,
          image: ques[i].img,
          answer: ques[i].answer
        });

      }
    }

    res.json({ status: 0, data });
  } catch (error) {
    res.json({ status: -1 });
  }
});

router.post("/deleteAdminquetion", jwtaccess, async (req, res) => {
  try {
    const id = req.userid;
    // console.log(id);
    if (id !== process.env.ADMINNO) {
      // console.log(id);
      return res.json({ status: -1 });
    }
    var stream = req.body.stream;
    var data = new Array();
    if (stream === CSEvalue) {
      // var ques = await CSE.find({});
      await CSE.findByIdAndDelete(req.body.id)
    } else if (stream === MEAvalue) {
      // var ques = await MEA.find({});
      await MEA.findByIdAndDelete(req.body.id)
    } else if (stream === ECEvalue) {
      // var ques = await ECE.find({});
      await ECE.findByIdAndDelete(req.body.id)
    } else if (stream === Mathvalue) {
      // var ques = await Math.find({});
      await Math.findByIdAndDelete(req.body.id)
    }

    res.json({ status: 0 });
  } catch (error) {
    res.json({ status: -1 });
  }
});



router.post("/sendquestion", async (req, res) => {
  try {
    var stream = req.body.stream;
    var data = new Array();
    if (stream === CSEvalue) {
      var ques = await CSE.find({});
      for (i in ques) {
        data.push({
          question: ques[i].ques,
          choice: ques[i].choice,
          id: ques[i]._id,
          image: ques[i].img
        });

      }
    } else if (stream === MEAvalue) {
      var ques = await MEA.find({});
      for (i in ques) {
        data.push({
          question: ques[i].ques,
          choice: ques[i].choice,
          id: ques[i]._id,
          image: ques[i].img
        });

      }
    } else if (stream === ECEvalue) {
      var ques = await ECE.find({});
      for (i in ques) {
        data.push({
          question: ques[i].ques,
          choice: ques[i].choice,
          id: ques[i]._id,
          image: ques[i].img
        });
      }
    } else if (stream === Mathvalue) {
      var ques = await Math.find({});
      for (i in ques) {
        data.push({
          question: ques[i].ques,
          choice: ques[i].choice,
          id: ques[i]._id,
          image: ques[i].img
        });

      }
    }

    res.json({ status: 0, data });
  } catch (error) {
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
        img: { data: Buffer.alloc(0), contentType: '' } // default empty image
      });
    }

    if (questionsToInsert.length === 0) {
      return res.json({ status: -3, message: "No valid questions found in sheet" });
    }

    // Insert questions into database
    let collectionModel;
    if (stream === CSEvalue) collectionModel = CSE;
    else if (stream === ECEvalue) collectionModel = ECE;
    else if (stream === MEAvalue) collectionModel = MEA;
    else if (stream === Mathvalue) collectionModel = Math;

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

