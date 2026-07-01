const xlsx = require("xlsx");
const { getQuestionModel } = require("../model/questionHelper");
const User = require("../model/user");
const path = require("path");
const fs = require("fs");
require('dotenv').config();

exports.addQuestion = async (req, res) => {
  const id = req.userid;
  if (id !== process.env.ADMINNO) {
    return res.json({ status: -1 });
  }
  const stream = req.body.stream;
  const program = req.body.program || "MTech";
  const arr = [
    req.body.option1,
    req.body.option2,
    req.body.option3,
    req.body.option4
  ];
  const answer = req.body[req.body.answer];
  const data = {
    ques: req.body.ques,
    choice: arr,
    answer: answer,
    program: program
  };

  if (req.file !== undefined) {
    data['img'] = {
      data: fs.readFileSync(path.join(__dirname, '../uploads', req.file.filename)),
      contentType: req.file.mimetype
    };
    fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
  }

  try {
    const model = getQuestionModel(program, stream);
    if (!model) {
      return res.json({ status: -1 });
    }
    await model.create(data);
    res.json({ status: 0 });
  } catch (err) {
    console.error("Error adding question manually:", err);
    res.json({ status: -1 });
  }
};

exports.updateQuestionImage = async (req, res) => {
  const id = req.userid;
  if (id !== process.env.ADMINNO) {
    return res.json({ status: -1 });
  }
  const stream = req.headers.stream;
  const program = req.headers.program || "MTech";
  const data = {};

  if (req.file !== undefined) {
    data['img'] = {
      data: fs.readFileSync(path.join(__dirname, '../uploads', req.file.filename)),
      contentType: req.file.mimetype
    };
    fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
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
};

exports.updateQuestion = async (req, res) => {
  const id = req.userid;
  if (id !== process.env.ADMINNO) {
    return res.json({ status: -1 });
  }
  const stream = req.body.stream || req.headers.stream;
  const program = req.body.program || req.headers.program || "MTech";
  const arr = [
    req.body.option1 || req.body.choice?.[0],
    req.body.option2 || req.body.choice?.[1],
    req.body.option3 || req.body.choice?.[2],
    req.body.option4 || req.body.choice?.[3]
  ].filter(Boolean);

  const answer = req.body[req.body.answer] || req.body.answer;
  const data = {
    ques: req.body.ques || req.body.question,
    choice: arr.length > 0 ? arr : req.body.choice,
    answer: answer
  };

  try {
    const model = getQuestionModel(program, stream);
    if (!model) {
      return res.json({ status: -1 });
    }
    const questionId = req.body.id || req.headers.id;
    await model.findByIdAndUpdate({ _id: questionId }, data);
    res.json({ status: 0 });
  } catch (err) {
    console.error("Error updating question text:", err);
    res.json({ status: -1 });
  }
};

exports.sendAdminQuestions = async (req, res) => {
  try {
    const id = req.userid;
    if (id !== process.env.ADMINNO) {
      return res.json({ status: -1 });
    }
    const stream = req.body.stream;
    const program = req.body.program || "MTech";

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
};

exports.deleteQuestion = async (req, res) => {
  try {
    const id = req.userid;
    if (id !== process.env.ADMINNO) {
      return res.json({ status: -1 });
    }
    const stream = req.body.stream || req.headers.stream;
    const program = req.body.program || req.headers.program || "MTech";
    const questionId = req.body.id || req.headers.id;

    const model = getQuestionModel(program, stream);
    if (!model) {
      return res.json({ status: -1 });
    }
    await model.findByIdAndDelete(questionId);
    res.json({ status: 0 });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.json({ status: -1 });
  }
};

exports.sendCandidateQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.userid);
    if (!user) {
      return res.json({ status: -1, message: "User not found" });
    }

    const stream = user.stream;
    const program = user.program || "MTech";
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
};

exports.bulkUploadQuestions = async (req, res) => {
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

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const questionsToInsert = [];

    for (const row of rows) {
      const questionText = row['Question'] || row['Question Text'] || row['ques'] || row['Ques'];
      if (!questionText) continue;

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

      let answerValue = row['Answer'] || row['Correct Answer'] || row['ans'] || row['Ans'];
      let correctAnswerText = '';

      if (answerValue !== undefined) {
        answerValue = String(answerValue).trim();
        if (/^[A-E]$/i.test(answerValue)) {
          const idx = answerValue.toUpperCase().charCodeAt(0) - 65;
          if (idx >= 0 && idx < choices.length) correctAnswerText = choices[idx];
        }
        else if (/^[1-5]$/.test(answerValue)) {
          const idx = parseInt(answerValue, 10) - 1;
          if (idx >= 0 && idx < choices.length) correctAnswerText = choices[idx];
        }
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
        img: { data: Buffer.alloc(0), contentType: '' }
      });
    }

    if (questionsToInsert.length === 0) {
      return res.json({ status: -3, message: "No valid questions found in sheet" });
    }

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
};
