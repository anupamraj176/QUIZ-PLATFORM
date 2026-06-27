const express = require("express");
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

module.exports = router;
