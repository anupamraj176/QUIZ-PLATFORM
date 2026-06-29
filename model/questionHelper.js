const mongoose = require('mongoose');
const { CSEvalue, ECEvalue, MEAvalue, Mathvalue } = require('../config/config');

const questionSchema = new mongoose.Schema({
  type: { type: String },
  ques: { type: String },
  img: {
    data: Buffer,
    contentType: String
  },
  choice: [{ type: String }],
  answer: { type: String }
});

function getQuestionModel(program, stream) {
    let streamKey = "";
    if (stream === CSEvalue) streamKey = "cse";
    else if (stream === ECEvalue) streamKey = "ece";
    else if (stream === MEAvalue) streamKey = "mea";
    else if (stream === Mathvalue) streamKey = "math";
    else return null;
    
    const progKey = (program || "MTech").toLowerCase(); // "mtech" or "phd"
    const modelName = `${progKey}_${streamKey}`; 
    const collectionName = `${progKey}_${streamKey}s`; 
    
    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    }
    return mongoose.model(modelName, questionSchema, collectionName);
}

module.exports = { getQuestionModel };
