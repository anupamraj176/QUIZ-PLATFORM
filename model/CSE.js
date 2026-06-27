const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  type: { type: String },
  ques: { type: String },
  img: {
    data: Buffer,
    contentType: String
  },
  choice: [{ type: String }],
  answer: { type: String },
});

module.exports = mongoose.model("cse", schema);
